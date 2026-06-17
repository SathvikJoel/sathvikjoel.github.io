// remark-block-id — Obsidian-style block reference markers.
//
// Author a stable, human-chosen anchor by ending a block with a caret marker:
//
//   ### Reproduction workflow ^workflow
//   We cleaned the data in three passes. ^cleaning
//
// The trailing `^id` is stripped from the rendered text and turned into the
// block's `id` attribute, so you can link to it from anywhere with a normal
// markdown link: `[see the workflow](#workflow)`. Unlike auto-slugged headings
// (lowercased, hyphenated from the text), the id is exactly what you typed —
// short, stable, and rename-proof when you reword the heading.
//
// Marker syntax: a space, a caret, then letters/digits/`-`/`_`, at the very end
// of a paragraph, heading, list item, or blockquote (e.g. ` ^my-id`).

const CARET = /\s*\^([A-Za-z0-9_-]+)\s*$/
const BLOCK = new Set(["paragraph", "heading", "listItem", "blockquote"])

function walk(node) {
  if (Array.isArray(node.children)) {
    for (const child of node.children) walk(child)

    if (BLOCK.has(node.type) && node.children.length) {
      const last = node.children[node.children.length - 1]
      if (last && last.type === "text") {
        const match = last.value.match(CARET)
        if (match) {
          last.value = last.value.replace(CARET, "")
          if (last.value === "") node.children.pop()
          node.data = node.data || {}
          node.data.hProperties = { ...(node.data.hProperties || {}), id: match[1] }
        }
      }
    }
  }
}

export function remarkBlockId() {
  return (tree) => walk(tree)
}

export default remarkBlockId
