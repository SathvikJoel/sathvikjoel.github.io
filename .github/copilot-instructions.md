# Copilot Instructions

This file documents conventions and structure of this repository for use by AI agents and contributors.

---

## Resume

The resume is stored as a PDF at `static/resume.pdf`.

Hugo serves everything in `static/` at the root URL, so the resume is publicly accessible at:

```
https://sathvikjoel.github.io/resume.pdf
```

### How to update the resume

To replace the resume with a newer version, simply overwrite the file:

```bash
cp /path/to/new_resume.pdf static/resume.pdf
```

Then commit and push — the GitHub Actions workflow will automatically rebuild and deploy the site.

**Do not rename the file.** The filename `resume.pdf` is referenced in `config.yml` (profile buttons and nav menu). If you must rename it, update both of those references too.

### Where it is linked

- **Homepage profile buttons** — `config.yml` → `params.profileMode.buttons`
- **Top navigation menu** — `config.yml` → `menu.main` (identifier: `Resume`)

---

## Deployment

The site is built with [Hugo](https://gohugo.io/) using the [PaperMod](https://github.com/adityatelange/hugo-PaperMod) theme (loaded as a git submodule).

Deployment is handled by `.github/workflows/gh-pages.yml`, which:
1. Triggers on every push to `main`
2. Builds the site with Hugo
3. Deploys the output to GitHub Pages

To trigger a manual deploy, use the **workflow_dispatch** event from the Actions tab.

### Gotcha: post dates and future-dated posts

The workflow runs `hugo` **without** the `--buildFuture` flag, so any post whose front matter `date` is later than the build moment (in UTC) is silently dropped from the rendered site — it will be missing from the homepage, the section index, and the RSS feed, and the post URL will return 404.

The author works from India (IST, `+05:30`). If you write `date: 2026-05-29T14:15:03+00:00` and push at 14:30 IST, the date is `14:15 UTC` but the CI build happens at `09:00 UTC` — five hours in the "future" — and Hugo skips the post.

**Rule:** always use the IST offset in post front matter so the timestamp matches the local clock used to write it:

```yaml
date: 2026-05-29T14:15:03+05:30
```

Older posts in this repo use `+00:00` and still work because they were committed hours-to-days before the build; do not rely on that for posts you publish the same day.

---

## Summary Section Styling (Dagger + EB Garamond)

All `## Summary` sections in any blog post automatically render with a **† dagger prefix** and **EB Garamond** font. No per-post changes are needed — just use `## Summary` as the heading.

### How it works

Three files were changed to achieve this:

1. **`layouts/partials/extend_head.html`** — EB Garamond is loaded from Google Fonts:
   ```html
   <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Fira+Code:wght@300..700&family=Josefin+Sans:ital,wght@0,100..700;1,100..700&display=swap" rel="stylesheet">
   ```

2. **`assets/css/extended/style.css`** — CSS targets `h2#summary` (Hugo auto-generates this ID from `## Summary`):
   ```css
   .post-content h2#summary::before { content: "† "; font-family: 'EB Garamond', Georgia, serif; }
   .post-content h2#summary { font-family: 'EB Garamond', Georgia, serif; }
   .post-content h2#summary + ol { font-family: 'EB Garamond', Georgia, serif; font-size: 1.1em; line-height: 1.9; }
   ```

3. **Blog post front matter** — no special flags needed; the heading `## Summary` is sufficient.

### To change the font in future

Replace `EB Garamond` in both files above with any Google Font. Update the `@import` URL in `extend_head.html` and the `font-family` values in `style.css`.
