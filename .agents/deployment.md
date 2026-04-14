# Deployment

This is a Hugo site hosted on GitHub Pages under the repo `SathvikJoel/sathvikjoel.github.io`.

## How deployment works

There is **one workflow**: `Deploy Hugo PaperMod Demo to Pages`
- File: `.github/workflows/gh-pages.yml`
- Workflow ID: `65872354`
- It builds the Hugo site and deploys to GitHub Pages.
- It triggers on push to `master` branch **or** manually via `workflow_dispatch`.
- Note: the workflow checks out `main` branch regardless, so push to `main`.

## To deploy after making changes

**Step 1 — push to main:**
```bash
git add <files>
git commit -m "your message"
git push origin main
```

**Step 2 — trigger the workflow** (the workflow does NOT auto-trigger on push to `main`, only `master`):
```bash
gh workflow run gh-pages.yml --repo SathvikJoel/sathvikjoel.github.io --ref main
```

**Step 3 — check status:**
```bash
gh run list --workflow=gh-pages.yml --repo SathvikJoel/sathvikjoel.github.io --limit 3
```

## Auth requirement

The `gh` CLI must be authenticated as `SathvikJoel` (not `t-sathvikk_microsoft`).
Check with `gh auth status`. If wrong account, user must run `gh auth login` first.

## Local preview

Hugo is installed at `~/bin/hugo`. To preview locally:
```bash
export PATH="$HOME/bin:$PATH"
hugo server --bind 0.0.0.0 --buildFuture
# visit http://localhost:1313
```
