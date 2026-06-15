import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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

export function readingTime(html: string) {
  const textOnly = html.replace(/<[^>]+>/g, "")
  const wordCount = textOnly.split(/\s+/).length
  const readingTimeMinutes = ((wordCount / 200) + 1).toFixed()
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