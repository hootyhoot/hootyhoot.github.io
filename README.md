# mikhail.codes

Personal site and CV, built with [Jekyll](https://jekyllrb.com/). No Docker required.

## Run locally

```bash
bundle install
bundle exec jekyll serve
```

Then open <http://localhost:4000>.

## Structure

- `_pages/` — top-level pages (about/home, cv, projects, repositories, news, 404)
- `_projects/` — project detail pages (collection)
- `_news/` — news/log entries (collection)
- `assets/json/resume.json` — CV data, rendered by `_layouts/cv.liquid`
- `_data/repositories.yml` — GitHub username/repos shown on the repositories page
- `_sass/`, `assets/css/main.scss` — design tokens and styles
- `_layouts/`, `_includes/` — templates

## Deploy

Pushing to `master` triggers `.github/workflows/jekyll.yml`, which builds the site and
publishes it via GitHub Pages (Settings → Pages → Source: "GitHub Actions").
