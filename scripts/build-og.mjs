// Generates a 1200×630 Open Graph share card for EVERY post, so links shared to
// WhatsApp / X / Discord / iMessage / etc. always show a large, on-brand preview at
// the exact dimensions every platform expects.
//
// Two card styles, chosen per post by priority:
//   1. Explicit `ogImage` front-matter → used full-bleed at 1200×630 (e.g. a hand-made
//      or Midjourney card). This wins over everything.
//   2. Posts with `cover`/`image` art  → the art is *contained* (never cropped) and
//      centered on a dark, on-brand canvas, so it reads as an intentional framed card.
//   3. Posts with neither             → an auto-generated TITLE card: the post title set
//      in Fraunces with a topic eyebrow + the J-vine wordmark, on the same canvas.
//      The typography is the design — no illustration needed.
//
// Fonts: Fraunces (display) + Lato (UI) are vendored as TTF under scripts/og-fonts and
// rendered through a scoped fontconfig, so text renders identically on CI without
// depending on any system fonts. (@fontsource ships woff2 only, which librsvg/freetype
// can't always read — hence the vendored TTFs.)
//
// Output: public/og/<topic>/<slug>.jpg  (referenced by [topic]/[slug].astro as
//          /og/<post.slug>.jpg). public/og/ is gitignored — regenerated on every build.
//
// Runs automatically before `dev` and `build` (see package.json predev/prebuild).

import sharp from "sharp"
import matter from "gray-matter"
import { readFileSync, writeFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, statSync } from "node:fs"
import { tmpdir } from "node:os"
import { fileURLToPath } from "node:url"
import { dirname, join, relative } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")
const postsDir = join(root, "src", "content", "posts")
const publicDir = join(root, "public")
const outDir = join(publicDir, "og")
const fontDir = join(__dirname, "og-fonts")

const WIDTH = 1200
const HEIGHT = 630
const BG = { r: 22, g: 22, b: 24 } // #161618 — matches the site's dark surfaces
const PAD = 48 // breathing room around contained art

// Topic → accent colour (Maggie palette, brightened for the dark canvas).
const ACCENT = {
  tech: "#3DD6ED", // sage
  life: "#F0C27B", // gold
  fun: "#74C69D", // green
  philosophy: "#A98CE6", // purple
  writings: "#FF9A8A", // clay
  essays: "#FF6FB5", // crimson
}
const ACCENT_DEFAULT = "#FF6FB5" // crimson

// The J-vine logo mark (mirrors public/favicon.svg), inlined so it rasterises with the card.
const LOGO = `<svg x="{X}" y="{Y}" width="{S}" height="{S}" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="26" fill="#1F1F22"/>
  <path d="M84 34 L84 78 C 84 96, 62 100, 50 88" fill="none" stroke="#ECEAE6" stroke-width="9" stroke-linecap="round"/>
  <path d="M84 42 C 93 27, 110 22, 120 30 C 114 46, 97 50, 84 42 Z" fill="#FF6FB5"/>
  <path d="M84 58 C 69 46, 51 47, 45 58 C 55 70, 74 69, 84 58 Z" fill="#3DD6ED"/>
</svg>`

// One scoped fontconfig pointing only at our vendored TTFs. Setting FONTCONFIG_FILE
// before sharp touches text guarantees Fraunces/Lato are found on any machine.
function setupFonts() {
  const cacheDir = mkdtempSync(join(tmpdir(), "og-fc-"))
  const conf = `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>${fontDir}</dir>
  <cachedir>${cacheDir}</cachedir>
</fontconfig>`
  const confFile = join(cacheDir, "fonts.conf")
  writeFileSync(confFile, conf)
  process.env.FONTCONFIG_FILE = confFile
}

// Recursively find every index.md / index.mdx under src/content/posts.
function findPosts(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...findPosts(p))
    else if (/^index\.mdx?$/.test(name)) out.push(p)
  }
  return out
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

