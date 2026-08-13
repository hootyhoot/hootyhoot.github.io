---
layout: page
permalink: /repositories/
title: repositories
description:
nav: true
nav_order: 4
---

{% if site.data.repositories.github_users %}
<h2 class="category-heading" style="margin-top:0">stats</h2>
<div class="repo-grid">
{% for user in site.data.repositories.github_users %}
{% include repository/repo_user.liquid username=user %}
{% endfor %}
</div>
{% endif %}

{% if site.data.repositories.github_repos %}
<h2 class="category-heading">pinned repos</h2>
<div class="repo-grid repo-grid--pins">
{% for repo in site.data.repositories.github_repos %}
{% include repository/repo.liquid repository=repo %}
{% endfor %}
</div>
{% endif %}
