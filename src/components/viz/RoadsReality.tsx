import { onCleanup, onMount } from "solid-js"
import * as echarts from "echarts"
import { VIZ, fmt, parseCSV, prefersReducedMotion, tooltipStyle } from "./viz-shared"

type Props = { src: string }

type Row = { city: string; group: string; road: number; veh: number; time: number }

// The four study groups, as they appear verbatim in the `group` column, mapped to the
// shared viz palette so colours stay consistent with the other Part 2/3 figures.
const GROUP_COLOUR: Record<string, string> = {
  "India's metros": VIZ.focus,
  "Dense and livable": VIZ.other,
  "Lower-density developed": VIZ.gold,
  "Developing cities": VIZ.neutral,
}
const LEGEND = Object.keys(GROUP_COLOUR)

// Three small-multiple road metrics. Each panel is sorted INDEPENDENTLY by its own metric,
// worst city at the top (every bar carries its own city label, so the panels need not share
// a row order). `worstIsHigh` says whether a high value is the bad end; `drop` removes rows
// with no data for that metric (only the commute panel, where three cities are missing).
const PANELS: {
  key: keyof Row
  title: string
  fmt: (v: number) => string
  worstIsHigh: boolean
}[] = [
  { key: "road", title: "Road per person (m)", fmt: (v) => v.toFixed(2), worstIsHigh: false },
  { key: "veh", title: "Vehicles per 1,000 people", fmt: (v) => fmt(v), worstIsHigh: true },
  { key: "time", title: "Minutes to drive 10 km", fmt: (v) => v.toFixed(1), worstIsHigh: true },
]

export default function RoadsReality(props: Props) {
  const els: HTMLDivElement[] = []
  const charts: echarts.ECharts[] = []
  const setRef = (i: number) => (el: HTMLDivElement) => (els[i] = el)

  onMount(async () => {
    const all: Row[] = parseCSV(await (await fetch(props.src)).text()).map((r) => ({
      city: r.city,
      group: r.group,
      road: parseFloat(r.road_m_per_person),
      veh: parseFloat(r.vehicles_per_1000_people),
      time: parseFloat(r.time_per_10km_min),
    }))

    const build = (el: HTMLDivElement, panel: (typeof PANELS)[number]) => {
      const isPhone = el.clientWidth < 420
      // Keep only rows with a value for this metric, then sort so the worst city is LAST in
      // the array — ECharts renders the last category at the top, giving us "worst on top".
      const rows = all
        .filter((r) => Number.isFinite(r[panel.key] as number))
        .sort((a, b) =>
          panel.worstIsHigh
            ? (a[panel.key] as number) - (b[panel.key] as number)
            : (b[panel.key] as number) - (a[panel.key] as number),
        )
      const cities = rows.map((r) => r.city)
      const colours = rows.map((r) => GROUP_COLOUR[r.group] ?? VIZ.neutral)

      const chart = echarts.init(el, undefined, { renderer: "canvas" })
      chart.setOption({
        backgroundColor: "transparent",
        animation: !prefersReducedMotion(),
        grid: { left: 4, right: isPhone ? 40 : 48, top: 6, bottom: 24, containLabel: true },
        tooltip: {
          ...tooltipStyle,
          trigger: "item",
          formatter: (p: any) => `<strong>${p.name}</strong><br/>${panel.title}: ${panel.fmt(p.value)}`,
        },
        xAxis: {
          type: "value",
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: VIZ.axis, fontFamily: "Lato, sans-serif", fontSize: 10, formatter: (v: number) => fmt(v) },
          splitLine: { lineStyle: { color: VIZ.grid } },
        },
        yAxis: {
          type: "category",
          data: cities,
          axisLine: { lineStyle: { color: VIZ.axis } },
          axisTick: { show: false },
          axisLabel: { color: VIZ.text, fontFamily: "Lato, sans-serif", fontSize: isPhone ? 10 : 11 },
        },
        series: [
          {
            type: "bar",
            barWidth: "62%",
            data: rows.map((r, i) => ({ value: r[panel.key], itemStyle: { color: colours[i], borderRadius: [0, 3, 3, 0] } })),
            label: {
              show: true,
              position: "right",
              color: VIZ.text,
              fontFamily: "Lato, sans-serif",
              fontSize: isPhone ? 9 : 10,
              formatter: (p: any) => panel.fmt(p.value),
            },
          },
        ],
      })
      charts.push(chart)
    }

    PANELS.forEach((panel, i) => build(els[i], panel))

    const ro = new ResizeObserver(() => charts.forEach((c) => c.resize()))
    els.forEach((el) => ro.observe(el))
    onCleanup(() => {
      ro.disconnect()
      charts.forEach((c) => c.dispose())
    })
  })

  return (
    <div class="not-prose">
      <div class="mb-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-[#9aa0a6]">
        {LEGEND.map((g) => (
          <span>
            <span class="mr-1 inline-block h-2.5 w-2.5 rounded-full align-middle" style={`background:${GROUP_COLOUR[g]}`} />
            {g}
          </span>
        ))}
      </div>
      <div class="flex flex-col gap-6 sm:flex-row sm:gap-4">
        {PANELS.map((panel, i) => (
          <div class="flex-1">
            <p class="mb-1 text-center font-sans text-sm text-[#e8e8e8]">{panel.title}</p>
            <div
              ref={setRef(i)}
              class="h-[440px] w-full sm:h-[500px]"
              role="img"
              aria-label={`Horizontal bar chart of fifteen cities by ${panel.title}, coloured by group, same row order across panels.`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
