---
layout: page
title: transcriptions
permalink: /transcriptions/
description:
nav: true
nav_order: 2
display_categories: [椎名 林檎 (Sheena Ringo), 東京事変 (Tokyo Jihen), Other, fun]
horizontal: false
---
storing all of my guitar pro tabs here. when it is done all of them should be available with full pdfs, part-wise pdfs, and videos. i focus mainly on Sheena Ringo tabs and tabs for her backing band Tokyo Jihen as high quality tabs for their works are very hard to find, and their arrangements are decently complex. all of my tabs are free to use and always will be, so long as you refer back to this page and don't try to sell these tabs to people for money/to solicit donations/any other kind of personal gain (which should be common sense).

<!-- pages/projects.md -->
<div class="projects">
{% if site.enable_project_categories and page.display_categories %}
  <!-- Display categorized projects -->
  {% for category in page.display_categories %}
  <a id="{{ category }}" href=".#{{ category }}">
    <h2 class="category">{{ category }}</h2>
  </a>
  {% assign categorized_projects = site.projects | where: "category", category %}
  {% assign sorted_projects = categorized_projects | sort: "importance" %}
  <!-- Generate cards for each project -->
  {% if page.horizontal %}
  <div class="container">
    <div class="row row-cols-1 row-cols-md-2">
    {% for project in sorted_projects %}
      {% include projects_horizontal.liquid %}
    {% endfor %}
    </div>
  </div>
  {% else %}
  <div class="row row-cols-1 row-cols-md-3">
    {% for project in sorted_projects %}
      {% include projects.liquid %}
    {% endfor %}
  </div>
  {% endif %}
  {% endfor %}

{% else %}

<!-- Display projects without categories -->

{% assign sorted_projects = site.projects | sort: "importance" %}

  <!-- Generate cards for each project -->

{% if page.horizontal %}

  <div class="container">
    <div class="row row-cols-1 row-cols-md-2">
    {% for project in sorted_projects %}
      {% include projects_horizontal.liquid %}
    {% endfor %}
    </div>
  </div>
  {% else %}
  <div class="row row-cols-1 row-cols-md-3">
    {% for project in sorted_projects %}
      {% include projects.liquid %}
    {% endfor %}
  </div>
  {% endif %}
{% endif %}
</div>
