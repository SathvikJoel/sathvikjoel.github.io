// One-time (re-runnable) image optimizer for post pictures in `public/posts/`.
//
// Why: images in `public/` are served byte-for-byte — Astro does NOT optimize them.
// Cameras and AI tools emit 3–13 MB files that tank mobile load + Lighthouse. This
// script resizes oversized pictures and re-encodes them with good compression, IN
// PLACE and IN THE SAME FORMAT, so no front-matter paths ever need to change.
//
// Safe by design:
//   - Only touches files larger than MIN_KB (default 400 KB).
//   - Caps the longest side to MAX_DIM (default 2000 px) — never upscales.
//   - Keeps the original extension (.jpg stays .jpg, .png stays .png), so every
//     `cover:` / `image:` / in-body reference keeps working untouched.
//   - Only overwrites a file when the result is actually smaller.
//   - Originals are committed in git, so `git checkout -- <file>` restores any of them.
//
// Usage:
//   node scripts/optimize-images.mjs            # optimize public/posts (in place)
//   node scripts/optimize-images.mjs --dry      # report only, write nothing
//   node scripts/optimize-images.mjs --min 800  # only files > 800 KB
//   node scripts/optimize-images.mjs --max 1600 # cap longest side to 1600 px
//   node scripts/optimize-images.mjs path/a.jpg path/b.png   # specific files
//
// Tuning knobs (env or flags): MIN_KB, MAX_DIM, JPEG_Q, PNG_Q.

import sharp from "sharp"
import { readFileSync, writeFileSync, statSync } from "node:fs"
import { execSync } from "node:child_process"

const args = process.argv.slice(2)
const flag = (name, def) => {
  const i = args.indexOf(`--${name}`)
  return i !== -1 && args[i + 1] ? args[i + 1] : def
}
const DRY = args.includes("--dry")
const MIN_KB = Number(flag("min", process.env.MIN_KB ?? 400))
const MAX_DIM = Number(flag("max", process.env.MAX_DIM ?? 2000))
const JPEG_Q = Number(process.env.JPEG_Q ?? 82)
const PNG_Q = Number(process.env.PNG_Q ?? 80)

// Explicit file args (anything not a --flag/value) or default to scanning public/posts.
const explicit = args.filter(
  (a, i) => !a.startsWith("--") && args[i - 1] !== "--min" && args[i - 1] !== "--max",
)

function listFiles() {
  if (explicit.length) return explicit
  const out = execSync(
    `find public/posts -type f \\( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" \\)`,
  )
    .toString()
    .trim()
  return out ? out.split("\n") : []
}

const kb = (n) => (n / 1024).toFixed(0).padStart(6) + " KB"

async function optimize(file) {
  const before = statSync(file).size
  if (before < MIN_KB * 1024) return null

  const input = readFileSync(file)
  const img = sharp(input, { failOn: "none" })
  const meta = await img.metadata()
  const longest = Math.max(meta.width ?? 0, meta.height ?? 0)

  let pipeline = sharp(input, { failOn: "none" }).rotate() // honour EXIF orientation
  if (longest > MAX_DIM) {
    pipeline = pipeline.resize({
      width: meta.width >= meta.height ? MAX_DIM : undefined,
      height: meta.height > meta.width ? MAX_DIM : undefined,
      fit: "inside",
      withoutEnlargement: true,
    })
  }

  // Re-encode in the SAME format so the on-disk path/extension is unchanged.
  if (meta.format === "png") {
    // Lossy palette quantization (TinyPNG-style) — excellent for illustrations/screens.
    pipeline = pipeline.png({ palette: true, quality: PNG_Q, effort: 8, compressionLevel: 9 })
  } else {
    pipeline = pipeline.jpeg({ quality: JPEG_Q, mozjpeg: true })
  }

  const output = await pipeline.toBuffer()
  if (output.length >= before) return { file, before, after: before, skipped: true }
  if (!DRY) writeFileSync(file, output)
  return { file, before, after: output.length }
}

const files = listFiles()
let totBefore = 0
let totAfter = 0
let changed = 0
console.log(
  `${DRY ? "[dry-run] " : ""}Optimizing ${files.length} file(s)  ·  min ${MIN_KB} KB  ·  max ${MAX_DIM} px\n`,
)
for (const f of files.sort()) {
  const r = await optimize(f)
  if (!r) continue
  totBefore += r.before
  totAfter += r.after
  if (r.skipped) {
    console.log(`  skip  ${kb(r.before)}                ${f}`)
    continue
  }
  changed++
  const pct = (100 * (1 - r.after / r.before)).toFixed(0)
  console.log(`  ✓     ${kb(r.before)} → ${kb(r.after)}  (-${pct}%)  ${f}`)
}
console.log(
  `\n${DRY ? "[dry-run] would save" : "Saved"} ${kb(totBefore - totAfter)} across ${changed} file(s)  (${kb(totBefore)} → ${kb(totAfter)})`,
)
