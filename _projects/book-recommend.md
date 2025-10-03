---
layout: page
title: book recommend
description: text embeddings based book recommendations
img: assets/img/book-recommend.jpg
importance: 1
category: personal
related_publications: false
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
The code itself was relatively simple


<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/sdxl1.jpg" title="stable diffusion generated image" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    This is my favorite image generated from SD, I asked for an "Akira" style fisheye image of a bartender and it delivered!
</div>

---
The code itself is simple and can be found <a href="https://github.com/hootyhoot/replicate-sdxl">here</a>.
But this all wasn't just for me to learn JS but rather the replicate API and hosting on Vercel.

First we initialise a Next.js app using:
{% raw %}

```bash
npx create-next-app@latest
```

{% endraw %}
Then we can layout the page by editing the pages.js.

For the replicate call itself:

{% raw %}

```js

import Replicate from "replicate";
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

//the rest of the JS

const output = await replicate.run(
  "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
  {
    input: {
      prompt: "top down drone view of a future city in Bladerunner style"
    }
  }
);

//then the error handling for the response
```

{% endraw %}

Then we can push to Github and deploy on vercel. For that we have to do the following:

We first install Vercel using npx:
{% raw %}

```bash
npx vercel
```

{% endraw %}

Then we can set our environment variables/secrets using the below (allegedly, but I had troubles for the app to see my replicate token as it kept printing no token found. Instead I manually set it in the Vercel website under environment variables)
{% raw %}

```bash
vercel env add REPLICATE_API_TOKEN
```

{% endraw %}

And finally, we can deploy using: (I used all the default deployment settings except to not use tailwind CSS)
{% raw %}

```bash
npx vercel deploy --prod
```

{% endraw %}

Optionally you can also set a custom domain in the vercel dashboard.
