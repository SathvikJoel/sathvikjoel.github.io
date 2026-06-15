import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import tailwind from "@astrojs/tailwind"
import solidJs from "@astrojs/solid-js"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import expressiveCode from "astro-expressive-code"

const monoFont =
  '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace'

// https://astro.build/config
export default defineConfig({
  site: "https://sathvikjoel.github.io",
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
      // Keep unlisted/private pages out of the public sitemap so search engines
      // don't index them. The toolkit is reachable only via the /docs handbook.
      filter: (page) => !page.includes("/posts/tech/toolkit"),
    }),
    solidJs(),
    tailwind({ applyBaseStyles: false }),
  ],
})