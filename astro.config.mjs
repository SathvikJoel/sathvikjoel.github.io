import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import tailwind from "@astrojs/tailwind"
import solidJs from "@astrojs/solid-js"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import expressiveCode from "astro-expressive-code"
import { readdirSync, readFileSync } from "node:fs"
import { join, relative } from "node:path"
import matter from "gray-matter"

const monoFont =
  '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace'

// Walk src/content/posts and collect the URL fragments of every draft/unlisted
// post so the sitemap integration can drop them. We read frontmatter directly
// (the sitemap `filter` only receives a URL string, not the post data) so the
// exclusion stays in sync with the content instead of a hardcoded list.
function hiddenPostFragments() {
  const root = "src/content/posts"
  const fragments = []
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full)
      } else if (entry.name === "index.md" || entry.name === "index.mdx") {
        const { data } = matter(readFileSync(full, "utf8"))
        if (data.draft || data.unlisted) {
          // slug = folder path relative to the posts root, e.g. "tech/12032024_forest"
          const slug = relative(root, dir).split(/[\\/]/).join("/")
          fragments.push(`/posts/${slug}`)
        }
      }
    }
  }
  walk(root)
  return fragments
}

const hiddenFragments = hiddenPostFragments()

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
    "/about": "/",
  },
  markdown: {
    remarkPlugins: [remarkMath],
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
        !page.includes("/posts/tech/toolkit") &&
        !hiddenFragments.some((fragment) => page.includes(fragment)),
    }),
    solidJs(),
    tailwind({ applyBaseStyles: false }),
  ],
})