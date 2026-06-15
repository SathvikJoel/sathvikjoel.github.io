# Covers & images

There are two separate ways to attach a picture to a post, and they do very different
things. Picking the right one is the whole game.

| Setting | Used by | Where the picture shows | The look |
| --- | --- | --- | --- |
| `cover` | Essays & notes | On the **homepage / stream tile** only | A big image cropped across the top |
| `image` | Any post | **Inside the card** | A contained square (1:1) illustration above the text |

Both are optional. A post with neither simply shows as a clean text tile.

## Where picture files go

Keep a post's pictures alongside it, then point to them with an address that starts
with a slash. A good home for them is:

```
public/posts/<stream>/<post-name>/my-picture.jpg
```

You then refer to that file as `/posts/<stream>/<post-name>/my-picture.jpg` in the
front matter.

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
