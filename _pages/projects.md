---
layout: page
title: projects
permalink: /projects/
description:
nav: true
nav_order: 3
display_categories: [personal, school]
---

{% for category in page.display_categories %}
{% assign categorized_projects = site.projects | where: "category", category %}
{% if categorized_projects.size > 0 %}
<h2 class="category-heading">{{ category }}</h2>
<div class="grid grid-3">
{% assign sorted_projects = categorized_projects | sort: "importance" %}
{% for project in sorted_projects %}
{% include projects.liquid %}
{% endfor %}
</div>
{% endif %}
{% endfor %}
