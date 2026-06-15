# OG card fonts (vendored)

These TTFs are used **only** by `scripts/build-og.mjs` to render 1200×630 social share
cards. They are loaded through a scoped `fontconfig` so text renders identically on CI
without depending on system fonts. They are **not** shipped to the site (the live site
self-hosts woff2 via `@fontsource`).

| File | Family | Used for | License |
|------|--------|----------|---------|
| `Fraunces.ttf` | Fraunces (variable) | card titles + wordmark | OFL 1.1 |
| `Lato-Regular.ttf` | Lato | footer URL | OFL 1.1 |
| `Lato-Bold.ttf` | Lato Bold | topic eyebrow | OFL 1.1 |

Both families are SIL Open Font License 1.1 and may be embedded/redistributed:

- Fraunces — https://github.com/google/fonts/tree/main/ofl/fraunces
- Lato — https://github.com/google/fonts/tree/main/ofl/lato

To change the card font, drop the new `.ttf` here and update the `font-family` names in
`scripts/build-og.mjs`.
