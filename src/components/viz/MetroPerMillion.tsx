import { createSignal, onCleanup, onMount } from "solid-js"
import * as echarts from "echarts"
import { VIZ, parseCSV, prefersReducedMotion, tooltipStyle } from "./viz-shared"

type Props = { src: string }

type Row = { city: string; group: string; metro: number; times: number }

// The four study groups, as they appear verbatim in the `group` column, mapped to the
// shared viz palette so colours stay consistent with the other Part 2/3 figures.
const GROUP_COLOUR: Record<string, string> = {
  "India's metros": VIZ.focus,
  "Dense and livable": VIZ.other,
  "Lower-density developed": VIZ.gold,
  "Developing cities": VIZ.neutral,
}

// Show a multiplier like "9.2x", but Bengaluru itself (1.0) reads simply "1x".
const mult = (t: number) => (t === 1 ? "1x" : `${t.toFixed(1)}x`)

export default function MetroPerMillion(props: Props) {
  let el!: HTMLDivElement
  let chart: echarts.ECharts | undefined
  const [present, setPresent] = createSignal<string[]>([])

  onMount(async () => {
    const rows: Row[] = parseCSV(await (await fetch(props.src)).text())
      .map((r) => ({
        city: r.city,
        group: r.group,
        metro: parseFloat(r.metro_km_per_million),
        times: parseFloat(r.times_vs_bengaluru),
      }))
      .filter((r) => Number.isFinite(r.metro))
      // Ascending so ECharts renders Bengaluru (the least metro) at the very bottom and the
      // longest peers on top — the worst case anchors the foot of the chart.
      .sort((a, b) => a.metro - b.metro)

    setPresent([...new Set(rows.map((r) => r.group))])

    const isPhone = el.clientWidth < 560
    const cities = rows.map((r) => r.city)
    const colours = rows.map((r) => GROUP_COLOUR[r.group] ?? VIZ.neutral)

    chart = echarts.init(el, undefined, { renderer: "canvas" })
    chart.setOption({
      backgroundColor: "transparent",
      animation: !prefersReducedMotion(),
      grid: { left: 4, right: isPhone ? 88 : 116, top: 6, bottom: 24, containLabel: true },
      tooltip: {
        ...tooltipStyle,
        trigger: "item",
        formatter: (p: any) => {
          const r = rows[p.dataIndex]
          return `<strong>${r.city}</strong><br/>${r.metro.toFixed(1)} km of metro per million<br/>${mult(r.times)} Bengaluru`
        },
      },
      xAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: VIZ.axis, fontFamily: "Lato, sans-serif", fontSize: 10 },
        splitLine: { lineStyle: { color: VIZ.grid } },
      },
      yAxis: {
        type: "category",
        data: cities,
        axisLine: { lineStyle: { color: VIZ.axis } },
        axisTick: { show: false },
        axisLabel: { color: VIZ.text, fontFamily: "Lato, sans-serif", fontSize: isPhone ? 11 : 12 },
      },
      series: [
        {
          type: "bar",
          barWidth: isPhone ? 14 : 18,
          data: rows.map((r, i) => ({ value: r.metro, itemStyle: { color: colours[i], borderRadius: [0, 3, 3, 0] } })),
          label: {
            show: true,
            position: "right",
            color: VIZ.text,
            fontFamily: "Lato, sans-serif",
            fontSize: isPhone ? 10 : 11,
            formatter: (p: any) => {
              const r = rows[p.dataIndex]
              return `${r.metro.toFixed(1)} km  (${mult(r.times)})`
            },
          },
        },
      ],
    })

    const ro = new ResizeObserver(() => chart?.resize())
    ro.observe(el)
    onCleanup(() => {
      ro.disconnect()
      chart?.dispose()
    })
  })

  const LEGEND = Object.keys(GROUP_COLOUR)
  return (
    <div class="not-prose">
      <div class="mb-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-[#9aa0a6]">
        {LEGEND.filter((g) => present().includes(g)).map((g) => (
          <span>
            <span class="mr-1 inline-block h-2.5 w-2.5 rounded-full align-middle" style={`background:${GROUP_COLOUR[g]}`} />
            {g}
          </span>
        ))}
      </div>
      <div
        ref={el}
        class="h-[320px] w-full sm:h-[360px]"
        role="img"
        aria-label="Horizontal bar chart of metro kilometres per million people by city, coloured by group, with Bengaluru lowest at the bottom and each bar labelled by its multiple of Bengaluru."
      />
    </div>
  )
}
