# JoeLogs

The personal site and digital garden of **Sathvik Joel** — essays and field notes on
tech, life, philosophy, and whatever else is growing. Live at
**[sathvikjoel.github.io](https://sathvikjoel.github.io)**.

It's a dark, illustrated "digital garden" (in the spirit of Maggie Appleton's site), built
with **Astro**, **Tailwind**, and **TypeScript**, with a sprinkle of SolidJS for the few
stateful bits. It was migrated from a Hugo + PaperMod blog in June 2026; the old Hugo site
is preserved on the **`hugo-old`** branch.

## Project shape

```
src/
  components/        UI + MDX components (cards, ScrollSlides, StageIcon, …)
  content/
    posts/<slug>/    blog posts (flat; stream set by `topic` frontmatter)
    now/             dated "now" snapshots
  pages/             routes (home, streams, posts, now, about, resume, search, RSS)
  styles/            global CSS + Tailwind layer
public/              static assets served as-is (post images, icons, og/, resume.pdf)
scripts/             build-time scripts (encrypted /docs, OG card generation)
docs/                the writing handbook (also served, password-gated, at /docs)
.agents/             contributor/agent notes (see deployment.md)
```

## Writing & contributing docs

The full handbook lives in **[`docs/`](./docs/README.md)** and is also served as a
password-gated section of the live site at `/docs`. Start there for how to write posts,
add covers/images, use the component toolkit, build annotated talks, and update the
`/now` page. Engineering specifics live in
[`docs/DEVELOPER-NOTES.md`](./docs/DEVELOPER-NOTES.md), and the deploy mechanics in
[`.agents/deployment.md`](./.agents/deployment.md).

## Commands

Run from the repo root (`DOCS_PASSWORD` gates the `/docs` handbook; a value is only needed
to view those pages locally):

| Command                                       | Action                                            |
| :-------------------------------------------- | :------------------------------------------------ |
| `npm install`                                 | Install dependencies                              |
| `DOCS_PASSWORD='garden-test' npm run dev`     | Start the dev server                              |
| `DOCS_PASSWORD='garden-test' npm run build`   | Type-check (`astro check`) + build to `./dist/`   |
| `npm run preview`                             | Preview the production build locally              |
| `npm run lint` / `npm run lint:fix`           | Run / auto-fix ESLint                             |

## Deployment

Push to **`main`** and the **[`.github/workflows/gh-pages.yml`](./.github/workflows/gh-pages.yml)**
workflow builds the site with Astro and deploys `./dist` to GitHub Pages. See
[`.agents/deployment.md`](./.agents/deployment.md) for details (manual runs, the
`DOCS_PASSWORD` secret, and auth).

## License

This site is a heavily rewritten fork of the MIT-licensed
[AstroSphere](https://github.com/markhorn-dev/astro-sphere) template; the original license
is retained in [`LICENSE`](./LICENSE). Site **content** (posts, images, and writing) is ©
Sathvik Joel and not covered by that license.
