# Streams

A **stream** is a themed collection of writing that you grow over time — the garden's
version of a category. Every post belongs to exactly one stream, chosen with the
`topic` setting in its front matter.

Each stream has:

- a **key** — the short name used in the address bar and in front matter (e.g. `life`),
- a **label** — the display name shown on the page (e.g. *Life*),
- a **blurb** — the one-line description under the stream's title,
- a **layout** — the visual style of the stream's page (see below).

Every stream automatically gets its own page at `/posts/<key>` — for example,
`/posts/life`.

## The streams that exist today

| Stream | Address | Style | What lives here |
| --- | --- | --- | --- |
| **Tech** | `/posts/tech` | Masonry | Machine learning, math, and the craft of building software. |
| **Life** | `/posts/life` | Column | Travel, exams, applications, and growing up. |
| **Fun** | `/posts/fun` | Column | The random things I think about for the fun of it. |
| **Philosophy** | `/posts/philosophy` | Masonry | Slow thoughts on how to think, live, and pay attention. |
| **Writings** | `/posts/writings` | List | Short reads — one small idea at a time. |

## The three stream styles

The **layout** decides how a stream page presents its posts. Three styles are
available:

### Masonry *(Tech, Philosophy)*

A multi-column grid of cards, like a pinboard. Cards vary in height and flow around
each other. This is the richest, most visual style — best for streams where posts have
covers, images, or a mix of lengths. It's the same look as the homepage garden.

### Column *(Life, Fun)*

A single column of preview cards, one per row, in a narrow centred width. Calmer than
masonry and easy to scan top-to-bottom. Best for personal writing you want read more or
less in order, without the busyness of a multi-column grid.

### List *(Writings)*

A tight, dated index — one line per post, showing the year and month next to the title.
No cards, no images, just a clean run of links. Best for short, frequent notes where
the title says it all. (Inspired by Steph Ango's writing list.)

> **Writings are kept plain.** Posts in the Writings stream are written as plain
> paragraphs — no decorative building blocks (icon lists, pull-quotes, feature cards,
> and the like), just text. Many also set `dropCap: false` for an even quieter look.

## Putting a post in a stream

Set the `topic` to the stream's **key** in the post's front matter:

```yaml
topic: life
```

That's it. The post now appears on the Life stream page, on the homepage, and in the
feed. A post can only be in one stream at a time.

> Use **tags** (a separate setting) for finer cross-cutting themes within or across
> streams — tags don't create pages, they just label the post.

## Starting a new stream

A new stream needs two things and then its page builds itself:

1. **Add it to the site's stream list.** Give it a `key`, a `label`, a `blurb`, and
   pick one of the three layout styles (`masonry`, `column`, or `list`).
2. **Allow the new key as a `topic`** so posts are permitted to use it.

Once both are done, the stream page appears at `/posts/<key>`, and any post whose
`topic` matches the new key shows up there. Write at least one post in the stream so the
page isn't empty.

> Newly added streams behave exactly like the existing ones — the only choice you're
> really making is which of the three **styles** fits the kind of writing you'll put
> there.
