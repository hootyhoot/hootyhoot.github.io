---
layout: page
title: stable diffusion study
description: a study in replicate api and vercel deployments
img: assets/img/sdxl.jpg
importance: 1
category: personal
related_publications: false
---

This is a base on which I will build my Book recommendation web app.

Using the replicate API and using the stable diffusion XL model for simple image generation in a Next.js app hosted by Vercel. The site can be accessed <a href="https://sdxl-mikhail-codes.vercel.app">here</a>

More info on the implementation at the bottom.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/sdxl2.jpg" title="stable diffusion generated image" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/sdxl3.jpg" title="stable diffusion generated image" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

These are some of my favorite generations produced by SDXL, on the left an I prompted it to create a sample image but instead it spit out a beautifully vibrant and abstract line art. On the right, I prompted "top down drone view of a future city in Bladerunner style".

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
