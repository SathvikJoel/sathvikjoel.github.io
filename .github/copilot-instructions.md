# Copilot Instructions

This file documents conventions and structure of this repository for use by AI agents and contributors.

---

## Resume

The resume is stored as a PDF at `static/resume.pdf`.

Hugo serves everything in `static/` at the root URL, so the resume is publicly accessible at:

```
https://sathvikjoel.github.io/resume.pdf
```

### How to update the resume

To replace the resume with a newer version, simply overwrite the file:

```bash
cp /path/to/new_resume.pdf static/resume.pdf
```

Then commit and push — the GitHub Actions workflow will automatically rebuild and deploy the site.

**Do not rename the file.** The filename `resume.pdf` is referenced in `config.yml` (profile buttons and nav menu). If you must rename it, update both of those references too.

### Where it is linked

- **Homepage profile buttons** — `config.yml` → `params.profileMode.buttons`
- **Top navigation menu** — `config.yml` → `menu.main` (identifier: `Resume`)

---

## Deployment

The site is built with [Hugo](https://gohugo.io/) using the [PaperMod](https://github.com/adityatelange/hugo-PaperMod) theme (loaded as a git submodule).

Deployment is handled by `.github/workflows/gh-pages.yml`, which:
1. Triggers on every push to `main`
2. Builds the site with Hugo
3. Deploys the output to GitHub Pages

To trigger a manual deploy, use the **workflow_dispatch** event from the Actions tab.
