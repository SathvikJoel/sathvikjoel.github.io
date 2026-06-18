import rss from "@astrojs/rss"
import { getCollection } from "astro:content"
import { SITE } from "@consts"
import { postUrl } from "@lib/utils"

type Context = {
  site: string
}

export async function GET(context: Context) {
  const posts = (await getCollection("posts")).filter((p) => !p.data.draft && !p.data.unlisted)

  posts.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime())

  return rss({
    title: SITE.TITLE,
    description: SITE.DESCRIPTION,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      categories: [post.data.topic, ...post.data.tags],
      link: `${postUrl(post.slug)}/`,
    })),
  })
}
