import { createSignal, onCleanup, onMount } from "solid-js"
import * as echarts from "echarts"
import { VIZ, parseCSV, prefersReducedMotion, tooltipStyle } from "./viz-shared"

type Props = { src: string }

type Row = { city: string; group: string; built: number }

// The four study groups, as they appear verbatim in the `group` column, mapped to the
// shared viz palette so colours stay consistent with the other Part 3 figures.
const GROUP_COLOUR: Record<string, string> = {
  "India's metros": VIZ.focus,
  "Dense and livable": VIZ.other,
  "Lower-density developed": VIZ.gold,
  "Developing cities": VIZ.neutral,
}

// A single car parking bay is roughly 12 m², the comparison drawn in the prose for scale.

export default function BuiltSpace(props: Props) {
  let el!: HTMLDivElement
  let chart: echarts.ECharts | undefined
  const [present, setPresent] = createSignal<string[]>([])

  onMount(async () => {
    const rows: Row[] = parseCSV(await (await fetch(props.src)).text())
      .map((r) => ({
        city: r.city,
        group: r.group,
        built: parseFloat(r.built_pc_m2),
      }))
      .filter((r) => Number.isFinite(r.built))
      // Descending so ECharts (which renders index 0 at the bottom) puts the most cramped
      // cities — Hong Kong and Mumbai — at the very top, the worst case leading the eye.
      .sort((a, b) => b.built - a.built)

    setPresent([...new Set(rows.map((r) => r.group))])

    const isPhone = el.clientWidth < 560
    const cities = rows.map((r) => r.city)
    const colours = rows.map((r) => GROUP_COLOUR[r.group] ?? VIZ.neutral)

    chart = echarts.init(el, undefined, { renderer: "canvas" })
    chart.setOption({
      backgroundColor: "transparent",
      animation: !prefersReducedMotion(),
      grid: { left: 4, right: isPhone ? 48 : 64, top: 6, bottom: 24, containLabel: true },
      tooltip: {
        ...tooltipStyle,
        trigger: "item",
        formatter: (p: any) => {
          const r = rows[p.dataIndex]
          return `<strong>${r.city}</strong><br/>${r.built.toFixed(1)} m² of built space per person`
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
          barWidth: isPhone ? 13 : 17,
          data: rows.map((r, i) => ({ value: r.built, itemStyle: { color: colours[i], borderRadius: [0, 3, 3, 0] } })),
          label: {
            show: true,
            position: "right",
            color: VIZ.text,
            fontFamily: "Lato, sans-serif",
            fontSize: isPhone ? 10 : 11,
            formatter: (p: any) => `${rows[p.dataIndex].built.toFixed(1)} m²`,
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
        class="h-[360px] w-full sm:h-[400px]"
        role="img"
        aria-label="Horizontal bar chart of built space in square metres per person by city, coloured by group, with the most cramped cities (Hong Kong and Mumbai, around 6 m²) at the top."
      />
    </div>
  )
}
