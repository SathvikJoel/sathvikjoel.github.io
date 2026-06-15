// Generates a 1200×630 Open Graph share card for every post that has cover/illustration
// art, so links shared to WhatsApp / X / Discord / etc. show the post's own image at the
// exact dimensions every platform expects.
//
// Strategy: the art is *contained* (never cropped) and centered on a dark, on-brand
// canvas. Illustrations and square covers therefore keep their full shape and look like
// an intentional framed card, instead of being chopped to a 1.91:1 crop.
//
// Output: public/og/<topic>/<slug>.jpg  (referenced by [topic]/[slug].astro as
//          /og/<post.slug>.jpg). Posts with no art fall back to /open-graph.jpg.
//
// Runs automatically before `dev` and `build` (see package.json predev/prebuild).

import sharp from "sharp"
import matter from "gray-matter"
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join, relative } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")
const postsDir = join(root, "src", "content", "posts")
const publicDir = join(root, "public")
const outDir = join(publicDir, "og")

const WIDTH = 1200
const HEIGHT = 630
const BG = { r: 22, g: 22, b: 24 } // #161618 — matches the site's dark surfaces
const PAD = 48 // breathing room around the art

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

async function buildCard(artPath, outPath) {
  const art = await sharp(readFileSync(artPath))
    .resize(WIDTH - PAD * 2, HEIGHT - PAD * 2, { fit: "inside", withoutEnlargement: false })
    .toBuffer()
  const meta = await sharp(art).metadata()

  const canvas = sharp({
    create: { width: WIDTH, height: HEIGHT, channels: 3, background: BG },
  })
    .composite([
      {
        input: art,
        left: Math.round((WIDTH - meta.width) / 2),
        top: Math.round((HEIGHT - meta.height) / 2),
      },
    ])
    .jpeg({ quality: 85, mozjpeg: true })

  const buf = await canvas.toBuffer()
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, buf)
  return buf.length
}

async function main() {
  const files = findPosts(postsDir)
  let made = 0
  for (const file of files) {
    const { data } = matter(readFileSync(file, "utf8"))
    // Prefer the wide cover; fall back to the square tile illustration.
    const art = data.cover || data.image
    if (!art) continue

    const artPath = join(publicDir, String(art).replace(/^\//, ""))
    if (!existsSync(artPath)) {
      console.warn(`[build-og] missing art for ${relative(root, file)}: ${art}`)
      continue
    }

    // slug = path under posts/ without the trailing /index.ext, e.g. "life/29052026_greek"
    const slug = relative(postsDir, dirname(file)).split(/[\\/]/).join("/")
    const outPath = join(outDir, `${slug}.jpg`)
    const size = await buildCard(artPath, outPath)
    made++
    console.log(`[build-og] ${slug}.jpg  (${(size / 1024).toFixed(0)} KB)`)
  }
  console.log(`[build-og] generated ${made} share card(s) -> public/og/`)
}

main().catch((err) => {
  console.error("[build-og] failed:", err)
  process.exit(1)
})
