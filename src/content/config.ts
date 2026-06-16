import { defineCollection, z } from "astro:content"

const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().default(""),
    date: z.coerce.date(),
    topic: z.enum(["tech", "life", "philosophy", "writings"]),
    tags: z.array(z.string()).default([]),
    // Growth stage — the "stage" axis every post carries (garden metaphor).
    // An unmarked post is treated as a finished, evergreen piece.
    growthStage: z.enum(["seedling", "budding", "evergreen"]).default("evergreen"),
    lastTended: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    // Unlisted: the post still builds at its URL (so it can be linked directly,
    // e.g. from the private /docs handbook) but is hidden from the homepage,
    // stream indexes, search, RSS, and related-post connections.
    unlisted: z.boolean().default(false),
    math: z.boolean().default(false),
    // Set false to turn off the large drop-cap on the opening paragraph.
    dropCap: z.boolean().default(true),
    // Set false to turn off the soft whitish glow behind the post header.
    topGlow: z.boolean().default(true),
    // Reading measure: "standard" stays at the comfortable prose width;
    // "wide" widens the column for code-heavy posts so snippets get room.
    width: z.enum(["standard", "wide"]).default("standard"),
    featured: z.boolean().default(false),
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
    // Explicit Open Graph / social share image (1200×630 recommended). When set, this exact
    // image is used as the post's share card — use it for a hand-made / Midjourney card.
    // Priority for the generated /og/<slug>.jpg card (see scripts/build-og.mjs):
    //   ogImage  →  cover / image (framed art card)  →  auto title card (last fallback).
    ogImage: z.string().optional(),
    ogImageAlt: z.string().optional(),
    // How the homepage/stream tile is rendered:
    //   "auto"  (default) — cover banner if `cover` is set, else square `image`, else plain text
    //   "cover" — force the wide cropped cover banner (needs `cover`)
    //   "image" — force the square contained illustration (needs `image`)
    //   "plain" — force a text-only tile even if cover/image are set
    // If a forced style's image is missing, it falls back gracefully to the next available.
    tile: z.enum(["auto", "cover", "image", "plain"]).default("auto"),
    // In-card tile illustration: shown inside the masonry card at 1:1 square (object-contain,
    // never cropped), NOT as a top cover banner. Works for any post. Ideal for
    // transparent PNGs/SVGs that float on the dark card surface. If `cover` is also set,
    // the cover banner takes precedence.
    image: z.string().optional(),
    imageAlt: z.string().optional(),
  }),
})

// "Now" — dated snapshots of what I'm focused on right now (à la nownownow.com).
// Kept as its own collection so updates stay out of the garden, RSS, and search;
// they live only under /now. Title is the month label, e.g. "January 2026".
const now = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
})

export const collections = { posts, now }
