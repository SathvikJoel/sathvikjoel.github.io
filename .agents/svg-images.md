# Embedding SVGs in Blog Posts

## New files created for SVG support

### `layouts/shortcodes/inlinesvg.html`
A custom Hugo shortcode that embeds an SVG as an `<img>` tag with:
- A light gray (`#f5f5f5`) background so dark strokes are visible in dark mode
- `max-height: 320px; width: auto` to cap size while preserving aspect ratio
- Centered on the page

**Usage in markdown:**
```
{{< inlinesvg src="your-image.svg" >}}
```
The SVG file must be in the **same directory** as the `index.md` (i.e., a Hugo page bundle).

### `layouts/partials/post_meta.html`
An override of the PaperMod theme's `post_meta.html` partial.
**Why it exists:** The theme outputs HTML strings (date `<span>`, `&nbsp;` separators) via Hugo's `delimit` function, which escapes them in newer Hugo versions, rendering raw HTML tags as visible text. The fix adds `| safeHTML` to the final output.

---

## How to add a blog post with SVG images (page bundle pattern)

All posts use the **leaf bundle** format:
```
content/posts/<category>/<slug>/
    index.md        ← the blog post
    image1.svg      ← images live alongside index.md
    image2.svg
```

**Step 1** — create the folder and put `index.md` + SVG files in it.

**Step 2** — in `index.md`, use the shortcode where you want the image:
```markdown
{{< inlinesvg src="image1.svg" >}}
```

**Step 3** — the section (e.g. `content/posts/philosophy/`) needs an `_index.md` or Hugo won't build it:
```yaml
---
title: "Philosophy🧠"
hidemeta: true
---
```

---

## Notes on Excalidraw SVGs

- Excalidraw exports SVGs with absolute `width`/`height` pixel attributes and `viewBox`.
- The `inlinesvg` shortcode uses `<img>` (not inline SVG) because it's simpler and more reliable.
- `max-height: 320px; width: auto` on an `<img>` correctly maintains aspect ratio.
- The `background: #f5f5f5` is needed because Excalidraw SVGs use black strokes on a transparent background — without it, diagrams are invisible in dark mode.
- If you want a different max height, edit `layouts/shortcodes/inlinesvg.html`.

---

## Zone.Identifier files

Files transferred from Windows (e.g. via Obsidian vault sync) may generate `filename.svg:Zone.Identifier` sidecar files. These are harmless and Hugo ignores them, but they get committed. Safe to leave as-is.
