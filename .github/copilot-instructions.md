# Copilot Instructions

This file documents conventions and structure of this repository for use by AI agents and contributors.

This site was migrated from Hugo to **Astro** in June 2026. The Astro project lives
at the **repository root**. The original hand-built Hugo + PaperMod site is preserved
on the **`hugo-old`** branch.

---

## Tech stack & structure

- **Framework:** [Astro](https://astro.build/) (static output), Tailwind CSS, TypeScript,
  with a little SolidJS for stateful components. Content is Markdown / MDX.
- **Key folders:**
  - `src/pages/` — routes (`index.astro`, `about.astro`, `resume.astro`, `now/`,
    `posts/[topic]/[slug].astro`, `search/`, `404.astro`, `rss.xml.ts`, etc.).
  - `src/content/posts/<topic>/<slug>/index.md(x)` — blog posts.
  - `src/content/now/` — dated "Now" snapshots (separate collection; kept out of the
    garden, RSS, and search).
  - `src/content/config.ts` — content collection schemas (frontmatter validation).
  - `src/components/` — UI + `src/components/mdx/` custom MDX components.
  - `src/consts.ts` — site config: `TOPICS` (streams), nav `LINKS`, `SOCIALS`.
  - `public/` — static assets served at the site root (e.g. `public/resume.pdf` -> `/resume.pdf`).
  - `docs/` — the private writer handbook (see below).
  - `scripts/build-docs.mjs` — encrypts `docs/` into `public/docs.enc.json` at build time.

## Build, dev & preview

```bash
npm install                                              # first time only
DOCS_PASSWORD='garden-test' npm run dev -- --port 4399   # dev server
DOCS_PASSWORD='garden-test' npm run build                # production build -> dist/
npm run preview                                          # preview the built site
```

- `npm run build` runs `astro check` (type check) then `astro build`. A `prebuild`
  step (`build-docs.mjs`) regenerates the encrypted docs bundle first.
- Restart the dev server after editing `src/content/config.ts` (stale styles otherwise).

---

## Streams (topics)

Blog "streams" are defined in `src/consts.ts` -> `TOPICS`, each with a `KEY`, route, and
`LAYOUT`:

- `masonry` — multi-column preview cards (e.g. **tech**, **philosophy**).
- `column` — single-column framed cards (e.g. **life**).
- `list` — compact text list (e.g. **writings**).

A post's `topic` frontmatter field must match a topic `KEY`.

## Writing a post

Create `src/content/posts/<topic>/<slug>/index.mdx` (use `.mdx` to use custom
components; `.md` is fine for plain prose). Frontmatter is validated by
`src/content/config.ts`. Common fields:

```yaml
title: "My post"
description: "One-line summary."
date: 2026-05-29T14:15:03+05:30
topic: tech
tags: ["meta"]
growthStage: evergreen        # seedling | budding | evergreen
draft: false                  # true hides the post everywhere
unlisted: false               # see below
```

### `draft` vs `unlisted`

- **`draft: true`** — the post is filtered out of the homepage, stream indexes,
  search, RSS, and related-post connections. Use for work in progress.
- **`unlisted: true`** — the post still **builds and is reachable by URL**, but is
  excluded from the homepage, stream indexes, search, RSS, related posts, and the
  sitemap. Use for pages you want to link to privately. The **Writing toolkit**
  (`/posts/tech/toolkit/`) uses this pattern and is linked only from the `/docs`
  handbook. The sitemap exclusion lives in `astro.config.mjs` (`sitemap.filter`).

### Post date / timezone convention

Always write the frontmatter `date` with the IST offset `+05:30` so the timestamp
matches the local clock used to write it:

```yaml
date: 2026-05-29T14:15:03+05:30
```

Unlike the old Hugo build (which dropped future-dated posts), Astro renders posts
regardless of date — but a correct timestamp keeps the relative-date display and the
homepage/stream **sort order** accurate.

---

## Resume

The resume PDF lives at `public/resume.pdf` and is served at:

```
https://sathvikjoel.github.io/resume.pdf
```

There is also a styled HTML resume page at `/resume` (`src/pages/resume.astro`).

### How to update the resume

Overwrite the file, then commit and push:

```bash
cp /path/to/new_resume.pdf public/resume.pdf
```

**Do not rename the file** — `/resume.pdf` is linked from `src/pages/resume.astro`. If
you must rename it, update that reference (and any nav/button links).

---

## Private docs handbook

`docs/*.md` is a writer handbook (how to write posts, use components, etc.). At build
time `scripts/build-docs.mjs` encrypts it (AES-256-GCM) into `public/docs.enc.json`;
the plaintext never ships to `dist/`. The `/docs` page unlocks it in the browser with a
password.

- The password comes from the **`DOCS_PASSWORD`** env var (or a local
  `.docs-password` file). If unset, the build falls back to the default `garden`.
- In CI, `DOCS_PASSWORD` is read from a **repo secret** (see Deployment).

---

## Deployment

The site is built with Astro and deployed to GitHub Pages by
`.github/workflows/gh-pages.yml` (**Deploy Astro site to Pages**), which:

1. Triggers on every **push to `main`** (and via **workflow_dispatch**).
2. Runs `npm ci` then `npm run build`.
3. Uploads `./dist` and deploys it to GitHub Pages.

To trigger a manual deploy:

```bash
gh workflow run gh-pages.yml --repo SathvikJoel/sathvikjoel.github.io --ref main
gh run list --workflow=gh-pages.yml --repo SathvikJoel/sathvikjoel.github.io --limit 3
```

The build reads `DOCS_PASSWORD` from a repo secret
(**Settings -> Secrets and variables -> Actions**). If unset, the docs are still
encrypted with the default password `garden`.

See `.agents/deployment.md` for more detail.
