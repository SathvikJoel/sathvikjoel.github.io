# Writing a post

Every post is a Markdown file with a small **settings block** at the very top, called
the *front matter*. The settings block tells the site the post's title, when it was
written, which stream it belongs to, and how it should look. Below the block, you write
freely in Markdown.

## Where posts live

A post is **two mirrored folders** that share the same `<post-name>` path: the
**text** lives in the content folder, and the **pictures** live in the public folder.

```
src/content/posts/<post-name>/index.md     ← the post TEXT (this file)
public/posts/<post-name>/                   ← the post's PICTURES & files
```

For example, a post's writing lives at `src/content/posts/my-trip/index.md`,
and its photos live at `public/posts/my-trip/...` (e.g. a `cover.png` and an
`images/` subfolder). You then link to a picture with a slash-prefixed address that
mirrors that path — `/posts/my-trip/cover.png`. See
[Covers & images](./covers-and-images.md) for the details.

> **Which stream is it in?** Not the folder — the **`topic`** frontmatter field decides
> the stream (see [Streams](./streams.md)). The folder name is just the post's URL slug.
> To move a post to another stream, change one line (`topic:`); nothing on disk needs to
> move.

> **Why two folders?** Anything under `public/` is published at the site root exactly
> as-is, which is what lets `/posts/...` image links resolve. An image placed *next to*
> the `index.md` in `src/content/` will **not** be found by a `/posts/...` link — it
> would 404. Keep text in `src/content/`, pictures in `public/`.

- Use **`index.md`** for an ordinary post.
- Use **`index.mdx`** if you want to use any of the building blocks from the
  [Writing toolkit](./components.md). (`.mdx` is just Markdown that also understands
  those blocks.)

> **One folder deep, always.** A post must live at exactly
> `src/content/posts/<post-name>/index.md(x)` — one post folder, then the file. Don't
> nest a post inside extra sub-folders: the post URL is the `<post-name>` segment, so a
> deeper folder would route to the wrong address. The build **fails loudly** if a post
> isn't exactly one level deep, or if its folder name clashes with a stream URL.

## The front matter

The settings block is written between two lines of `---` at the very top of the file:

```yaml
---
title: "A Definitive Guide to Clubbing in Kora"
description: "A short, friendly summary that appears under the title and in previews."
date: 2026-05-29T14:15:03+05:30
topic: life
tags: ["travel", "bangalore"]
growthStage: evergreen
---
```

### What each setting means

