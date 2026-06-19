import { onCleanup, onMount } from "solid-js"
import * as echarts from "echarts"
import { VIZ, parseCSV, prefersReducedMotion, tooltipStyle } from "./viz-shared"

type Props = { src: string }

// The "money plot": for each urban problem (congestion, commute, air), how strongly
// each predictor correlates with it (Spearman rho, signed). Density is the single red
// bar; every infrastructure measure is blue. The eye should catch that the lone red
// bar points positive while the blue bars point negative, and usually further.
const OBSERVABLES = ["Congestion", "Commute", "Air (PM2.5)"]
// Display labels for the y-axis (data keys above must still match the CSV's observable column).
const OBSERVABLE_LABELS = ["Traffic congestion", "Commute", "Air (PM2.5)"]
const PREDICTORS = [
  "Lived density",
  "Road per person",
  "Metro per million",
  "Built per person",
  "Intersection density",
]

export default function CorrelationBars(props: Props) {
  let el!: HTMLDivElement
  let chart: echarts.ECharts | undefined

  onMount(async () => {
    const rows = parseCSV(await (await fetch(props.src)).text())
    const isPhone = el.clientWidth < 560

    // value[predictor][observable] = spearman rho, plus its type (Density|Infrastructure)
    const byPred = new Map<string, { type: string; vals: Record<string, number> }>()
    for (const r of rows) {
      const p = r.predictor
      if (!byPred.has(p)) byPred.set(p, { type: r.predictor_type, vals: {} })
      byPred.get(p)!.vals[r.observable] = parseFloat(r.spearman)
    }

    const series = PREDICTORS.map((pred) => {
      const entry = byPred.get(pred)
      const isDensity = entry?.type === "Density"
      const colour = isDensity ? VIZ.focus : VIZ.other
      return {
        name: pred,
        type: "bar" as const,
        barCategoryGap: "32%",
        barGap: "12%",
        itemStyle: { color: colour, borderRadius: 2 },
        data: OBSERVABLES.map((o) => entry?.vals[o] ?? null),
        label: {
          show: true,
          // Positive bars label to their right, negative bars to their left, so the
          // number always sits at the bar's outer tip away from the zero line.
          position: "right" as const,
          formatter: (p: any) => (p.value == null ? "" : (p.value > 0 ? "+" : "") + p.value.toFixed(2)),
          color: VIZ.axis,
          fontFamily: "Lato, sans-serif",
          fontSize: isPhone ? 9 : 10,
        },
      }
    })

    chart = echarts.init(el, undefined, { renderer: "canvas" })
    chart.setOption({
      backgroundColor: "transparent",
      animation: !prefersReducedMotion(),
      grid: { left: 4, right: isPhone ? 14 : 24, top: 44, bottom: 26, containLabel: true },
      legend: {
        top: 0,
        left: "center",
        data: PREDICTORS,
        textStyle: { color: VIZ.text, fontFamily: "Lato, sans-serif", fontSize: isPhone ? 10 : 11 },
        itemWidth: 11,
        itemHeight: 11,
        itemGap: isPhone ? 8 : 14,
      },
      tooltip: {
        ...tooltipStyle,
        trigger: "item",
        formatter: (p: any) =>
          `<strong>${p.name}</strong><br/>${p.seriesName}<br/>Spearman ρ = ${
            p.value > 0 ? "+" : ""
          }${Number(p.value).toFixed(2)}`,
      },
      xAxis: {
        type: "value",
        min: -1,
        max: 1,
        name: "Spearman ρ",
        nameLocation: "middle",
        nameGap: 30,
        nameTextStyle: { color: VIZ.axis, fontFamily: "Lato, sans-serif", fontSize: 11 },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: VIZ.axis, fontFamily: "Lato, sans-serif", fontSize: 10 },
        splitLine: { lineStyle: { color: VIZ.grid } },
      },
      yAxis: {
        type: "category",
        inverse: true,
        data: OBSERVABLE_LABELS,
        axisLine: { lineStyle: { color: VIZ.axis } },
        axisTick: { show: false },
        axisLabel: { color: VIZ.text, fontFamily: "Lato, sans-serif", fontSize: isPhone ? 12 : 14, fontWeight: 600 },
      },
      // Emphasise the zero line: a brighter vertical mark at ρ = 0.
      series: series.map((s, i) =>
        i === 0
          ? {
              ...s,
              markLine: {
                silent: true,
                symbol: "none",
                lineStyle: { color: "rgba(255,255,255,0.35)", width: 1 },
                label: { show: false },
                data: [{ xAxis: 0 }],
              },
            }
          : s,
      ),
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
      class="h-[460px] w-full sm:h-[500px]"
      role="img"
      aria-label="Grouped bar chart of Spearman correlations between each predictor and each urban problem. Density correlates positively with every problem; infrastructure measures correlate negatively."
    />
  )
}
