// One-shot migration: Hugo posts -> Astro `posts` collection.
// Run: node scripts/migrate.mjs   (from astro-site/)
import fs from "node:fs"
import path from "node:path"
import yaml from "js-yaml"

// Tolerant front-matter parse (allows duplicate keys: last wins).
function parseFrontMatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!m) return { data: {}, content: raw }
  const data = yaml.load(m[1], { json: true }) || {}
  return { data, content: m[2] }
}

const REPO = path.resolve(process.cwd(), "..")
const SRC_ROOT = path.join(REPO, "content", "posts")
const OUT_CONTENT = path.resolve(process.cwd(), "src", "content", "posts")
const OUT_PUBLIC = path.resolve(process.cwd(), "public", "posts")
const TOPICS = ["tech", "life", "philosophy"]

const yamlStr = (s) => JSON.stringify(s ?? "")
const isPlaceholder = (s) => typeof s === "string" && /^<.*>$/.test(s.trim())

// Convert Hugo indented code blocks (4-space) that contain `<` or `{` into
// fenced code blocks, so MDX does not parse those characters as JSX/expressions.
// Fence-aware: never touches content already inside ``` fences.
function fenceIndentedCode(part) {
  const lines = part.split("\n")
  const out = []
  let i = 0
  while (i < lines.length) {
    const isIndented = (l) => /^( {4}|\t)/.test(l)
    const isBlank = (l) => l.trim() === ""
    if (isIndented(lines[i])) {
      const block = []
      let j = i
      while (j < lines.length && (isIndented(lines[j]) || isBlank(lines[j]))) {
        block.push(lines[j])
        j++
      }
      // trim trailing blank lines from the captured block
      while (block.length && isBlank(block[block.length - 1])) block.pop()
      const text = block.join("\n")
      const hasCode = block.some((l) => isIndented(l) && !isBlank(l))
      if (hasCode && /[<{]/.test(text)) {
        const dedented = block.map((l) => l.replace(/^( {4}|\t)/, ""))
        out.push("```text", ...dedented, "```")
        i = i + block.length
        continue
      }
    }
    out.push(lines[i])
    i++
  }
  return out.join("\n")
}

function fenceAwareIndentedCode(body) {
  const parts = body.split(/(```[\s\S]*?```)/g)
  return parts.map((part, i) => (i % 2 === 1 ? part : fenceIndentedCode(part))).join("")
}

// Escape stray `<` in prose (e.g. "<|endoftext|>") so MDX does not treat it
// as a JSX tag. Skips fenced code, inline code spans, and math spans.
function protectInline(part) {
  const segs = part.split(/(`[^`]*`|\$\$[\s\S]*?\$\$|\$[^$\n]*\$)/g)
  return segs
    .map((s, i) => (i % 2 === 1 ? s : s.replace(/<(?![A-Za-z/!])/g, "&lt;")))
    .join("")
}

function fenceAwareEscape(body) {
  const parts = body.split(/(```[\s\S]*?```)/g)
  return parts.map((p, i) => (i % 2 === 1 ? p : protectInline(p))).join("")
}

function fenceAwareMath(body) {
  const parts = body.split(/(```[\s\S]*?```)/g)
  return parts
    .map((part, i) => {
      if (i % 2 === 1) return part // fenced code, leave untouched
      return part
        .replace(/\\\[/g, "$$$$")
        .replace(/\\\]/g, "$$$$")
        .replace(/\\\(/g, "$")
        .replace(/\\\)/g, "$")
    })
    .join("")
}

function attr(attrs, name) {
  const m = attrs.match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`))
  return m ? m[1] : undefined
}

