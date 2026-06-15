# Site Handbook

Welcome. This is the author's guide to the garden — everything you need to write,
organise, and publish a post. It's written for *you, the writer*, not a developer:
no code, just how things work and how to use them.

## What this site is

The site is a **digital garden**. Instead of a flat list of blog posts, writing is
organised into **streams** (Tech, Life, Philosophy, Writings). Each stream is a living
collection you tend over time, and each has its own page and visual style.

Every piece of writing also has a **growth stage** — is it a fresh 🌱 seedling, a 🌿
budding draft, or a settled 🌳 evergreen? The stage is the only "type" a post has; an
unmarked post is simply treated as evergreen.

## The four guides

Read these in order if you're new, or jump straight to what you need:

1. **[Streams](./streams.md)** — what streams are, the ones that exist today and how
   each looks, how to put a post in a stream, and how to start a brand-new stream.
2. **[Writing a post](./writing-posts.md)** — the front matter (the settings block at
   the top of every post), growth stages, where files live, and dates.
3. **[Covers & images](./covers-and-images.md)** — the two ways to add pictures: a
   **cover** that restyles the post's homepage tile, and an in-card **image** for
   illustrated tiles.
4. **[Writing toolkit](./components.md)** — the special building blocks you can drop
   into a post: sidenotes, pull quotes, image grids, callouts, and more.
5. **[The Now page](./now-page.md)** — how the `/now` page works and how to add a new
   dated *now* update.

## The 30-second version

- Create a post inside the stream you want it in.
- Fill in the small settings block at the top (title, date, **topic**, **growthStage**).
- Write in Markdown. Reach for the [toolkit](./components.md) when you want something
  fancier than plain text.
- Add a **cover** if you want the post to stand out on the homepage.
- Save — the post appears in its stream, on the homepage, and in the RSS feed.

> **Tip:** There's a living demo post called **"Writing toolkit"** in the
> Tech stream. It shows every building block with its result side by side. Keep it while
> you're learning; delete it whenever you like.

## This handbook is private

These docs live behind a passphrase. They're rendered from the `docs/` folder, encrypted
at build time (AES-256), and only decrypted in your browser when you unlock **/docs** from
the footer — so even on the live site, no one can read them without the passphrase.

To set or change the passphrase, put it in `astro-site/.docs-password` (a single line,
git-ignored) or the `DOCS_PASSWORD` environment variable, then rebuild. The plaintext is
never shipped to the deployed site; only the encrypted bundle (`public/docs.enc.json`) is.
