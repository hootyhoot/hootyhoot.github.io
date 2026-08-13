---
layout: page
title: book recommend
description: text embeddings based book recommendations
img: assets/img/book-recommend.jpg
importance: 1
category: HIDDENpersonal
---

On the summer break after my first year I decided to take a research internship under the university so that I wasn't rotting in bed for 3 months. My task was simple, find something that interested me, then research and implement that idea.

---

Just about 3 months earlier I had bought an E-Reader tablet and even with a huge backlog of books I was still having a hard time finding new books to read, so what if I made something that could help me find new books?

<h4>Planning</h4>
I had a few ideas in mind of what the product should do so I drafted the requirements first:
<ul>
    <li>
        <strong>Simple UI:</strong> First and foremost the UI had to be intuitive to navigate
    </li>
    <li>
        <strong>Recommendations by existing book title:</strong> Most people already have a popular book they like, so let them type the title and find similar books
    </li>
    <li>
        <strong>Recommendations by a description of a book:</strong> For a new reader or someone who wants to get into something new, this was my top feature
    </li>
    <li>
        <strong>Minimal compute resources:</strong> Preferably all preprocessing done before deployment, outsource embeddings compute to APIs rather than local models
    </li>
</ul>

---

First, I decided on the Goodreads top 10000 books dataset since I wanted to recommend <strong>GOOD</strong> books not ones that just happened to be similar but sucked.

Embeddings were also practically free from OpenAI with the <em>text-embedding-3-small</em> model being just $0.02 per million tokens so I settled for that rather than running an embedding model locally.

<h4>Implementation</h4>
The code itself was relatively simple, and splits cleanly into two halves: a preprocessing step that only ever runs once, and the actual Flask app that runs on every request.

For preprocessing, I started from the Goodreads top 10000 books CSV and ran it through a quick language filter first (a lot of the "top 10000" turned out to be non-English editions), then combined each book's title, description, and genres into one blob of text per book and cleaned it up with NLTK: strip URLs and punctuation, lowercase, tokenize, drop stopwords, lemmatize. That cleaned text is what actually gets embedded, not the raw description.

Embedding 10000 books one at a time would've taken forever, so I batched the whole thing through OpenAI's API asynchronously with aiohttp, with a retry loop that backs off for a minute whenever the rate limiter kicks in:

{% raw %}

```python
async def get_openai_embedding(session, text):
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {os.getenv('openai_key')}",
    }
    data = {"input": text, "model": "text-embedding-3-small"}
    async with session.post("https://api.openai.com/v1/embeddings", headers=headers, json=data) as response:
        result = await response.json()
        if "data" in result:
            return result["data"][0]["embedding"]
        elif result.get("error", {}).get("code") == "rate_limit_exceeded":
            await asyncio.sleep(60)
            return await get_openai_embedding(session, text)  # retry
```

{% endraw %}

Once every book has an embedding, I dump the whole dataset to Parquet instead of CSV. Loading 10000 embedding vectors back out of a CSV (parsing floats row by row) is noticeably slower and heavier than just reading a Parquet file, and this file gets loaded fresh every time the app boots.

<h4>The app</h4>
At runtime the Flask app just loads that Parquet file once on startup and answers two kinds of requests:

<ul>
    <li>
        <strong>Search by description:</strong> clean the query the same way the dataset was cleaned, get back a single embedding from OpenAI for it, then run cosine similarity against all 10000 precomputed vectors and return the top 15.
    </li>
    <li>
        <strong>Search by title:</strong> fuzzy-match the input against the book list with fuzzywuzzy first, since nobody types a title exactly right. If the match is confident (92%+), it reuses <em>that book's own precomputed embedding</em> to find similar books &mdash; no OpenAI call needed at all for this path. If it's not confident enough, it just hands back the closest title matches instead of guessing and being wrong about it.
    </li>
</ul>

So in practice, description search is the only thing that ever touches the OpenAI API at request time, and even that's a single cheap embedding call. Wrapped it in a Dockerfile and deployed it from there.

It's still very much a work in progress, but the code is up <a href="https://github.com/hootyhoot/book-recommender">here</a> and there's a live version running at <a href="https://books.mikhail.codes">books.mikhail.codes</a> if you want to actually try finding your next book with it.