| Setting | Required? | What it does |
| --- | --- | --- |
| `title` | **Yes** | The headline of the post. |
| `date` | **Yes** | When it was published. Controls ordering and the "x ago" label. |
| `topic` | **Yes** | Which [stream](./streams.md) the post belongs to. **This field alone decides the stream** — the folder name doesn't have to match. Change it to move a post between streams. Must be one of the defined stream keys, or the build fails. |
| `description` | **Yes** | A one-line summary shown under the title, on tiles, and in search/social previews. Required: it powers the SEO meta description and the OG/Twitter share card, so the build **fails** if it's missing or empty. Aim for ~50–160 characters. |
| `tags` | Optional | Labels for cross-cutting themes. They don't make pages, just describe the post. |
| `growthStage` | Optional | The post's maturity: `seedling`, `budding`, or `evergreen`. Defaults to `evergreen` (see below). |
| `stageIcon` | Optional | Path to a custom icon shown in place of the built-in stage glyph (e.g. `/icons/comet.svg`). The stage itself is unchanged — this only swaps the picture. See [Custom stage icon](#custom-stage-icon). |
| `lastTended` | Optional | The date you last revised the post; shown as "last tended …". |
| `cover` | Optional | A picture that restyles the post's homepage tile. See [Covers & images](./covers-and-images.md). |
| `image` | Optional | A contained illustration shown inside any post's card tile (ideal for transparent art). See [Covers & images](./covers-and-images.md). |
| `tile` | Optional | Force the homepage tile style: `auto` (default), `cover`, `image`, or `plain`. See [Covers & images](./covers-and-images.md#choosing-the-tile-style-tile). |
| `ogImage` | Optional | A custom **share preview** image (the picture shown when you paste the link on WhatsApp/X/etc.). Make it **1200×630** and point to a file in the post's `public/posts/...` folder. If you skip it, a card is generated for you. See [Covers & images](./covers-and-images.md#share-previews-when-you-post-a-link). |
| `ogImageAlt` | Optional | Alt text describing your `ogImage`. |
| `featured` | Optional | Marks a post you're especially proud of. |
| `draft` | Optional | Set to `true` to **hide** a post from every listing — the homepage, its stream page, search, and the RSS feed. Use it for works-in-progress or posts you want tucked away. (The post's own URL still resolves if someone has the direct link; it's *unlisted*, not deleted.) |
| `math` | Optional | Set to `true` if the post contains mathematical notation. |
| `width` | Optional | `standard` (default) or `wide`. Use `wide` for **code-heavy posts** so code blocks get extra room — see [Code blocks & wide posts](#code-blocks--wide-posts). |
| `dropCap` | Optional | `true` (default) shows the large decorative first letter on the opening paragraph. Set to `false` to turn it off for a plainer look. |
| `topGlow` | Optional | `true` (default) shows a soft whitish glow behind the post header that fades out where the body begins. Set to `false` for a flat black header. |

## Every post has a stage

There are no post "types" — a post is just a post. You place it in a **stream** (its
`topic`) and give it a **growth stage** (`growthStage`). The stage is the garden
metaphor for how settled the writing is:

- 🌱 **seedling** — a new, rough thought.
- 🌿 **budding** — developing, partly worked out.
- 🌳 **evergreen** — settled and well-tended.

If you don't set a `growthStage`, the post is treated as **evergreen** — i.e. a finished
piece. So a polished essay is simply an evergreen post; a working draft you keep
revising is a seedling or budding post. The stage shows as a small icon on tiles, in the
breadcrumb, and in the stream feeds, and you can **filter the homepage by stage**.

Posts can also carry **`lastTended`** — the date you last revised it — shown to the
reader as "last tended …". It's handy for notes you grow over time.

## Custom stage icon

By default each stage uses its built-in hand-drawn glyph (the sprout / plant / tree).
If you want a different picture for a particular post — say a comet for a fast-moving
idea — set **`stageIcon`** to the path of an image you've dropped in `public/icons/`:

```yaml
growthStage: seedling
stageIcon: /icons/comet.svg
```

This is **purely cosmetic**: the stage stays `seedling` (or whichever you set), and all
filtering, labels, and ordering behave exactly the same. Only the icon picture changes.

**What file to provide:**

- **Prefer an SVG** — it stays crisp at every size, is tiny, and scales without blur.
- A transparent **PNG** also works; export it square at ~48–64 px.
- The icon **carries its own colour** (it is *not* tinted like the built-in stages), so
  pick colours that read well on the **dark background** — light or accent-coloured strokes.
- Keep it square (a `0 0 24 24` viewBox for SVG is ideal) so it lines up with the others.

**Where to put it:** drop the file in **`public/icons/`** and reference it with a leading
slash, e.g. a file at `public/icons/comet.svg` is referenced as `/icons/comet.svg`.

## A note on dates

Always write the date with the **`+05:30`** time zone (India Standard Time) on the end:

```yaml
date: 2026-05-29T14:15:03+05:30
```

This matters for posts you publish the **same day** you write them. The site is built on
a clock running several hours behind your local time, and a post dated in the "future"
relative to that clock will be silently skipped until it catches up. Using `+05:30`
keeps your timestamp matched to the clock you actually wrote it on, so the post appears
immediately.

## Code blocks & wide posts

Any fenced code block — text between two lines of triple backticks, with the language
right after the opening fence — is automatically rendered with a polished frame:
a tidy title bar, a **copy button** on hover, and syntax colours that match the site.

````md
```python
import torch
print(torch.randn(10))
```
````

You get this on **every** post; nothing extra is needed, and posts with no code look
exactly as before.

### Make a code-heavy post wider

The normal reading column is comfortable for prose but tight for code with long lines.
For tutorials, walkthroughs, or anything code-heavy, add `width: wide` to the front
matter:

```yaml
---
title: "Transformer Activation Functions and their Details"
date: 2024-03-05T11:30:03+05:30
topic: tech
math: true
width: wide
---
```

On a wide post the **whole column gets wider** — text and code share one roomy measure so
nothing looks lopsided — and the table of contents moves inline above the article as a
compact, collapsed **"Contents"** toggle the reader can expand (instead of pinning to the
left margin). On phones everything simply stacks as usual. Leave `width` off (or set it to
`standard`) for ordinary posts.

### Handy code-block extras

Add these after the language on the opening fence:

| Option | What it does |
| --- | --- |
| `title="train.py"` | Shows a file name in the frame's title bar. |
| `{2,5-7}` | Highlights line 2 and lines 5–7. |
| `wrap` | Soft-wraps long lines instead of scrolling (good for very long output). |
| `showLineNumbers` | Adds line numbers down the left edge. |

For example: ` ```python title="model.py" {3} wrap `

## Linking to a section

You can deep-link to any heading or block — in the same post or another one.

- **Headings** are anchored automatically: `## Why we publish` is reachable at
  `#why-we-publish`. Link with `[text](#why-we-publish)` in the same post, or
  `[text](/posts/my-post/#why-we-publish)` from another. **Use the flat
  `/posts/<post-folder>/` form** (the folder name only, no stream) so the link keeps working
  even if the post later moves to a different stream.
- **Any block** can get a short, stable, custom id by ending it with an Obsidian-style
  caret marker, e.g. `We cleaned the data in three passes. ^cleaning`, then linked as
  `[see how](#cleaning)`. Keep each caret id unique within a post.

Full rules and examples live in the [writing toolkit](./components.md#cross-references-block--heading-links).

## Publishing checklist

- [ ] The post has its own folder under `src/content/posts/`, with a `title`, `date`, and `topic`.
- [ ] The `date` ends in `+05:30`.
- [ ] `draft` is removed or set to `false`.
- [ ] You've set a `growthStage` (or left it off to mean evergreen).
- [ ] (Optional) If you want a bespoke stage glyph, you've added `stageIcon` pointing at
      a file in `public/icons/`.
- [ ] If it's code-heavy, you've set `width: wide`.
- [ ] If you want it to shine on the homepage, you've added a
      [cover](./covers-and-images.md).
