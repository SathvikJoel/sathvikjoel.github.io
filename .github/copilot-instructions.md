# Copilot Instructions

Working conventions for AI agents and contributors on this site (an **Astro**
digital garden deployed to GitHub Pages). This file holds *how we work* — the
detailed reference lives in the docs (see the map at the bottom). Don't duplicate
that reference here; link to it.

---

## Keep the docs in sync — this is the #1 convention

The docs must stay **consistent with the codebase at all times**. After *any*
change, deliberately evaluate whether it affects the documentation and update the
relevant file **in the same change** (same commit/PR). Some changes need no doc
edit — that's fine, but make the call on purpose, don't skip it.

Rules of thumb for where a change lands:

- New/changed **MDX component or card**, or a changed prop/attribute → `docs/components.md`.
- New **stream**, layout, or changed **frontmatter field / validation** →
  `docs/streams.md` and/or `docs/writing-posts.md`, plus the `topic` enum note in
  `docs/DEVELOPER-NOTES.md`.
- New **build step, script, route, OG behaviour, or guard** → `docs/DEVELOPER-NOTES.md`.
- Anything that changes **how writers write** or **how the site builds/deploys** → docs.

The `docs/` handbook is encrypted into `public/docs.enc.json` at build time, so doc
edits only reach the live `/docs` page after a rebuild + deploy.

## Build and verify before pushing

- Always run a clean build before committing: `DOCS_PASSWORD='garden-test' npm run build`
  (runs `astro check` then `astro build`; **type errors fail the build**). It must
  finish with 0 errors.
- `DOCS_PASSWORD` is required for every local dev/build (it keys the `/docs` bundle).

## Deploy

- **`main` is production.** Pushing to `main` auto-deploys via
  `.github/workflows/gh-pages.yml`; there is no staging branch. Verify the run is
  green after pushing. (Manual trigger + details: `.agents/deployment.md`.)

## Hard conventions (details in the docs)

- **Adding a stream edits two separate lists:** `TOPICS` in `src/consts.ts` **and** the
  `topic` enum in `src/content/config.ts`. Keep them in lockstep, then update the stream docs.
- **Posts that use components must be `.mdx`.** In a `.md` file, `<Component>` renders as
  raw HTML and silently does nothing.
- **A post's stream is set by its `topic` frontmatter alone, not its folder.** Posts live
  flat at `src/content/posts/<slug>/index.md(x)` with images mirrored at
  `public/posts/<slug>/...`. Re-streaming a post is a one-line `topic:` change — no files move.
  The build throws if a post folder name collides with a stream URL key.
- **Frontmatter `date` uses the IST offset `+05:30`** so timestamps match local time and
  homepage/stream sort order stays correct.
- **`description` frontmatter is required** (non-empty) — the schema fails the build without it.
- When a post URL changes (e.g. moved to another stream), add a redirect from the old
  path in `astro.config.mjs` to preserve inbound links.
- **Don't commit junk:** editor swap files, OS artifacts (Windows `*:Zone.Identifier`),
  or the `dist/` build output.

---

## Where the documentation lives

- `docs/` — the **writer handbook** (overview, streams, writing posts, covers & images,
  components toolkit). Encrypted and served at `/docs`.
- `docs/DEVELOPER-NOTES.md` — the **engineering reference**: architecture, build/deploy,
  OG cards, frontmatter guards, `TOPICS` coupling, dark-only theme, fonts, and other gotchas.
- `.agents/deployment.md` — deploy specifics and manual-trigger commands.

## Project shape (quick map)

Astro (static output) + Tailwind + TypeScript, a little SolidJS; content is Markdown/MDX.

- `src/pages/` — routes (`index`, `about`, `resume`, `now/`, `posts/[slug]`, `posts/[topic]/` stream index, `search/`, `404`, `rss.xml.ts`).
- `src/content/posts/<slug>/index.md(x)` — blog posts (flat; stream set by `topic` frontmatter) · `src/content/now/` — "Now" snapshots.
- `src/content/config.ts` — collection schemas · `src/components/` (+ `mdx/`) — UI & MDX components.
- `src/consts.ts` — `TOPICS`, nav `LINKS`, `SOCIALS` · `public/` — static assets · `scripts/` — build hooks.
- Full architecture and rationale: `docs/DEVELOPER-NOTES.md`.
