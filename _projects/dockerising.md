---
layout: page
title: dockerising METARbot
description: rebuilding METARbot to be hosted in a container 
img: assets/img/dockerising.jpeg
importance: 3
category: personal
---

This discord bot is being used in over 75 aviation servers and can be invited to your server using this <a href="https://discord.com/oauth2/authorize?client_id=929045807842361404&permissions=3072&scope=bot" target="_blank">link</a>! A demo can be found at the bottom of this page.

---
I haven't touched METARbot in more than a year now but I recently got a notification that my previous hoster 'repl.it' is discontinuing all their free hosting products. And so, I had to figure whether to move hosts, or privately host.

<h4>To migrate or to stay? That is the question.</h4>
The biggest choices online were either vercel.app, fly.io, repl.it's paid plan, or AWS. Both vercel and fly don't support constant listening applications like bots so they were out of the question. Repl.it's paid deployments reserved VM plan was $7 a month, which was way too much to host just 1 or 2 bots. AWS required setup comparable to just using docker on a VM. So in the end I decided on just going the hard but cheap way and renting a VPS, for less than a dollar a month on racknerd's 1GB KVM VPS I get full root access to a VM I can easily SSH into.

Thankfully, I wrote METARbot using Flask which needed exactly 0 changes to the actual python. So the only things that need to be done are preparing it to be built into an image. First we need the Dockerfile which looks like this:
```dockerfile
# syntax=docker/dockerfile:1

FROM python:3.8-slim-buster

WORKDIR /metarbot

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY . .

CMD [ "python3", "./api/main.py"]
```
It's important to note that Docker doesn't work inside your directory but rather in a working directory fully contained inside the Docker container, in this case called **/metarbot**

Then we can create the requirements file which lists out the libraries needed for runtime using the command:

```bash
pip3 freeze > requirements.txt
```

Now with the prep work done we can build the image. The beauty of Docker is that you can build the image on any Docker supported architecture and export it to any other and have it work, but for convenience sake we will build inside the VM that will run it. So, I cloned my work there and ran:
```bash
docker build METARbot/ --tag metarbot
```
This builds a Docker image under the tag **metarbot** so that it's easier to identify later.

Finally to run we simply type:
```bash
docker run -d --restart unless-stopped metarbot
```
This command runs the container in a detached mode which runs in the background, and always attempts to restart in case of failure unless we purposely stop it.

---
Now let's demo the bot!

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/dockerising1.png" title="metar bot trial for KLIA airport" class="img-fluid rounded z-depth-1" %}
        <div class="caption">
            What's the weather like in KLIA maybe?
        </div>
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/dockerising2.png" title="metar bot trial for Changi airport" class="img-fluid rounded z-depth-1" %}
        <div class="caption">
            How about Singapore Changi?
        </div>
    </div>
</div>

<div class="caption">
    <h1>🤔🤔🤔</h1>
    <h4>But what do the numbers mean?!</h4>
</div>

Well, let's try to parse the WMKK example;
```
WMKK 170600Z VRB05KT 9999 SCT018 32/25 Q1008 NOSIG
```
<ul>
    <li>
        <strong>WMKK 170600Z</strong> indicates the ICAO code of KLIA; WMKK, and 170600Z tells us the UTC time and day that the report was made on (17th, 6am UTC time).
    </li>
    <li>
        <strong>VRB05KT 9999</strong> indicates that the wind direction was variable (changing) and blowing at 5 knots, and 9999 means that the visibility was more or equal to 9999 meters.
    </li>
    <li>
        <strong>SCT018 32/25</strong> indicates that there are scattered clouds at 1800 feet and 32/25 means that the temperature was 32C and dewpoint temperature was 25C.
    </li>
    <li>
        <strong>Q1008 NOSIG</strong> indicates that the air pressure was 1008 millibars, and NOSIG means no significant weather changes are expected.
    </li>
</ul>
This system is what real pilots and flightsimmers like me use to plan flights and decide whether it is safe to land or takeoff from an airport. And I hope this bot helps a few people in doing just that! I also plan to add a few more features to the bot later on like automatic parsing into plain english.

