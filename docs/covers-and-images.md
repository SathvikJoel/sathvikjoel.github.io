# Covers & images

There are two separate ways to attach a picture to a post, and they do very different
things. Picking the right one is the whole game.

| Setting | Used by | Where the picture shows | The look |
| --- | --- | --- | --- |
| `cover` | Essays & notes | On the **homepage / stream tile** only | A big image cropped across the top |
| `image` | Any post | **Inside the card** | A contained square (1:1) illustration above the text |

Both are optional. A post with neither simply shows as a clean text tile.

## Where picture files go

Pictures don't live next to the post's `index.md` — they live in the **`public/`**
folder, in a path that mirrors the post. (The text lives in `src/content/posts/...`;
the pictures live in `public/posts/...`.)

```
public/posts/<stream>/<post-name>/my-picture.jpg
public/posts/<stream>/<post-name>/images/diagram.jpg   ← an images/ subfolder is fine
```

You then refer to that file from the post with a slash-prefixed address that mirrors
the path — `/posts/<stream>/<post-name>/my-picture.jpg`. **This is the same for all
three kinds of picture:** the `cover`, the square tile `image`, and any in-body
picture (`<Figure src="/posts/.../images/diagram.jpg">`). They all live under
`public/posts/...` and are referenced by their `/posts/...` address.

> An image placed *next to* the `index.md` in `src/content/` will **not** load — a
> `/posts/...` link only resolves to files under `public/`. Keep text in
> `src/content/`, pictures in `public/`.

## Optimize pictures before (or after) you add them

Images in `public/` are served **exactly as-is** — Astro does **not** resize or
compress them. A photo straight from a camera or an AI tool is often 3–13 MB, which
loads slowly on mobile and hurts the Lighthouse score. There's a one-time script that
fixes this **in place** without changing any file names or front-matter paths:

```bash
node scripts/optimize-images.mjs
```

What it does:

- scans `public/posts/` for pictures larger than ~400 KB,
- caps the longest side to 2000 px (never upscales),
- re-encodes in the **same format** (`.jpg` stays `.jpg`, `.png` stays `.png`) with
  good compression — so every `cover:` / `image:` / in-body link keeps working,
- only overwrites a file when the result is genuinely smaller.

Typical savings are **70–90%** with no visible quality loss. Originals are tracked in
git, so you can always restore one with `git checkout -- <path-to-image>`.

Handy variations:

```bash
node scripts/optimize-images.mjs --dry          # preview the savings, write nothing
node scripts/optimize-images.mjs --min 800      # only touch files over 800 KB
node scripts/optimize-images.mjs --max 1600     # cap the longest side to 1600 px
node scripts/optimize-images.mjs public/posts/life/my-trip/harbour.jpg   # one file
```

**Workflow:** drop your full-res pictures into the post folder, run
`node scripts/optimize-images.mjs`, eyeball the results, then commit. Re-running it is
safe — already-small files are skipped.

## `cover` — make a post stand out on the homepage

Adding a **cover** turns the post's tile into a card with a wide image across the top,
the title beneath it, and a small `stream · stage · date` line — the eye-catching
"feature" look. It's perfect for posts you want to draw attention to.

```yaml
cover: "/posts/life/my-trip/harbour.jpg"
coverAlt: "The harbour at dusk"
```

- `cover` is the picture's address.
- `coverAlt` describes the picture for screen readers and when images fail to load.
  Always include it.

**Good to know:**

- A cover **only** changes the homepage and stream tile. The post page itself stays
  clean and normal — no banner. Covers are purely about presentation in the listings.
- Use a **wide, landscape-ish picture**. A single strong photo or illustration reads
  better than a busy collage, because it's cropped to a wide band.

## `image` — a contained tile illustration

The `image` setting places an illustration **inside** the card, above the title and
description, shown whole at a **square (1:1)** size (never cropped). It works on **any post**.
**Transparent illustrations** (line art, simple shapes, cut-out
figures) look especially nice here, since they float directly on the card's dark
background. This is the right choice for a hand-drawn tile that should keep its full shape.

```yaml
image: "/posts/philosophy/my-essay/cover.png"
imageAlt: "A small line drawing of a harbour"
```

- `image` is the picture's address.
- `imageAlt` describes it. Always include it.

**Good to know:**

- The picture is shown whole (never cropped), so it keeps its full shape. Aim for a
  **square (1:1)** image (matching Maggie Appleton's tiles, ~800×800) so it fills the
  tile nicely.
- If a post sets **both** `cover` and `image`, the `cover` banner wins (unless you use
  the `tile` field below to choose).

## Choosing the tile style: `tile`

By default the tile picks its own look: a **cover banner** if you set `cover`, otherwise
a **square image** if you set `image`, otherwise a **plain text** tile. The optional
`tile` field lets you **override** that choice:

```yaml
cover: "/posts/tech/my-post/banner.jpg"
image: "/posts/tech/my-post/art.png"
tile: image   # show the square illustration even though a cover is set
```

| `tile` value | Result |
| --- | --- |
| `auto` *(default)* | cover banner → else square image → else plain text |
| `cover` | force the **wide cropped banner** (needs `cover`) |
| `image` | force the **square uncropped illustration** (needs `image`) |
| `plain` | force a **text-only tile**, ignoring any cover/image |

If you force a style whose picture is missing (e.g. `tile: cover` but no `cover` set),
it falls back gracefully to the next available style, then to plain text. So you can keep
both a `cover` and an `image` on a post and just flip `tile` to decide which the homepage
shows.

## Quick decision guide

- Want a cropped **wide banner** across the top of the tile? → set **`cover`** (or `tile: cover`).
- Want a **whole, uncropped illustration** (especially transparent art) inside the tile?
  → set **`image`** (or `tile: image`) — works on any post.
- Want a **text-only** tile even though the post has a picture? → set **`tile: plain`**.
- Want a picture **inside the body** of a post (with a caption, side by side, or
  full-width)? → that's not a cover or image — use a building block from the
  [Writing toolkit](./components.md) instead.

## Share previews (when you post a link)

You don't have to do anything for this. Every post automatically gets its own **1200×630
share card** — the picture WhatsApp / X / Discord / iMessage show when you paste the link.

- If the post has a **`cover` or `image`**, the card frames that art on the dark canvas.
- If the post has **no picture at all**, the card is built from the **title** (set in our
  Fraunces heading font) with the topic name and the JoeLogs mark. It still looks designed —
  so a text-only post shares just as cleanly as an illustrated one.

These cards are regenerated on every deploy; there's nothing to commit or maintain.

