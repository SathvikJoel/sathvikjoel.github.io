import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import tailwind from "@astrojs/tailwind"
import solidJs from "@astrojs/solid-js"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import { remarkBlockId } from "./src/plugins/remark-block-id.mjs"
import expressiveCode from "astro-expressive-code"
import { readdirSync, readFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import matter from "gray-matter"

const monoFont =
  '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace'

// Walk src/content/posts (now a flat list of <slug> folders) and collect each post's
// slug, its current `topic` (from frontmatter — the folder no longer encodes it), and
// whether it's hidden (draft/unlisted). We read frontmatter directly so the sitemap
// exclusion and the legacy redirects stay in sync with the content instead of a
// hardcoded list.
function collectPosts() {
  const root = "src/content/posts"
  const posts = []
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const dir = join(root, entry.name)
    const index = ["index.md", "index.mdx"]
      .map((name) => join(dir, name))
      .find((p) => existsSync(p))
    if (!index) continue
    const { data } = matter(readFileSync(index, "utf8"))
    posts.push({
      slug: entry.name,
      topic: data.topic,
      hidden: Boolean(data.draft || data.unlisted),
    })
  }
  return posts
}

const allPosts = collectPosts()

// Posts are served at the flat /posts/<slug>, so hidden-post URL fragments use the slug.
const hiddenFragments = allPosts.filter((p) => p.hidden).map((p) => `/posts/${p.slug}`)

// Posts live at /posts/<slug> (no stream segment) so they can move between streams just
// by editing frontmatter. Forward every legacy /posts/<topic>/<slug> URL — which may be
// shared on the web — to its flat equivalent, derived from the post's *current* topic.
// (Posts that have changed streams need a manual redirect for their *old* topic path —
// see the redirects block below.) Astro emits a static meta-refresh + canonical page for
// each on GitHub Pages.
const legacyPostRedirects = Object.fromEntries(
  allPosts
    .filter((p) => p.topic)
    .map((p) => [`/posts/${p.topic}/${p.slug}`, `/posts/${p.slug}`])
)

// https://astro.build/config
export default defineConfig({
  site: "https://sathvikjoel.github.io",
  // Legacy URLs from the old Hugo site that Google still has indexed. They 404'd
  // after the Astro rebuild (a 404 lingers in the index for weeks and can outrank
  // the homepage), so we forward them to live pages to consolidate ranking signal.
  // Astro emits a static meta-refresh + canonical page for each on GitHub Pages.
  redirects: {
    "/archives": "/",
    "/archive": "/",
    "/tags": "/",
    "/categories": "/",
    // Posts that have moved streams: forward the old stream paths straight to the
    // flat URL so there's no double hop.
    "/posts/life/12222025_kora": "/posts/12222025_kora",
    "/posts/life/29052026_greek": "/posts/29052026_greek",
    // Posts shared publicly (e.g. on Twitter) under their current stream path. Pin
    // these so the shared URL keeps resolving even if the post later moves streams
    // (the auto list below only covers a post's *current* path).
    "/posts/tech/16062026_aiwriting": "/posts/16062026_aiwriting",
    "/posts/essays/overpopulation": "/posts/overpopulation",
    // Every /posts/<current-topic>/<slug> → /posts/<slug>, auto-generated from frontmatter.
    ...legacyPostRedirects,
  },
  markdown: {
    remarkPlugins: [remarkMath, remarkBlockId],
    rehypePlugins: [rehypeKatex],
  },
  integrations: [
    expressiveCode({
      themes: ["github-dark"],
      // Match the site's dark, low-rounding aesthetic.
      styleOverrides: {
        borderRadius: "0.2rem",
        borderColor: "rgba(255,255,255,0.10)",
        codeFontFamily: monoFont,
        codeFontSize: "0.9rem",
        codeLineHeight: "1.6",
        uiFontFamily: "Lato, ui-sans-serif, system-ui, sans-serif",
        frames: {
          editorTabBarBackground: "#101012",
          editorActiveTabBackground: "#18181B",
          editorActiveTabIndicatorBottomColor: "#3DD6ED",
          terminalTitlebarBackground: "#101012",
          shadowColor: "transparent",
        },
      },
      defaultProps: {
        // Long lines scroll by default; opt in per-fence with `wrap`.
        wrap: false,
        showLineNumbers: false,
      },
    }),
    mdx(),
    sitemap({
      // Keep draft/unlisted/private pages out of the public sitemap so search
      // engines don't index them. Draft + unlisted post URLs are derived from
      // frontmatter above; the toolkit is reachable only via the /docs handbook.
      filter: (page) =>
        !page.includes("/posts/toolkit") &&
        !Object.keys(legacyPostRedirects).some((old) => page.includes(old)) &&
        !hiddenFragments.some((fragment) => page.includes(fragment)),
    }),
    solidJs(),
    tailwind({ applyBaseStyles: false }),
  ],
})