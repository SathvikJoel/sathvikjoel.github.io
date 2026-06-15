# Deployment

This is an **Astro** site (migrated from Hugo in June 2026) hosted on GitHub
Pages under the repo `SathvikJoel/sathvikjoel.github.io`. The Astro project lives
at the **repo root**.

The original hand-built Hugo + PaperMod site is preserved on the **`hugo-old`**
branch.

## How deployment works

There is **one workflow**: `Deploy Astro site to Pages`
- File: `.github/workflows/gh-pages.yml`
- It runs `npm ci` then `npm run build` (Astro) and deploys `./dist` to Pages.
- It triggers automatically on **push to `main`**, or manually via
  `workflow_dispatch`.

### Private docs password

The build encrypts the `/docs` handbook with a password (`scripts/build-docs.mjs`).
The workflow reads it from the **`DOCS_PASSWORD`** repo secret
(Settings → Secrets and variables → Actions). If the secret is unset the build
still succeeds, falling back to the default password `garden`.

## To deploy after making changes

```bash
git add <files>
git commit -m "your message"
git push origin main      # auto-triggers the deploy workflow
```

To trigger manually:
```bash
gh workflow run gh-pages.yml --repo SathvikJoel/sathvikjoel.github.io --ref main
```

Check status:
```bash
gh run list --workflow=gh-pages.yml --repo SathvikJoel/sathvikjoel.github.io --limit 3
```

## Auth requirement

The `gh` CLI must be authenticated as `SathvikJoel`. Check with `gh auth status`.

## Local preview

```bash
npm install                 # first time only
DOCS_PASSWORD='garden-test' npm run dev -- --port 4399
# visit http://localhost:4399

# production build:
DOCS_PASSWORD='garden-test' npm run build && npm run preview
```
