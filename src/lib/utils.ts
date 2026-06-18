import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Post slugs are flat single segments (the content folder name), and posts are served at
// /posts/<slug>. The stream a post belongs to is decided by its `topic` frontmatter, not
// its location, so a post can move between streams just by editing frontmatter — its URL
// never changes. postLeaf tolerates a legacy "<topic>/<folder>" slug for safety.
export function postLeaf(slug: string): string {
  return slug.split("/").pop() as string
}

export function postUrl(slug: string): string {
  return `/posts/${postLeaf(slug)}`
}

export function formatDate(date: Date) {
  return Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  }).format(date)
}

// Fuzzy relative date, e.g. "About 2 years ago", "Almost 3 years ago", "Over 1 year ago".
export function relativeDate(date: Date, now: Date = new Date()): string {
  const days = (now.getTime() - date.getTime()) / 86_400_000
  if (days < 1) return "today"
  if (days < 2) return "yesterday"

  const fuzzy = (value: number, unit: string) => {
    const base = Math.floor(value)
    const frac = value - base
    let word: string
    let n: number
    if (frac < 0.2) { word = "About"; n = base }
    else if (frac < 0.8) { word = "Over"; n = base }
    else { word = "Almost"; n = base + 1 }
    return `${word} ${n} ${unit}${n === 1 ? "" : "s"} ago`
  }

  const years = days / 365.25
  if (years >= 1) return fuzzy(years, "year")

  const months = days / 30.44
  if (months >= 1) {
    const frac = months - Math.floor(months)
    if (frac >= 0.8 && Math.floor(months) + 1 >= 12) return "Almost 1 year ago"
    return fuzzy(months, "month")
  }

  const weeks = Math.round(days / 7)
  if (weeks >= 1) return `${weeks} week${weeks === 1 ? "" : "s"} ago`
  const d = Math.round(days)
  return `${d} day${d === 1 ? "" : "s"} ago`
}

// Estimate reading time from a post's raw MDX source. The body is Markdown/MDX,
// not HTML, so we strip the things that aren't prose the reader actually reads:
// code fences, inline code, JSX/HTML tags, MDX import/export lines, and Markdown
// punctuation. Counting those (especially fenced code and component markup) would
// badly inflate the word count.
export function readingTime(markdown: string) {
  const prose = markdown
    .replace(/^---\n[\s\S]*?\n---/, "")        // frontmatter (defensive)
    .replace(/```[\s\S]*?```/g, "")             // fenced code blocks
    .replace(/`[^`]*`/g, "")                    // inline code
    .replace(/^(?:import|export)\s.*$/gm, "")  // MDX import/export statements
    .replace(/<[^>]+>/g, " ")                   // JSX / HTML tags
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")       // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")   // links → keep the link text
    .replace(/[#>*_~`|=-]/g, " ")               // Markdown punctuation
    .replace(/\$\$[\s\S]*?\$\$/g, "")           // block math
    .replace(/\$[^$]*\$/g, "")                  // inline math

  const wordCount = prose.split(/\s+/).filter(Boolean).length
  const readingTimeMinutes = Math.max(1, Math.round(wordCount / 200))
  return `${readingTimeMinutes} min read`
}


export function truncateText(str: string, maxLength: number): string {
  const ellipsis = '…';

  if (str.length <= maxLength) return str;

  const trimmed = str.trimEnd();
  if (trimmed.length <= maxLength) return trimmed;

  const cutoff = maxLength - ellipsis.length;
  let sliced = str.slice(0, cutoff).trimEnd();

  return sliced + ellipsis;
}