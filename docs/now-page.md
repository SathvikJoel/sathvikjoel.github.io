# The Now page

`/now` is a *now page* — a dated snapshot of what you're focused on at the moment.
It's modelled on [Maggie Appleton's /now](https://maggieappleton.com/now) and the wider
[nownownow.com](https://nownownow.com/about) movement started by Derek Sivers.

It is **separate from your blog posts**: now updates live in their own collection, so they
stay out of the RSS feed, search, and the sitemap, and they carry no growth stage. They
*do* appear as tiles on the garden homepage (with a blue clock state icon and a **Now**
filter option), but their full timeline lives at `/now`.

## How it's structured

- **`/now`** — the stream. Shows **every** update in full, stacked newest-first down a
  vertical timeline (a dashed line with a node at each month). Each month heading links
  to that update's own page.
- **`/now/<slug>`** — each individual update also gets its own page (e.g. `/now/2026-06`),
  with links to the earlier/later updates at the bottom.

## Adding a new update

Create a new file in `src/content/now/`. Name it by year and month so the slugs read
cleanly — for example `2026-06.mdx`.

```mdx
---
title: "June 2026"
date: 2026-06-15T10:00:00+05:30
---

A paragraph or two on where your head and hours are going right now.

## Working on

Whatever you like — these pages support the same components as blog posts
(`Book`, `IconList`, `Card`, sidenotes, and so on).
```

### Front matter

| Field | Required | What it does |
| --- | --- | --- |
| `title` | yes | The month label, e.g. `"June 2026"`. Shown as the heading / timeline node. |
| `date` | yes | Sorts updates (newest at the top of the timeline). **Use the `+05:30` IST offset** (the build drops future-dated entries — same rule as posts). |
| `description` | no | A one-line summary shown **only on the homepage tile** (Now updates surface in the garden grid). It is *not* shown on the `/now` page itself — that page keeps its own generic meta. Handy so the tile reads well. |
| `draft` | no | Set `true` to keep an update out of the build while you write it. |

The newest `date` sits at the top of the timeline; everything else stacks below it in
order. There's nothing else to wire up.

## A note on tone

Now pages are meant to be quick and honest, not polished essays. Update one whenever life
shifts; the date tells readers how stale it might be.
