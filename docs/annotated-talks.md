# Annotated talks (PDF → post)

An *annotated talk* turns a slide deck into a scroll-synced post: on a wide screen the
slides stay pinned on one side while your notes scroll past on the other, crossfading to
the matching slide. On a phone, each slide simply sits above its note. It's native scroll
plus a tiny script — nothing to configure, and it respects reduced-motion settings.

This page is the **repeatable recipe** for going from a slides PDF + your spoken notes to a
finished post. You only ever bring two things: the **deck as a PDF** and your **per-slide
notes**.

## 1. Make the folders

Follow the usual `DDMMYYYY_shortname` convention — one folder for the post, one for the
assets:

```
src/content/posts/<topic>/<DDMMYYYY_shortname>/index.mdx   ← the post
public/posts/<topic>/<DDMMYYYY_shortname>/                 ← the assets (pdf, notes, slides)
```

## 2. Drop in your two inputs

Put the deck and your notes in the **public** asset folder:

```
public/posts/tech/08032026_agentandskills/talk.pdf
public/posts/tech/08032026_agentandskills/notes.txt
```

Write `notes.txt` with **one block per slide, in order**. A simple `Slide N` (or
`Slide N: <heading>`) line followed by what you said over that slide works well — you'll
paste each block in as the scrolling note when you write the post.

## 3. Convert the PDF pages to images

Use `pdftoppm` (from `poppler-utils`, already available in this repo's tooling). Run it
from the asset folder, writing into a `slides/` subfolder:

```bash
cd public/posts/tech/08032026_agentandskills
mkdir -p slides
pdftoppm -png -r 110 talk.pdf slides/slide     # -> slides/slide-01.png, slide-02.png, …
```

Notes on the command:

- **`-r` is the resolution (DPI).** `110`–`150` gives crisp 16:9 slides at a sensible file
  size. Higher (e.g. `200`) is sharper but heavier — a 20-slide deck at `200` can run to
  ~15 MB. Check the total with `du -sh slides/` and re-render at a lower `-r` if it's large.
- **Zero-padding.** `pdftoppm` pads the page number to the width of the largest page, so a
  deck with 10+ pages already gives `slide-01.png`, `slide-02.png`, …. If your deck has
  **fewer than 10 pages** you'll get `slide-1.png` — pad them so they sort correctly:

  ```bash
  cd slides && for f in slide-?.png; do mv "$f" "$(echo "$f" | sed -E 's/slide-([0-9])\.png/slide-0\1.png/')"; done
  ```

## 4. Write the post

Create `index.mdx` with front matter, a short intro for context, then one `<Slide>` per
page — pairing each `slide-0N.png` with that slide's note from `notes.txt`.

```mdx
---
title: "Using Agents and Skills"
description: "A one-line summary for the tile and the share card."
date: 2026-03-08T11:00:00+05:30
topic: tech
topGlow: false
tags: ["talks", "agents", "skills"]
growthStage: evergreen
stageIcon: /icons/talk.svg
cover: /posts/tech/08032026_agentandskills/slides/slide-01.png
coverAlt: "Title slide: Using Agents and Skills"
tile: cover
---

A paragraph or two of context: where you gave the talk, who the audience was, and what
it's about.

<ScrollSlides>
  <Slide image="/posts/tech/08032026_agentandskills/slides/slide-01.png" alt="Title slide">
    The notes you spoke over slide one. **Markdown** and lists work here.
  </Slide>
  <Slide image="/posts/tech/08032026_agentandskills/slides/slide-02.png" alt="The problem">
    …and so on, one `<Slide>` per page.
  </Slide>
</ScrollSlides>

You can also [download the full deck](/posts/tech/08032026_agentandskills/talk.pdf).
```

Two conventions worth keeping for talks:

- **Make the first slide the cover.** Set `cover` to `slide-01.png` and `tile: cover` so
  the post leads with its title slide on the homepage. See [Covers & images](./covers-and-images.md).
- **Use the pushpin stage icon.** Set `stageIcon: /icons/talk.svg` so every talk carries a
  little pinned-note glyph instead of the default growth-stage icon. This is purely the
  icon — the stage stays `evergreen`. See [the custom stage icon notes](./writing-posts.md#custom-stage-icon).

Pass `slidesOn="right"` on `<ScrollSlides>` to pin the deck on the right instead of the left.

## 5. Preview and ship

Run a build (`DOCS_PASSWORD='…' npm run build`) and open the post: the deck should pin and
crossfade as the notes scroll. Keeping `talk.pdf` in the folder gives readers a downloadable
copy; `notes.txt` can stay as a source reference or be removed.

> **The slide count and note count must match** — one `<Slide>` per PDF page. If a page has
> no commentary, give it a short caption anyway so the crossfade has something to show.

There's a live example in the **"Using Agents and Skills"** post in the Tech stream.
