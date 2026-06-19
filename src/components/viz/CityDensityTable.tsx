import { For, createMemo, createSignal, onMount } from "solid-js"
import { VIZ, fmt, parseCSV } from "./viz-shared"

type Props = { src: string }

type Row = {
  id: string
  city: string
  country: string
  pop: number
  lived: number
  arith: number
  C: number
}

type SortKey = "rank" | "city" | "country" | "pop" | "lived" | "arith" | "C"

// Sortable, searchable table of every major city's (population > 1M) lived density.
// India's 76 cities stay highlighted at any sort order so they can be picked out while
// scrolling, with an optional filter to show only Indian cities.
export default function CityDensityTable(props: Props) {
  const [rows, setRows] = createSignal<Row[]>([])
  const [query, setQuery] = createSignal("")
  const [indiaOnly, setIndiaOnly] = createSignal(false)
  const [sortKey, setSortKey] = createSignal<SortKey>("lived")
  const [sortDir, setSortDir] = createSignal<1 | -1>(-1)

  onMount(async () => {
    const data: Row[] = parseCSV(await (await fetch(props.src)).text())
      .map((r) => ({
        id: r.ucdb_id,
        city: r.city,
        country: r.country,
        pop: parseFloat(r.pop_M),
        lived: parseFloat(r.lived_density),
        arith: parseFloat(r.arith_density),
        C: parseFloat(r.C),
      }))
      .filter((r) => Number.isFinite(r.lived))
      .sort((a, b) => b.lived - a.lived)
    setRows(data)
  })

  // Rank is fixed by lived density (1 = densest), independent of the current sort.
  const rankOf = createMemo(() => {
    const m = new Map<string, number>()
    rows().forEach((r, i) => m.set(r.id, i + 1))
    return m
  })

  const indiaCount = createMemo(() => rows().filter((r) => r.country === "India").length)

  const view = createMemo(() => {
    const q = query().trim().toLowerCase()
    const only = indiaOnly()
    const list = rows().filter((r) => {
      if (only && r.country !== "India") return false
      if (!q) return true
      return r.city.toLowerCase().includes(q) || r.country.toLowerCase().includes(q)
    })
    const key = sortKey()
    const dir = sortDir()
    const ranks = rankOf()
    return [...list].sort((a, b) => {
      let av: number | string
      let bv: number | string
      if (key === "city") {
        av = a.city
        bv = b.city
      } else if (key === "country") {
        av = a.country
        bv = b.country
      } else if (key === "rank") {
        av = ranks.get(a.id) || 0
        bv = ranks.get(b.id) || 0
      } else {
        av = a[key]
        bv = b[key]
      }
      if (av < bv) return -dir
      if (av > bv) return dir
      return 0
    })
  })

  const toggleSort = (key: SortKey) => {
    if (sortKey() === key) setSortDir((d) => (d === 1 ? -1 : 1))
    else {
      setSortKey(key)
      setSortDir(key === "city" || key === "country" ? 1 : -1)
    }
  }

  const arrow = (key: SortKey) => (sortKey() === key ? (sortDir() === 1 ? " ▲" : " ▼") : "")

  return (
    <div class="not-prose my-6 font-sans text-[#e8e8e8]">
      <div class="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-[#9aa0a6]">
          Search city or country
          <input
            type="text"
            value={query()}
            onInput={(e) => setQuery(e.currentTarget.value)}
            placeholder="Type a name…"
            class="w-full rounded border border-white/15 bg-white/[0.04] px-3 py-1.5 text-sm text-[#e8e8e8] placeholder:text-[#9aa0a6]/60 focus:border-[#4cc9f0]/60 focus:outline-none sm:w-60"
          />
        </label>
        <label class="flex cursor-pointer items-center gap-2 text-sm text-[#e8e8e8]">
          <input
            type="checkbox"
            checked={indiaOnly()}
            onChange={(e) => setIndiaOnly(e.currentTarget.checked)}
            class="h-4 w-4 accent-[#ff5470]"
          />
          Show Indian cities only
        </label>
      </div>

      <p class="mb-2 text-sm text-[#9aa0a6]">
        520 cities over 1&nbsp;million people, across 127 countries. India accounts for{" "}
        {indiaCount()}, and 19 of the world's 100 densest-lived major cities are Indian.
      </p>

      <div class="max-h-[460px] overflow-auto rounded border border-white/10">
        <table class="density-table w-full border-collapse text-sm">
          <thead class="sticky top-0 z-10 bg-[#0a0a0a] text-left">
            <tr class="text-[#9aa0a6]">
              <th class="cursor-pointer px-3 py-2 font-medium" onClick={() => toggleSort("rank")}>#{arrow("rank")}</th>
              <th class="cursor-pointer px-3 py-2 font-medium" onClick={() => toggleSort("city")}>City{arrow("city")}</th>
              <th class="cursor-pointer px-3 py-2 font-medium" onClick={() => toggleSort("country")}>Country{arrow("country")}</th>
              <th class="cursor-pointer px-3 py-2 text-right font-medium" onClick={() => toggleSort("pop")}>Pop (M){arrow("pop")}</th>
              <th class="cursor-pointer px-3 py-2 text-right font-medium" onClick={() => toggleSort("lived")}>Lived{arrow("lived")}</th>
              <th class="cursor-pointer px-3 py-2 text-right font-medium" onClick={() => toggleSort("arith")}>Arithmetic{arrow("arith")}</th>
              <th class="cursor-pointer px-3 py-2 text-right font-medium" onClick={() => toggleSort("C")}>C{arrow("C")}</th>
            </tr>
          </thead>
          <tbody>
            <For each={view()}>
              {(r, i) => {
                const isIndia = r.country === "India"
                return (
                  <tr
                    class="border-t border-white/5"
                    classList={{
                      "bg-white/[0.03]": i() % 2 === 1 && !isIndia,
                      "bg-[#ff5470]/10": isIndia,
                    }}
                    style={isIndia ? "box-shadow: inset 3px 0 0 #ff5470" : ""}
                  >
                    <td class="px-3 py-1.5 tabular-nums text-[#9aa0a6]">{rankOf().get(r.id)}</td>
                    <td class="px-3 py-1.5" style={isIndia ? `color:${VIZ.focus}` : ""}>{r.city}</td>
                    <td class="px-3 py-1.5 text-[#9aa0a6]">{r.country}</td>
                    <td class="px-3 py-1.5 text-right tabular-nums text-[#9aa0a6]">{r.pop.toFixed(1)}</td>
                    <td class="px-3 py-1.5 text-right tabular-nums">{fmt(r.lived)}</td>
                    <td class="px-3 py-1.5 text-right tabular-nums text-[#9aa0a6]">{fmt(r.arith)}</td>
                    <td class="px-3 py-1.5 text-right tabular-nums text-[#9aa0a6]">{r.C.toFixed(1)}×</td>
                  </tr>
                )
              }}
            </For>
          </tbody>
        </table>
      </div>
    </div>
  )
}
