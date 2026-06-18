import type { CollectionEntry } from "astro:content"

type Post = CollectionEntry<"posts">

// Post slugs are flat single segments (e.g. "04032024_tokenizer"), so the leaf is the
// slug itself. Kept as a helper for clarity and defensiveness.
function leaf(slug: string): string {
  const parts = slug.split("/")
  return parts[parts.length - 1]
}

// Does `from`'s body link to `to`? Matches a flat /posts/<slug> link or a [[wikilink]].
function linksTo(from: Post, to: Post): boolean {
  const body = from.body
  const leafName = leaf(to.slug)
  if (body.includes(`/posts/${to.slug}`)) return true
  const wiki = new RegExp(`\\[\\[\\s*${leafName}\\s*\\]\\]`, "i")
  return wiki.test(body)
}

// Posts that link TO `post` — the "Linked from" backlinks (the garden web).
export function getBacklinks(post: Post, all: Post[]): Post[] {
  return all
    .filter((p) => p.slug !== post.slug && !p.data.draft && linksTo(p, post))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
}

// Topic + shared-tag related posts, used as a fallback so connections are never empty.
export function getRelated(post: Post, all: Post[], exclude: Post[] = [], limit = 3): Post[] {
  const excludeSlugs = new Set([post.slug, ...exclude.map((p) => p.slug)])
  const tags = new Set(post.data.tags)
  return all
    .filter((p) => !excludeSlugs.has(p.slug) && !p.data.draft)
    .map((p) => {
      let score = 0
      if (p.data.topic === post.data.topic) score += 2
      for (const t of p.data.tags) if (tags.has(t)) score += 1
      return { p, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.p.data.date.getTime() - a.p.data.date.getTime())
    .slice(0, limit)
    .map((x) => x.p)
}