function transformBody(body, prefix) {
  let out = body

  // codecaption -> <CodeCaption> wrapping a fenced code block (consumes inner first)
  out = out.replace(
    /{{<\s*codecaption\s+([\s\S]*?)>}}([\s\S]*?){{<\s*\/codecaption\s*>}}/g,
    (_, a, inner) => {
      const lang = attr(a, "lang") || "text"
      const title = attr(a, "title") || ""
      const code = inner.replace(/^\n+/, "").replace(/\n+$/, "")
      return `\n<CodeCaption title=${yamlStr(title)} lang=${yamlStr(lang)}>\n\n\`\`\`${lang}\n${code}\n\`\`\`\n\n</CodeCaption>\n`
    }
  )

  // figure -> <Figure src=...>caption</Figure>
  out = out.replace(/{{<\s*figure\s+([\s\S]*?)>}}/g, (_, a) => {
    let src = attr(a, "src") || ""
    if (!/^https?:|^\//.test(src)) src = prefix + src
    const caption = attr(a, "caption") || ""
    const alt = attr(a, "alt")
    const altAttr = alt ? ` alt=${yamlStr(alt)}` : ""
    return `\n<Figure src=${yamlStr(src)}${altAttr}>\n${caption}\n</Figure>\n`
  })

  // inlinesvg -> <InlineSVG src=... />
  out = out.replace(/{{<\s*inlinesvg\s+([\s\S]*?)>}}/g, (_, a) => {
    let src = attr(a, "src") || ""
    if (!/^https?:|^\//.test(src)) src = prefix + src
    return `\n<InlineSVG src=${yamlStr(src)} />\n`
  })

  // excursion open/close
  out = out.replace(/{{<\s*excursion\s+([\s\S]*?)>}}/g, (_, a) => {
    const anchor = attr(a, "anchor")
    const title = attr(a, "title") || ""
    const anchorAttr = anchor ? ` anchor=${yamlStr(anchor)}` : ""
    return `\n<Excursion title=${yamlStr(title)}${anchorAttr}>\n`
  })
  out = out.replace(/{{<\s*\/excursion\s*>}}/g, `\n</Excursion>\n`)

  // details open/close  ({{< details "Title" >}})
  out = out.replace(/{{<\s*details\s+"([\s\S]*?)"\s*>}}/g, (_, t) => {
    return `\n<Details title=${yamlStr(t)}>\n`
  })
  out = out.replace(/{{<\s*\/details\s*>}}/g, `\n</Details>\n`)

  out = fenceAwareIndentedCode(out)
  out = fenceAwareMath(out)
  out = fenceAwareEscape(out)
  return out
}

const COMPONENT_RE = /<(Figure|Excursion|Details|CodeCaption|InlineSVG)\b/

function copyAssets(srcDir, destDir) {
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (entry.name.includes("Zone.Identifier")) continue
    const sp = path.join(srcDir, entry.name)
    const dp = path.join(destDir, entry.name)
    if (entry.isDirectory()) {
      fs.mkdirSync(dp, { recursive: true })
      copyAssets(sp, dp)
    } else if (!/\.md$/i.test(entry.name)) {
      fs.mkdirSync(path.dirname(dp), { recursive: true })
      fs.copyFileSync(sp, dp)
    }
  }
}

const report = []
for (const topic of TOPICS) {
  const topicDir = path.join(SRC_ROOT, topic)
  if (!fs.existsSync(topicDir)) continue
  for (const dirent of fs.readdirSync(topicDir, { withFileTypes: true })) {
    if (!dirent.isDirectory()) continue
    const postSrc = path.join(topicDir, dirent.name)
    const indexPath = path.join(postSrc, "index.md")
    if (!fs.existsSync(indexPath)) continue

    const slug = dirent.name.toLowerCase()
    const prefix = `/posts/${topic}/${slug}/`
    const raw = fs.readFileSync(indexPath, "utf8")
    const { data: fm, content } = parseFrontMatter(raw)

    const date = fm.date instanceof Date ? fm.date.toISOString() : String(fm.date)
    const desc = isPlaceholder(fm.description) ? "" : fm.description || ""
    const tags = Array.isArray(fm.tags) ? fm.tags : []
    const math = fm.math === true

    const fmLines = [
      "---",
      `title: ${yamlStr(fm.title || dirent.name)}`,
      `description: ${yamlStr(desc)}`,
      `date: ${date}`,
      `topic: ${topic}`,
      `tags: [${tags.map(yamlStr).join(", ")}]`,
      `kind: essay`,
    ]
    if (math) fmLines.push(`math: true`)
    if (fm.draft === true) fmLines.push(`draft: true`)
    fmLines.push("---", "")

    const body = transformBody(content, prefix)
    const ext = COMPONENT_RE.test(body) ? "mdx" : "md"
    const leftover = /{{[<%]/.test(body)

    const outDir = path.join(OUT_CONTENT, topic, slug)
    fs.mkdirSync(outDir, { recursive: true })
    fs.writeFileSync(path.join(outDir, `index.${ext}`), fmLines.join("\n") + body)

    const pubDir = path.join(OUT_PUBLIC, topic, slug)
    fs.mkdirSync(pubDir, { recursive: true })
    copyAssets(postSrc, pubDir)

    report.push(`${topic}/${slug} -> .${ext}${math ? " [math]" : ""}${leftover ? " !! LEFTOVER SHORTCODE" : ""}`)
  }
}
console.log(report.join("\n"))
console.log(`\nMigrated ${report.length} posts.`)
