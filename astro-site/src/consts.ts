import type { Site, Page, Links, Socials } from "@types"

// Global
export const SITE: Site = {
  TITLE: "JoeLogs",
  DESCRIPTION: "The digital garden of Sathvik Joel — essays and field notes on tech, life, and philosophy.",
  AUTHOR: "Sathvik Joel",
}

// Writing (all posts)
export const POSTS: Page = {
  TITLE: "Writing",
  DESCRIPTION: "Essays and notes growing across tech, life, and philosophy.",
}

// About Page
export const ABOUT: Page = {
  TITLE: "About",
  DESCRIPTION: "A little about Sathvik Joel.",
}

// Search Page
export const SEARCH: Page = {
  TITLE: "Search",
  DESCRIPTION: "Search all writing by keyword.",
}

// Streams — Tech / Life / Philosophy. Each is a feed you tend over time.
// LAYOUT: "masonry" = 3-column previews (like Maggie's Notes);
//         "feed"    = full posts stacked with separators (like her Smidgeons).
export const TOPICS = [
  {
    KEY: "tech",
    LABEL: "Tech",
    EMOJI: "👨‍💻",
    LAYOUT: "masonry",
    BLURB: "Notes from the machine — ML, math, and the craft of building software.",
  },
  {
    KEY: "life",
    LABEL: "Life",
    EMOJI: "🌱",
    LAYOUT: "feed",
    BLURB: "Letters from the road — travel, exams, applications, and growing up.",
  },
  {
    KEY: "philosophy",
    LABEL: "Philosophy",
    EMOJI: "🧠",
    LAYOUT: "masonry",
    BLURB: "Slow thoughts on how to think, live, and pay attention.",
  },
] as const

// Links
export const LINKS: Links = [
  { TEXT: "Home", HREF: "/" },
  { TEXT: "About", HREF: "/about" },
  { TEXT: "Resume", HREF: "/resume" },
]

// Socials
export const SOCIALS: Socials = [
  {
    NAME: "Github",
    ICON: "github",
    TEXT: "SathvikJoel",
    HREF: "https://github.com/SathvikJoel",
  },
  {
    NAME: "LinkedIn",
    ICON: "linkedin",
    TEXT: "sathvik-joel",
    HREF: "https://www.linkedin.com/in/sathvik-joel-97524b18b/",
  },
  {
    NAME: "Twitter",
    ICON: "twitter-x",
    TEXT: "JoelSathvik",
    HREF: "https://twitter.com/JoelSathvik",
  },
  {
    NAME: "Instagram",
    ICON: "instagram",
    TEXT: "its.me.sathvik",
    HREF: "https://www.instagram.com/its.me.sathvik/",
  },
  {
    NAME: "Spotify",
    ICON: "spotify",
    TEXT: "Sathvik Joel",
    HREF: "https://open.spotify.com/user/2ur48kajlcusfrez1xv8mvhtv",
  },
]
