// Shared constants + helpers for the overpopulation essay's interactive data-viz
// islands. The whole essay obeys ONE strict dark-mode palette: figures sit on the
// pitch-black page (#000000) with transparent backgrounds and off-white text, so the
// charts read as part of the prose rather than as boxed-in widgets.

// --- palette (mirrors the spec at the top of the essay draft) -------------------
export const VIZ = {
  focus: "#ff5470", // India / the country in focus
  other: "#4cc9f0", // the comparison / reversal countries
  gold: "#ffd166", // the third register (China, the "denser yet livable" lead-in)
  neutral: "#8d99ae", // unremarkable countries
  noData: "#2b2b2b", // countries with no value
  noDataBorder: "#3a3a3a",
  text: "#e8e8e8", // off-white body text
  axis: "#9aa0a6", // axis labels / ticks
  grid: "rgba(255,255,255,0.08)", // gridlines
  panel: "#111111", // tooltip background
  panelBorder: "rgba(255,255,255,0.12)",
} as const

// Sequential dark->bright ramp (an inferno-flavoured set of stops) used by the
// choropleths. Never fades to white at the top so it stays legible on black.
export const INFERNO = [
  "#1b0c41",
  "#4a0c6b",
  "#781c6d",
  "#a52c60",
  "#cf4446",
  "#ed6925",
  "#fb9b06",
  "#f7d13d",
]

// Single-hue ramp for the choropleths: one colour (the site's cyan), letting pure
// INTENSITY carry the meaning on the pitch-black page. Low end stays dark-but-visible
// and distinct from the no-data grey; high end glows. The coral key-country outlines
// pop against it.
// Single-hue ramp for the choropleths, ordered low -> high density.
// Sparse places read pale; dense places deepen to a saturated blue that still
// stands clear of the black canvas, so "darker = more dense".
export const MONO = [
  "#dff4ff",
  "#9bdcf1",
  "#54b4dc",
  "#2f86bb",
  "#1f5c8e",
  "#163f63",
]

export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

// Minimal CSV parser that tolerates quoted fields (none of our files use them today,
// but staying safe costs little). Returns an array of row objects keyed by header.
export function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = []
  let field = ""
  let row: string[] = []
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else inQuotes = false
      } else field += c
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ",") {
      row.push(field)
      field = ""
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++
      if (field !== "" || row.length) {
        row.push(field)
        rows.push(row)
        row = []
        field = ""
      }
    } else field += c
  }
  if (field !== "" || row.length) {
    row.push(field)
    rows.push(row)
  }
  const header = rows.shift() || []
  return rows
    .filter((r) => r.length && r.some((c) => c.trim() !== ""))
    .map((r) => {
      const obj: Record<string, string> = {}
      header.forEach((h, idx) => (obj[h.trim()] = (r[idx] ?? "").trim()))
      return obj
    })
}

// Natural Earth tags France / Norway / Kosovo with ISO_A3 "-99"; our world.geojson
// keys those features by ADM0_A3 instead, so remap the few CSV rows that carry -99.
const ISO_FIX: Record<string, string> = {
  France: "FRA",
  Norway: "NOR",
  Kosovo: "KOS",
}

export function normaliseIso(iso: string, country: string): string {
  if (iso && iso !== "-99") return iso
  return ISO_FIX[country] || iso
}

// Format a number with thousands separators (e.g. 10060 -> "10,060").
export const fmt = (n: number): string =>
  Number.isFinite(n) ? Math.round(n).toLocaleString("en-US") : "—"

// Shared tooltip styling for every chart.
export const tooltipStyle = {
  backgroundColor: VIZ.panel,
  borderColor: VIZ.panelBorder,
  borderWidth: 1,
  textStyle: { color: VIZ.text, fontSize: 13 },
  extraCssText: "border-radius:6px;box-shadow:0 6px 24px rgba(0,0,0,0.5);",
} as const
