// Builds an encrypted bundle of the writer handbook in `docs/` so it can be served
// as a private, password-gated section of the site. The plaintext never reaches the
// deployed `dist/` — only AES-256-GCM ciphertext does. The password (which you set via
// the DOCS_PASSWORD env var or an astro-site/.docs-password file) derives the key with
// PBKDF2; the same derivation runs in the browser when you unlock /docs.
//
// Output: public/docs.enc.json  ->  { v, iter, salt, iv, ct }  (all base64)
//
// Run automatically before `dev` and `build` (see package.json prebuild/predev), or
// manually:  DOCS_PASSWORD='your secret' node scripts/build-docs.mjs

import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import { webcrypto as crypto } from "node:crypto"
import matter from "gray-matter"
import MarkdownIt from "markdown-it"
import anchor from "markdown-it-anchor"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")
const docsDir = join(root, "docs")

// Ordered list of docs (filename -> nav label). Order drives the sidebar.
const MANIFEST = [
  { file: "README.md", slug: "overview", label: "Overview" },
  { file: "streams.md", slug: "streams", label: "Streams" },
  { file: "writing-posts.md", slug: "writing-posts", label: "Writing a post" },
  { file: "covers-and-images.md", slug: "covers-and-images", label: "Covers & images" },
  { file: "components.md", slug: "components", label: "Writing toolkit" },
  { file: "annotated-talks.md", slug: "annotated-talks", label: "Annotated talks" },
]

// Map a source filename (as used in intra-doc links) to its slug, so we can rewrite
// links like `./streams.md` into in-app `#/streams` navigation.
const fileToSlug = new Map(MANIFEST.map((m) => [m.file, m.slug]))

const md = new MarkdownIt({ html: true, linkify: true, typographer: true })
md.use(anchor, { permalink: false, slugify: (s) => slugify(s) })

function slugify(s) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s/g, "-")
}

// Rewrite intra-doc links: `./streams.md`, `streams.md#anchor` -> `#/streams` (+ #anchor).
function rewriteLinks(html) {
  return html.replace(/href="([^"]+)"/g, (whole, href) => {
    if (/^https?:\/\//.test(href) || href.startsWith("#/")) return whole
    // Pure in-page anchor (e.g. #code-blocks): leave as-is, the viewer handles it.
    if (href.startsWith("#")) return whole
    const m = href.match(/^\.?\/?([\w-]+\.md)(#(.+))?$/)
    if (m && fileToSlug.has(m[1])) {
      const slug = fileToSlug.get(m[1])
      return `href="#/${slug}${m[3] ? "#" + m[3] : ""}"`
    }
    return whole
  })
}

function getPassword() {
  if (process.env.DOCS_PASSWORD && process.env.DOCS_PASSWORD.trim()) {
    return process.env.DOCS_PASSWORD.trim()
  }
  const pwFile = join(root, ".docs-password")
  if (existsSync(pwFile)) {
    const v = readFileSync(pwFile, "utf8").trim()
    if (v) return v
  }
  console.warn(
    "[build-docs] No DOCS_PASSWORD env var or .docs-password file found — " +
      "using the default password 'garden'. Set your own before deploying."
  )
  return "garden"
}

async function encrypt(plaintext, password) {
  const enc = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const iter = 150000
  const baseKey = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
    "deriveKey",
  ])
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: iter, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  )
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plaintext))
  const b64 = (buf) => Buffer.from(buf).toString("base64")
  return { v: 1, iter, salt: b64(salt), iv: b64(iv), ct: b64(new Uint8Array(ct)) }
}

async function main() {
  const docs = []
  for (const item of MANIFEST) {
    const path = join(docsDir, item.file)
    if (!existsSync(path)) {
      console.warn(`[build-docs] missing ${item.file}, skipping`)
      continue
    }
    const raw = readFileSync(path, "utf8")
    const { content } = matter(raw)
    // Title = first H1, else manifest label.
    const h1 = content.match(/^\s*#\s+(.+)\s*$/m)
    const title = h1 ? h1[1].trim() : item.label
    const html = rewriteLinks(md.render(content))
    docs.push({ slug: item.slug, label: item.label, title, html })
  }

  const password = getPassword()
  const payload = JSON.stringify({ docs })
  const bundle = await encrypt(payload, password)

  const outPath = join(root, "public", "docs.enc.json")
  writeFileSync(outPath, JSON.stringify(bundle))
  console.log(
    `[build-docs] encrypted ${docs.length} docs -> public/docs.enc.json ` +
      `(${(JSON.stringify(bundle).length / 1024).toFixed(1)} kB)`
  )
}

main().catch((err) => {
  console.error("[build-docs] failed:", err)
  process.exit(1)
})
