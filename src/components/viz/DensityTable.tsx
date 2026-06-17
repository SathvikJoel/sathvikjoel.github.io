import { For, createMemo, createSignal, onMount } from "solid-js"
import { VIZ, fmt, parseCSV } from "./viz-shared"

type Props = { src: string }

type Row = {
  iso: string
  country: string
  lived: number
  arith: number
  C: number
}

type SortKey = "rank" | "country" | "lived" | "arith" | "C" | "ratio"

// Sortable, searchable table of every country's lived density. The final column is
// computed live in the browser: each country's lived density divided by a reference
// country's (India by default), so "how India compares" is scannable at a glance.
export default function DensityTable(props: Props) {
  const [rows, setRows] = createSignal<Row[]>([])
  const [query, setQuery] = createSignal("")
  const [reference, setReference] = createSignal("India")
  const [sortKey, setSortKey] = createSignal<SortKey>("lived")
  const [sortDir, setSortDir] = createSignal<1 | -1>(-1)

  onMount(async () => {
    const parsed = parseCSV(await (await fetch(props.src)).text())
    const data: Row[] = parsed
      .map((r) => ({
        iso: r.iso_a3,
        country: r.country,
        lived: parseFloat(r.lived_density),
        arith: parseFloat(r.arith_density_grid),
        C: parseFloat(r.C),
      }))
      .filter((r) => Number.isFinite(r.lived))
      .sort((a, b) => b.lived - a.lived)
    setRows(data)
  })

  // Rank is fixed by lived density (1 = densest), independent of the current sort.
  const rankOf = createMemo(() => {
    const m = new Map<string, number>()
    rows().forEach((r, i) => m.set(r.iso, i + 1))
    return m
  })

  const referenceLived = createMemo(() => {
    const ref = rows().find((r) => r.country === reference())
    return ref ? ref.lived : NaN
  })

  const view = createMemo(() => {
    const q = query().trim().toLowerCase()
    const refLived = referenceLived()
    const list = rows()
      .filter((r) => !q || r.country.toLowerCase().includes(q))
      .map((r) => ({ ...r, ratio: r.lived / refLived }))
    const key = sortKey()
    const dir = sortDir()
    const ranks = rankOf()
    return list.sort((a, b) => {
      let av: number | string
      let bv: number | string
      if (key === "country") {
        av = a.country
        bv = b.country
      } else if (key === "rank") {
        av = ranks.get(a.iso) || 0
        bv = ranks.get(b.iso) || 0
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
      setSortDir(key === "country" ? 1 : -1)
    }
  }

  const arrow = (key: SortKey) =>
    sortKey() === key ? (sortDir() === 1 ? " ▲" : " ▼") : ""

  const ratioColour = (ratio: number, isRef: boolean) =>
    isRef ? VIZ.gold : ratio > 1 ? VIZ.focus : VIZ.other

  return (
    <div class="not-prose my-6 font-sans text-[#e8e8e8]">
      <div class="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-[#9aa0a6]">
          Search country
          <input
            type="text"
            value={query()}
            onInput={(e) => setQuery(e.currentTarget.value)}
            placeholder="Type a name…"
            class="w-full rounded border border-white/15 bg-white/[0.04] px-3 py-1.5 text-sm text-[#e8e8e8] placeholder:text-[#9aa0a6]/60 focus:border-[#4cc9f0]/60 focus:outline-none sm:w-52"
          />
        </label>
        <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-[#9aa0a6]">
          Compare against
          <select
            value={reference()}
            onChange={(e) => setReference(e.currentTarget.value)}
            class="w-full rounded border border-white/15 bg-white/[0.04] px-3 py-1.5 text-sm text-[#e8e8e8] focus:border-[#4cc9f0]/60 focus:outline-none sm:w-52"
          >
            <For each={[...rows()].sort((a, b) => a.country.localeCompare(b.country))}>
              {(r) => (
                <option value={r.country} style="background-color:#111;color:#e8e8e8">
                  {r.country}
                </option>
              )}
            </For>
          </select>
        </label>
      </div>

      <p class="mb-2 text-sm text-[#9aa0a6]">
        India is denser-lived than about 85% of all countries, 36th of 242.
      </p>

      <div class="max-h-[460px] overflow-auto rounded border border-white/10">
        <table class="density-table w-full border-collapse text-sm">
          <thead class="sticky top-0 z-10 bg-[#0a0a0a] text-left">
            <tr class="text-[#9aa0a6]">
              <th class="cursor-pointer px-3 py-2 font-medium" onClick={() => toggleSort("rank")}>#{arrow("rank")}</th>
              <th class="cursor-pointer px-3 py-2 font-medium" onClick={() => toggleSort("country")}>Country{arrow("country")}</th>
              <th class="cursor-pointer px-3 py-2 text-right font-medium" onClick={() => toggleSort("lived")}>Lived{arrow("lived")}</th>
              <th class="cursor-pointer px-3 py-2 text-right font-medium" onClick={() => toggleSort("arith")}>Arithmetic{arrow("arith")}</th>
              <th class="cursor-pointer px-3 py-2 text-right font-medium" onClick={() => toggleSort("C")}>C{arrow("C")}</th>
              <th class="cursor-pointer px-3 py-2 text-right font-medium" onClick={() => toggleSort("ratio")}>× vs {reference()}{arrow("ratio")}</th>
            </tr>
          </thead>
          <tbody>
            <For each={view()}>
              {(r, i) => {
                const isRef = r.country === reference()
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
                    <td class="px-3 py-1.5 tabular-nums text-[#9aa0a6]">{rankOf().get(r.iso)}</td>
                    <td class="px-3 py-1.5">{r.country}</td>
                    <td class="px-3 py-1.5 text-right tabular-nums">{fmt(r.lived)}</td>
                    <td class="px-3 py-1.5 text-right tabular-nums text-[#9aa0a6]">{fmt(r.arith)}</td>
                    <td class="px-3 py-1.5 text-right tabular-nums text-[#9aa0a6]">{Math.round(r.C)}×</td>
                    <td
                      class="px-3 py-1.5 text-right font-medium tabular-nums"
                      style={`color:${ratioColour(r.ratio, isRef)}`}
                    >
                      {isRef ? "1.0× (ref)" : `${r.ratio.toFixed(r.ratio >= 10 ? 0 : 1)}×`}
                    </td>
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