// Greedy word-wrap using an estimated average glyph advance for Fraunces.
function wrapTitle(title, fontSize, maxWidth) {
  const charW = fontSize * 0.52 // serif display, mixed case ≈ 0.52em average
  const words = title.split(/\s+/)
  const lines = []
  let line = ""
  for (const w of words) {
    const next = line ? `${line} ${w}` : w
    if (next.length * charW > maxWidth && line) {
      lines.push(line)
      line = w
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

// Pick the largest font size that wraps the title into ≤ maxLines.
function fitTitle(title, maxWidth, maxLines) {
  for (let size = 78; size >= 46; size -= 2) {
    const lines = wrapTitle(title, size, maxWidth)
    if (lines.length <= maxLines) return { size, lines }
  }
  const size = 46
  return { size, lines: wrapTitle(title, size, maxWidth).slice(0, maxLines) }
}

// ---- Card builders -------------------------------------------------------

// Explicit ogImage: use the author-supplied card full-bleed at exactly 1200×630.
// (Cover-fit so a correctly-sized 1.91:1 image is untouched; an off-ratio one is centered-cropped.)
async function buildBleedCard(artPath, outPath) {
  const buf = await sharp(readFileSync(artPath))
    .resize(WIDTH, HEIGHT, { fit: "cover", position: "centre" })
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer()
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, buf)
  return buf.length
}

async function buildArtCard(artPath, outPath) {
  const art = await sharp(readFileSync(artPath))
    .resize(WIDTH - PAD * 2, HEIGHT - PAD * 2, { fit: "inside", withoutEnlargement: false })
    .toBuffer()
  const meta = await sharp(art).metadata()

  const buf = await sharp({
    create: { width: WIDTH, height: HEIGHT, channels: 3, background: BG },
  })
    .composite([
      { input: art, left: Math.round((WIDTH - meta.width) / 2), top: Math.round((HEIGHT - meta.height) / 2) },
    ])
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer()

  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, buf)
  return buf.length
}

async function buildTitleCard({ title, topic }, outPath) {
  const accent = ACCENT[topic] || ACCENT_DEFAULT
  const P = 90
  const maxWidth = WIDTH - P * 2
  const { size, lines } = fitTitle(title, maxWidth, 3)
  const lineHeight = size * 1.14

  // Vertically center the title block in the lower two-thirds of the card.
  const blockH = lines.length * lineHeight
  const titleTop = 300 + (HEIGHT - 300 - P - blockH) / 2 + size * 0.8

  const titleTspans = lines
    .map((l, i) => `<tspan x="${P}" y="${Math.round(titleTop + i * lineHeight)}">${escapeXml(l)}</tspan>`)
    .join("")

  const logo = LOGO.replace("{X}", String(P)).replace("{Y}", "78").replaceAll("{S}", "62")

  const svg = `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#161618"/>
  <rect x="0" y="0" width="${WIDTH}" height="8" fill="${accent}"/>
  ${logo}
  <text x="${P + 80}" y="124" font-family="Fraunces" font-size="40" fill="#ECEAE6">JoeLogs</text>
  <text x="${P}" y="252" font-family="Lato" font-size="26" font-weight="700" letter-spacing="4" fill="${accent}">${escapeXml((topic || "").toUpperCase())}</text>
  <text font-family="Fraunces" font-size="${size}" fill="#ECEAE6">${titleTspans}</text>
  <text x="${P}" y="${HEIGHT - 64}" font-family="Lato" font-size="23" fill="#8A8A8A">sathvikjoel.github.io</text>
</svg>`

  const buf = await sharp(Buffer.from(svg)).jpeg({ quality: 88, mozjpeg: true }).toBuffer()
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, buf)
  return buf.length
}

// ---- Main ----------------------------------------------------------------

async function main() {
  setupFonts()
  const files = findPosts(postsDir)
  let og = 0
  let art = 0
  let text = 0
  for (const file of files) {
    const { data } = matter(readFileSync(file, "utf8"))
    if (data.draft) continue

    // slug = path under posts/ without the trailing /index.ext, e.g. "life/29052026_greek"
    const slug = relative(postsDir, dirname(file)).split(/[\\/]/).join("/")
    const topic = data.topic || slug.split("/")[0]
    const outPath = join(outDir, `${slug}.jpg`)

    // Priority: explicit ogImage (full-bleed) → cover/image (framed art) → title card.
    const explicitRef = data.ogImage
    if (explicitRef) {
      const p = join(publicDir, String(explicitRef).replace(/^\//, ""))
      if (existsSync(p)) {
        const size = await buildBleedCard(p, outPath)
        og++
        console.log(`[build-og] og    ${slug}.jpg  (${(size / 1024).toFixed(0)} KB)`)
        continue
      }
      console.warn(`[build-og] missing ogImage for ${relative(root, file)}: ${explicitRef} — falling back`)
    }

    // Prefer the wide cover; fall back to the square tile illustration.
    const artRef = data.cover || data.image
    if (artRef) {
      const artPath = join(publicDir, String(artRef).replace(/^\//, ""))
      if (existsSync(artPath)) {
        const size = await buildArtCard(artPath, outPath)
        art++
        console.log(`[build-og] art   ${slug}.jpg  (${(size / 1024).toFixed(0)} KB)`)
        continue
      }
      console.warn(`[build-og] missing art for ${relative(root, file)}: ${artRef} — using title card`)
    }

    const title = data.title || slug.split("/").pop()
    const size = await buildTitleCard({ title, topic }, outPath)
    text++
    console.log(`[build-og] title ${slug}.jpg  (${(size / 1024).toFixed(0)} KB)`)
  }
  console.log(`[build-og] generated ${og + art + text} card(s) -> public/og/  (${og} og, ${art} art, ${text} title)`)
}

main().catch((err) => {
  console.error("[build-og] failed:", err)
  process.exit(1)
})
