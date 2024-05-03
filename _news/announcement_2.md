---
layout: post
title: Got my first internship!
date: 2024-04-05 16:11:00-0400
inline: false
related_posts: false
---

Research summer internship at The University of Nottingham

---

I am glad to announce that I have been accepted for the guided summer internship program to create and research my own vector database search web app. I am hoping to build a book recommendation system using OpenAI embeddings in a WeaviateDB vector database under a JS web app.

#### Possible Flow

<ol>
    <li>User enters their favorite book</li>
    <li>System checks if that book is already in WeaviateDB</li>
    <li>If it is, it uses the embeddings already generated to find its nearest semantic neighbor for similar books.</li>
    <li>If not, I plan to call the ISBNdb API and embed the description of the book on the fly and then similarity search.</li>
</ol>

I'll update here on my progress.
