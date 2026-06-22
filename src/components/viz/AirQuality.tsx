import { onCleanup, onMount } from "solid-js"
import * as echarts from "echarts"
import { VIZ, parseCSV, prefersReducedMotion, tooltipStyle } from "./viz-shared"

type Props = { src: string }

type Row = { city: string; country: string; pm25: number }

// The WHO's recommended ceiling for the annual average of PM2.5, in µg/m³.
const WHO_LIMIT = 5

export default function AirQuality(props: Props) {
  let el!: HTMLDivElement
  let chart: echarts.ECharts | undefined

  onMount(async () => {
    const rows: Row[] = parseCSV(await (await fetch(props.src)).text())
      .map((r) => ({
        city: r.city,
        country: r.country,
        pm25: parseFloat(r.pm25),
      }))
      .filter((r) => Number.isFinite(r.pm25))
      // Ascending so ECharts (index 0 at the bottom) puts the cleanest city at the foot and
      // the most polluted — Delhi — at the very top, the worst case leading the eye.
      .sort((a, b) => a.pm25 - b.pm25)

    const isPhone = el.clientWidth < 560
    const cities = rows.map((r) => r.city)
    // India's cities carry the focus coral; every other city stays a muted grey-blue so the
    // three Indian bars (Delhi, Kolkata, Mumbai) read as the story.
    const colours = rows.map((r) => (r.country === "India" ? VIZ.focus : VIZ.neutral))

    chart = echarts.init(el, undefined, { renderer: "canvas" })
    chart.setOption({
      backgroundColor: "transparent",
      animation: !prefersReducedMotion(),
      grid: { left: 4, right: isPhone ? 44 : 60, top: 6, bottom: 24, containLabel: true },
      tooltip: {
        ...tooltipStyle,
        trigger: "item",
        formatter: (p: any) => {
          const r = rows[p.dataIndex]
          return `<strong>${r.city}</strong><br/>${r.pm25.toFixed(1)} µg/m³ PM2.5<br/>${(r.pm25 / WHO_LIMIT).toFixed(0)}× the WHO safe limit`
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
          data: rows.map((r, i) => ({ value: r.pm25, itemStyle: { color: colours[i], borderRadius: [0, 3, 3, 0] } })),
          label: {
            show: true,
            position: "right",
            color: VIZ.text,
            fontFamily: "Lato, sans-serif",
            fontSize: isPhone ? 10 : 11,
            formatter: (p: any) => rows[p.dataIndex].pm25.toFixed(1),
          },
          markLine: {
            silent: true,
            symbol: "none",
            lineStyle: { color: VIZ.other, type: "dashed", width: 1 },
            label: {
              color: VIZ.other,
              fontFamily: "Lato, sans-serif",
              fontSize: isPhone ? 9 : 10,
              formatter: "WHO safe limit (5)",
              position: "insideEndTop",
            },
            data: [{ xAxis: WHO_LIMIT }],
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

  return (
    <div class="not-prose">
      <div class="mb-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-[#9aa0a6]">
        <span>
          <span class="mr-1 inline-block h-2.5 w-2.5 rounded-full align-middle" style={`background:${VIZ.focus}`} />
          India's cities
        </span>
        <span>
          <span class="mr-1 inline-block h-2.5 w-2.5 rounded-full align-middle" style={`background:${VIZ.neutral}`} />
          Other major cities
        </span>
      </div>
      <div
        ref={el}
        class="h-[360px] w-full sm:h-[400px]"
        role="img"
        aria-label="Horizontal bar chart of annual-average PM2.5 by city, the five most polluted against the five cleanest major cities, with India's Delhi, Kolkata and Mumbai highlighted and a reference line at the WHO safe limit of 5 micrograms per cubic metre."
      />
    </div>
  )
}
