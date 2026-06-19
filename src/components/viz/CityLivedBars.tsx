import { onCleanup, onMount } from "solid-js"
import * as echarts from "echarts"
import { VIZ, fmt, parseCSV, prefersReducedMotion, tooltipStyle } from "./viz-shared"

type Props = { src: string }

// Horizontal bar chart introducing the 15 study cities by lived density. Bars are
// coloured by group — India's metros (focus), dense-but-livable peers (Hong Kong and
// Singapore), lower-density developed cities, and developing cities — so the reader
// sees India's metros at the top, matched on density only by Hong Kong and Singapore,
// before we ask what really differs.
const GROUPS = {
  india: { label: "India's metros", colour: VIZ.focus },
  livable: { label: "Dense & livable", colour: VIZ.other },
  developed: { label: "Lower-density developed", colour: VIZ.gold },
  developing: { label: "Developing cities", colour: VIZ.neutral },
} as const

type GroupKey = keyof typeof GROUPS

export default function CityLivedBars(props: Props) {
  let el!: HTMLDivElement
  let chart: echarts.ECharts | undefined

  onMount(async () => {
    const rows = parseCSV(await (await fetch(props.src)).text())
      .map((r) => ({
        city: r.city,
        group: r.group as GroupKey,
        lived: parseFloat(r.lived_density),
      }))
      .filter((r) => Number.isFinite(r.lived))
      // Ascending so ECharts renders the densest city (Mumbai) at the very top.
      .sort((a, b) => a.lived - b.lived)

    const isPhone = el.clientWidth < 560
    const cities = rows.map((r) => r.city)

    // One series per group so the legend reads cleanly; each series leaves the other
    // groups' categories null, which ECharts simply skips.
    const series = (Object.keys(GROUPS) as GroupKey[]).map((g) => ({
      name: GROUPS[g].label,
      type: "bar" as const,
      stack: "lived",
      barWidth: isPhone ? 13 : 16,
      itemStyle: { color: GROUPS[g].colour, borderRadius: [0, 3, 3, 0] as [number, number, number, number] },
      data: rows.map((r) => (r.group === g ? r.lived : null)),
      label: {
        show: true,
        position: "right" as const,
        color: VIZ.text,
        fontFamily: "Lato, sans-serif",
        fontSize: isPhone ? 10 : 11,
        formatter: (p: any) => (p.value == null ? "" : fmt(p.value)),
      },
    }))

    chart = echarts.init(el, undefined, { renderer: "canvas" })
    chart.setOption({
      backgroundColor: "transparent",
      animation: !prefersReducedMotion(),
      grid: { left: 4, right: isPhone ? 52 : 64, top: 36, bottom: 6, containLabel: true },
      legend: {
        top: 0,
        left: "center",
        textStyle: { color: VIZ.text, fontFamily: "Lato, sans-serif", fontSize: isPhone ? 11 : 12 },
        itemWidth: 12,
        itemHeight: 12,
        itemGap: isPhone ? 12 : 20,
      },
      tooltip: {
        ...tooltipStyle,
        trigger: "item",
        formatter: (p: any) =>
          `<strong>${p.name}</strong><br/>${p.seriesName}<br/>${fmt(p.value)} people/km² lived`,
      },
      xAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: VIZ.axis, fontFamily: "Lato, sans-serif", fontSize: 11, formatter: (v: number) => fmt(v) },
        splitLine: { lineStyle: { color: VIZ.grid } },
      },
      yAxis: {
        type: "category",
        data: cities,
        axisLine: { lineStyle: { color: VIZ.axis } },
        axisTick: { show: false },
        axisLabel: { color: VIZ.text, fontFamily: "Lato, sans-serif", fontSize: isPhone ? 11 : 12 },
      },
      series,
    })

    const ro = new ResizeObserver(() => chart?.resize())
    ro.observe(el)
    onCleanup(() => {
      ro.disconnect()
      chart?.dispose()
    })
  })

  return (
    <div
      ref={el}
      class="h-[460px] w-full sm:h-[520px]"
      role="img"
      aria-label="Horizontal bar chart of fifteen study cities ranked by lived density, coloured by group: India's metros, dense-but-livable peers, lower-density developed cities, and developing cities."
    />
  )
}
