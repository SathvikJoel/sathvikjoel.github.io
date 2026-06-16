# Developer notes

Non-obvious facts about this codebase — the things you can't infer by browsing files,
and the things that will waste your time or bite you if you don't know them. This is an
internal reference, **not** part of the published writer handbook (see "The encrypted
/docs system" below for why that distinction matters).

> Read this once before touching the content model, the styling, the `/docs` section,
> or the image/favicon pipeline.

---

## Origin & overall shape

- This site is a **fork of the AstroSphere template**, heavily rewritten into a
  Maggie-Appleton-style "digital garden." Leftover template files still sit at the repo
  **root** and are intentionally kept (the root `README.md` references them):
  `_astrosphere.jpg`, `_deploy_netlify.svg`, `_deploy_vercel.svg`, `_lighthouse.png`.
  Don't mistake them for site assets — they're documentation images for the template's
  own README. (Astro ignores files prefixed with `_`, so they are never built.)
- The previous incarnation of this site was a **Hugo + PaperMod** blog. It still exists
  on the `hugo-old` branch. Any documentation or instinct that mentions Hugo, PaperMod,
  `config.yml`, `layouts/`, `static/`, or Google-Fonts `<link>` tags is **stale** — none
  of that applies to the Astro site.

## Path aliases & SolidJS (not React)

- TS path alias is **`@*` → `src/*`** (note: no slash). So it's `@layouts/PageLayout`,
  `@components/Header`, `@lib/utils`, `@consts`, `@types` — **not** `@/layouts`.
- `.tsx` files are **SolidJS**, not React (`tsconfig.json` sets
  `jsxImportSource: "solid-js"`). The interactive islands — `Search.tsx`, `SearchBar.tsx`,
  `ArrowCard.tsx` — use Solid's reactivity (`createSignal`, etc.). Writing React hooks
  here will silently misbehave. Everything else is `.astro`.

## Dark-only theme — the light palette is dead code

- The site is **permanently dark.** `PageLayout.astro` hardcodes `<html lang="en"
  class="dark">`, there is no theme toggle, and `BaseHead` sets
  `<meta name="color-scheme" content="dark">`.
- Tailwind runs in `darkMode: ["class"]` and the color tokens define **both** a light and
  a `.dark` value (e.g. `crimson.light` / `crimson.dark`). Because `.dark` is always on,
  **only the `dark:` variants and `*.dark` color values ever render.** The non-`dark:`
  (light) classes and `*.light` tokens are effectively dead. Don't waste time styling or
  debugging light mode — it never shows. When adding colors, only the `dark` value matters
  in practice.
- `global.css` still has `color-scheme: light` on `html` and a light background — also
  inert, inherited from the template. Leave it or not; it has no visible effect.

## Content model: two collections, lots of front-matter switches

Schemas live in `src/content/config.ts`. There are **two** collections:

- **`posts`** — the garden. Rich schema (see below).
- **`now`** — dated "what I'm focused on" snapshots, deliberately kept **separate** so
  they never appear in the garden, RSS, search, or connections. They live only under
  `/now`. A `now` entry's `title` is the month label, e.g. `"January 2026"`.

Key `posts` fields whose behavior isn't obvious from the name:

| Field | Gotcha |
| --- | --- |
| `topic` | A `z.enum(["tech","life","philosophy","writings"])`. **Must stay in lockstep with `TOPICS` in `src/consts.ts`** — the streams are derived from `TOPICS`, but the schema enum is a separate hardcoded list. Adding a stream means editing **both**. |
| `growthStage` | `seedling` / `budding` / `evergreen`, default **`evergreen`** (an unmarked post is treated as finished). Drives the stage icon/word. |
| `width` | `"wide"` adds the `.wide-col` class on the article, widening the column for code-heavy posts. Pure presentation. |
| `tile` + `cover` + `image` | The homepage tile style is **resolved in `PostCard.astro`**, not the schema. `tile: auto` → cover banner if `cover` set, else square `image`, else plain text. A forced style with a missing picture falls back gracefully. See `covers-and-images.md`. |
| `draft` vs `unlisted` | **Different meanings — see next section.** |

## draft vs unlisted, and the "every post builds a page" trap

- **`draft: true`** — hidden from listings; conventionally a work in progress.
- **`unlisted: true`** — hidden from homepage, stream indexes, search, RSS, and
  related/backlink connections, **but intentionally reachable at its URL** (used for the
  Writing toolkit, linked only from the private `/docs`).
- **CRITICAL:** `getStaticPaths` in `src/pages/posts/[topic]/[slug].astro` maps **every**
  post to a page — it does **not** filter `draft` or `unlisted`. Astro content collections
  don't auto-exclude drafts either. So **a draft post still builds a page at its URL**;
  `draft`/`unlisted` only remove it from *listings*. Don't assume a draft is fully private —
  the HTML exists if someone has the link.
- **Search engines are kept out, though:** draft/unlisted post pages emit
  `<meta name="robots" content="noindex, nofollow">` (via `noindex={draft || unlisted}`
  threaded `[slug].astro` → `PageLayout` → `BaseHead`), and their URLs are **excluded from
  `sitemap-0.xml`**. The sitemap exclusion lives in `astro.config.mjs`: `hiddenPostFragments()`
  reads every post's frontmatter with `gray-matter` at config load and drops any `draft`/`unlisted`
  slug from the sitemap `filter`. (The `filter` only gets a URL string, so it can't see post data —
  hence the separate frontmatter read. Keep this in sync if you change how visibility works.)
- **The listing visibility filter is duplicated inline in every listing surface**, not centralized.
  Grep shows it in `index.astro`, `posts/[topic]/index.astro`, `rss.xml.ts`,
  `search/index.astro` (all `!draft && !unlisted`), and the slug page's `allPosts`
  (`!unlisted` only, for connections). **If you add a new page that lists posts, you must
  re-add this filter yourself** — there is no shared `getVisiblePosts()` helper. This is
  the single easiest thing to forget.

## Front-matter guards enforced at build time

The build fails loudly (rather than shipping broken output) on these:

- **`description` is required + non-empty** (`src/content/config.ts`). It powers the
  `<meta name="description">`, the OG/Twitter card, and search snippets, so an empty one used
  to ship silently. Adding a post without one now fails `astro check`/build.
- **Post folder depth + topic match** (`getStaticPaths` in `[slug].astro`). A post must live
  exactly one level deep — `posts/<topic>/<folder>/index.md(x)` → slug `<topic>/<folder>` — and
  its frontmatter `topic` **must equal** its `<topic>` folder. The slug is split into exactly two
  segments to build the URL; a deeper folder or a folder/`topic` mismatch would silently route to
  the wrong address, so both now `throw` during the build.

## Streams (`TOPICS`) coupling

- `src/consts.ts` `TOPICS` is the source of truth for stream metadata: `KEY`, `LABEL`,
  `BLURB`, and **`LAYOUT`** (`"masonry"` | `"column"` | `"list"` | `"feed"`). The KEY must
  equal the post `topic`. Current mapping: tech/philosophy = `masonry`, life = `column`,
  writings = `list`.
- `StreamFeed.astro` exists but is **unused** (the `"feed"` layout isn't wired up anywhere
  live). Don't assume it's on a code path.

## Animations: staggered reveal, no IntersectionObserver, no view transitions

- The `.animate` fade-in-up is **not** scroll-triggered. `public/js/animate.js` simply
  adds `.show` to **every** `.animate` element on `DOMContentLoaded`, staggered by
  `index * 150ms`. Consequence: on a page with many `.animate` elements, the later ones
  reveal *seconds* late. Use `.animate` sparingly per page; it is a page-load reveal, not
  a viewport reveal.
- To prevent a flash-of-visible-then-hidden, `BaseHead` arms `html.reveal-js` **inline
  before first paint** (only when JS is on and motion is allowed). The CSS hides
  `.animate` only under `.reveal-js`, so no-JS users see content immediately.
- **`prefers-reduced-motion` is honored** globally (`global.css` near the top): it forces
  `.animate { opacity:1 }` and near-zero transition/animation durations. Keep new motion
  behind this guard.
- **Astro view transitions / `<ClientRouter>` are NOT enabled.** The `astro:after-swap` /
  `astro:before-swap` listeners in `BaseHead.astro` and `Footer.astro` are **dormant** —
  they only matter if someone later adds the ViewTransitions router. Navigation is a full
  page load today, which is why `animate.js` also listens for `astro:after-swap` defensively.

## Fonts are self-hosted (not Google Fonts)

- Fonts come from **`@fontsource*` packages imported in `PageLayout.astro`** (Fraunces,
  EB Garamond, Hedvig Letters Serif, Lato, JetBrains Mono) — they are bundled and
  self-hosted, **not** loaded from Google Fonts. Any old note about a
  `fonts.googleapis.com` `<link>` is Hugo-era and wrong here.
- Tailwind font tokens with non-obvious roles: `font-display`/`font-hero` = Fraunces
  (headings/hero), `font-serif` = EB Garamond (reading body), `font-note` = Hedvig Letters
  (sidenotes/margin notes), `font-sans` = Lato (UI/meta), `font-mono` = JetBrains Mono.

## MDX components registry

- `src/components/mdx/registry.ts` is the **single source of truth** for which components
  are available inside posts. It's passed as `components={mdxComponents}` to every
  `<Content />` render (post page, now index, now slug). Add a component **once here** and
  it works everywhere; forget it and the tag renders as literal text.
- Registered **aliases**: `Y` → `Year`, `Callout` → `Reference`.
- Components only work in **`index.mdx`** files, not `index.md` (plain Markdown doesn't
  process JSX). This is enforced by convention, not the build — a component tag in a `.md`
  file silently renders as text.

## Images: `public/` is unoptimized; mirrored folders; the favicon trap

- **Astro does not optimize anything in `public/`.** Covers, tile images, and in-body
  `<Figure>` images are plain `<img src="/posts/...">` with string paths (the schema types
  `cover`/`image` as `z.string()`, not the `image()` helper). They are served byte-for-byte.
- **A post is two mirrored folders**: text in `src/content/posts/<stream>/<post>/index.mdx`,
  pictures in `public/posts/<stream>/<post>/...`. An image placed next to the `.mdx` in
  `src/content` will **404** — `/posts/...` links only resolve to files under `public/`.
- Compress large images with **`node scripts/optimize-images.mjs`** (resizes ≤2000px,
  re-encodes in place in the same format/path, only if smaller). Originals are recoverable
  via git. Details in `covers-and-images.md`.
- **Favicon gotcha:** browsers auto-request `/favicon.ico` for tabs/bookmarks even though
  `BaseHead` declares `favicon.svg`. We ship a real `public/favicon.ico` (+ PNG +
  apple-touch-icon, all generated from `favicon.svg` via `sharp`) so that implicit request
  doesn't 404 and fall back to a stale cached icon. If you change the brand mark, regenerate
  **all** of those files, not just the SVG.

## Open Graph / social share cards

Every post page ships a per-post **1200×630** OG image so links shared to WhatsApp / X /
Discord / iMessage always render a large, branded preview at the exact size platforms want.

- **`scripts/build-og.mjs`** runs as a **`predev`/`prebuild` hook** and writes one
  `public/og/<topic>/<slug>.jpg` per post. Card chosen by priority:
  1. explicit **`ogImage`** front-matter → used full-bleed at 1200×630 (cover-fit), for a
     hand-made / Midjourney card;
  2. `cover`/`image` art → *contained* (never cropped), centered on the dark `#161618` canvas;
  3. neither → an auto-generated **title card** (title in Fraunces, topic eyebrow in Lato,
     J-vine wordmark). The typography is the design — no illustration needed.
- **`public/og/` is gitignored** (like `docs.enc.json`) — it is a build artifact, regenerated
  on every dev/build. Do not commit it.
- **Fonts are vendored as TTF under `scripts/og-fonts/`** (Fraunces + Lato) and loaded via a
  scoped `FONTCONFIG_FILE` the script writes at runtime. This is why the title cards render
  identically on CI: they do **not** depend on system fonts, and `@fontsource` ships woff2
  only (which librsvg/freetype can't reliably read). If you change the display/UI font, drop
  the matching `.ttf` into `scripts/og-fonts/` and update the `font-family` names in the SVG.
- **Wiring:** `[topic]/[slug].astro` always sets `image={'/og/' + post.slug + '.jpg'}` and
  passes it (plus `imageAlt`) to `PageLayout` → `BaseHead`, which emits `og:image` +
  `twitter:image` at a hardcoded 1200×630. Non-post pages (home, streams) fall back to the
  static `public/open-graph.jpg` (also 1200×630).
- Topic → accent colour for title cards lives in the `ACCENT` map in `build-og.mjs`
  (tech=sage, life=gold, philosophy=purple, writings=clay).

### Per-page metadata type: og:type, article meta, JSON-LD

`BaseHead.astro` is the single source of head metadata, with a few props threaded through
`PageLayout`:

- **`type`** (`"website"` default | `"article"`) controls `og:type`. `[slug].astro` passes
  `type="article"`; everything else stays `"website"`. On articles, `BaseHead` also emits
  `article:published_time` / `article:modified_time` (from the post `date` / `lastTended`) and
  one `article:tag` per tag.
- **`noindex`** → `<meta name="robots" content="noindex, nofollow">` (see the draft/unlisted note above).
- **JSON-LD** is built **inside `BaseHead`**, not passed in: a site-wide `@graph` of `WebSite` +
  `Person` (author + `SOCIALS` as `sameAs`), and on articles an extra `BlogPosting` node
  (headline, dates, `image` = the OG card, `keywords`, author/publisher `@id` references). The
  page never constructs schema objects — just set `type="article"` and pass the timestamps/keywords.
  `headline` is derived by stripping the `| JoeLogs` suffix from the `<title>`, so don't pass a
  separate bare title.

## The encrypted `/docs` system

The `/docs` route is a **password-gated writer handbook**, encrypted at build time:

- `scripts/build-docs.mjs` runs as a **`predev`/`prebuild` hook** (see `package.json`). It
  reads the Markdown files **listed in its `MANIFEST`**, renders them to HTML, and writes
  **AES-256-GCM ciphertext** to `public/docs.enc.json`. The plaintext **never reaches
  `dist/`**.
- **Only files in `MANIFEST` are published.** `docs/` also contains files *not* in the
  manifest — `now-page.md` and **this `DEVELOPER-NOTES.md`** — which are therefore
  repo-only references, never bundled or served. To publish a new handbook page you must
  add it to `MANIFEST`; to keep a doc internal, leave it out.
- **Password resolution order** (`getPassword()`): `DOCS_PASSWORD` env var →
  `.docs-password` file at repo root → **fallback `"garden"`** (with a warning). The
  fallback exists so CI never fails on a missing secret. The live site's password is
  whatever the deploy used: the `DOCS_PASSWORD` **repo secret**, or `garden` if unset.
- **You must set `DOCS_PASSWORD` for local dev/build too**, e.g.
  `DOCS_PASSWORD='garden-test' npm run dev`. The browser unlock at `/docs` re-derives the
  key with the same PBKDF2 params and decrypts client-side (`docs.astro`). If you dev-build
  with one password and try to unlock with another, it just fails.
- `build-docs.mjs` also **rewrites intra-doc links** (`./streams.md#x` → `#/streams#x`) so
  the single-page docs viewer can navigate between sections. Keep cross-doc links in that
  `./file.md` form.

## Dates: use the IST offset

- Write post `date` front matter with the **India offset `+05:30`** (e.g.
  `2026-06-15T16:57:00+05:30`). This keeps relative-date display and sort order correct
  against the author's local clock.
- Unlike the old Hugo build, **Astro renders future-dated posts** (it only filters
  `draft`/`unlisted`), so a same-day post won't silently vanish — but still use the IST
  offset for correct ordering and "x days ago" math.

## Connections (backlinks + related)

- `src/lib/connections.ts` builds the garden web. `getBacklinks` scans every post's **raw
  body** for either an absolute `/posts/<slug>` link **or** a `[[wikilink]]` matching the
  target's slug leaf (last path segment). `getRelated` is a score-based fallback (same
  topic = +2, each shared tag = +1) so the connections block is never empty.
- Implication: to create a backlink, link with the **full `/posts/<stream>/<post>` path**
  or a `[[<post-folder-name>]]` wikilink. A bare relative link won't be detected.

## Resume has two sources of truth

- The styled resume page (`src/pages/resume.astro`) is **hand-authored HTML** built from
  data arrays in that file. The downloadable PDF is a **separate file** at
  `public/resume.pdf`. They can drift — update **both** when resume content changes.

## Misc build/deploy facts

- **Build = `astro check && astro build`** — type errors fail the build. The encrypted
  docs are regenerated first by the `prebuild` hook.
- **Deploy** is `.github/workflows/gh-pages.yml` ("Deploy Astro site to Pages"): runs on
  **push to `main`** (and `workflow_dispatch`), `npm ci` → `npm run build` (with
  `DOCS_PASSWORD` from secrets) → uploads `./dist` → Pages. Pushing to `main` auto-deploys.
- Code blocks use **`astro-expressive-code`** (theme `github-dark`, configured in
  `astro.config.mjs`); long lines **scroll by default** (opt into wrapping per-fence with
  `wrap`). Copy buttons come from `public/js/copy.js`.
- Math: set `math: true` in front matter; `remark-math` + `rehype-katex` run globally
  (`astro.config.mjs`). KaTeX display blocks must be allowed to scroll on mobile (handled
  in `global.css`).
- **Default dev port is Astro's 4321** unless you pass `--port`. The non-negotiable part of
  the dev command is the `DOCS_PASSWORD` env var (above). **Restart the dev server after
  editing `src/content/config.ts`** — schema changes aren't picked up by HMR.
