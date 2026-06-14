import { defineCollection, z } from "astro:content"

const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().default(""),
    date: z.coerce.date(),
    topic: z.enum(["tech", "life", "philosophy"]),
    tags: z.array(z.string()).default([]),
    // Content voices: polished "essay", personal "note" (garden), short "micro" (stream).
    kind: z.enum(["essay", "note", "micro"]).default("essay"),
    // Garden metadata (chiefly for notes).
    growthStage: z.enum(["seedling", "budding", "evergreen"]).optional(),
    lastTended: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    math: z.boolean().default(false),
    featured: z.boolean().default(false),
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
  }),
})

export const collections = { posts }
