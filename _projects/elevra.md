---
layout: page
title: Elevra
description: an AI job-fit analyser for your CV, on the web and in your browser
importance: 1
category: personal
---

Elevra is something we've been building at StraitsTec. You give it your CV and a job listing, and it tells you how well they fit, which of the job's requirements your CV actually backs up, and what you could change to close the gap. It's live at <a href="https://elevra.straitstec.my" target="_blank">elevra.straitstec.my</a>, and a browser extension that does the same thing right on the job listing is on its way.

The backend isn't open source, so this write-up stays on what it does and how it's put together rather than the nitty-gritty of the scoring.

---

<h4>From recruiters to job seekers</h4>
Elevra started life as an ATS (applicant tracking system) for recruiters: paste a job description, drop in a pile of resumes, and get them ranked with a score and an explanation for each one. I worked on that side too, things like a side-by-side compare view for up to 3 candidates, a shortlist, and the deploy pipeline.

But the more we used it, the more it felt like the person who actually needs the feedback is the one applying. A recruiter just wants a ranking, a job seeker wants to know *why* they'd be ranked low and what to fix. So the website is now one CV against one job, with suggestions.

<div class="figure-row" style="justify-items: center;">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/elevra-result-hd.webp" title="Elevra result view with overview, requirements and suggestions" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="figure-caption">
    A finance internship against a made-up junior accountant's CV. 28%, ouch. The suggestions on the right are the useful part: what to add, what to reword, and why.
</div>

Every requirement in the job ends up in one of a few buckets:
<ul>
    <li>
        <strong>Proven</strong>, your work history actually shows it, not just the skills list.
    </li>
    <li>
        <strong>Partial</strong> or <strong>Ambiguous</strong>, there's something related, but it's not convincing on its own.
    </li>
    <li>
        <strong>Listed only</strong>, it's in your skills section but nothing in your experience backs it up.
    </li>
    <li>
        <strong>Missing</strong>, no evidence anywhere.
    </li>
</ul>
That "listed only" bucket is my favourite, because it's exactly what a human recruiter would catch and a keyword-matching ATS wouldn't.

AI reads the job description and writes the suggestions, but it never decides a score or a status, those come from the matching engine. And if a suggestion quotes a line from your CV, that quote is checked against your actual CV and thrown out if it isn't there. So it can't invent experience you don't have.

---

<div class="beat">
    <p class="beat-emoji">🕵️🕵️🕵️</p>
    <h4>But what about my personal details?!</h4>
</div>

This was the part we spent the most time on. A CV is full of personal information, and we didn't want any of it leaving the user's browser. So the PDF is read *in the browser*, and before anything is sent, Elevra strips out names, emails, phone numbers, IC/passport numbers, addresses, dates of birth and links, replacing them with placeholders like `[NAME]`.

You then get to review exactly what will be sent, put anything back that was removed by mistake, or highlight something else to hide. The server only ever sees the cleaned text, and it never keeps the CV around.

<div class="figure-row cols-2">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/elevra2.webp" title="CV review step showing redacted personal details" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="figure-caption">
    The review step. Name, email and phone are swapped for placeholders, and that's the only version Elevra gets.
</div>

Getting text out of a PDF reliably was its own little adventure. Lots of CV templates draw their bullet points as tiny vector squares or icon-font glyphs instead of actual characters, so a naive extractor gives you one giant run-on paragraph. The browser parser detects those drawn shapes and turns them back into proper bullets, and a parity check keeps its output in line with the server-side parser we used before.

---

<h4>The browser extension</h4>
Copy-pasting job descriptions gets old fast, so the extension brings Elevra onto the listing itself. It works on JobStreet, LinkedIn, Hiredly and Indeed. On a job page a small Elevra button shows up on the side, and clicking it opens a panel that has already read the title, company and full description off the page.

<div class="figure-row figure-row--balanced" style="--ar-1: 0.481fr; --ar-2: 0.485fr;">
    <div>
        {% include figure.liquid loading="eager" path="assets/img/elevra-ext-job.webp" title="Elevra extension panel showing the job it read from the page" %}
    </div>
    <div>
        {% include figure.liquid loading="eager" path="assets/img/elevra-ext-overview.webp" title="Elevra extension panel showing the analysis overview" %}
    </div>
</div>
<div class="figure-caption">
    The panel on a demo job page, before and after analysing, with the same CV as above.
</div>

Some things that made the extension trickier than the website:
<ul>
    <li>
        <strong>Every site is different.</strong> JobStreet tags its elements nicely, LinkedIn has completely different markup depending on whether you're logged in, and Indeed opens jobs in a side pane where the URL changes but the old job can still be on screen for a moment. Each site gets its own extractor, built and tested against saved copies of real listings.
    </li>
    <li>
        <strong>The page shouldn't be able to touch Elevra, and vice versa.</strong> The panel lives in its own shadow DOM so the job site's CSS can't break it, and the CV upload and cleaning happen in an extension page embedded in the panel, so the CV never touches the job site's page at all.
    </li>
    <li>
        <strong>Accounts.</strong> Unlike the website, the extension has sign-in, with a one-time code sent by email so there are no passwords to manage.
    </li>
</ul>

---

<h4>Running it</h4>
Elevra runs on our own server rather than a cloud platform. The app sits behind Caddy and is exposed through a Cloudflare Tunnel, so the server has no open inbound ports. Pushing to the deploy branch builds the frontend on GitHub Actions and then a self-hosted runner on the server picks it up, swaps in the new version, restarts the service and health-checks it. Changes that only touch the extension or the docs skip the deploy entirely.

The extension is heading to Firefox first, then Chrome. If you want to try Elevra in the meantime, the website is free to use, no account needed.
