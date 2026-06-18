import { onCleanup, onMount } from "solid-js"
import * as echarts from "echarts"
import { VIZ, fmt, parseCSV, prefersReducedMotion, tooltipStyle } from "./viz-shared"

type Props = { src: string }

// Slope chart: each selected country is a line connecting its density "on paper"
// (arithmetic) to its density "as lived" (population-weighted), on a shared log axis.
// Roles colour the lines so the three stories — India, the reversal pair, and the
// "denser-or-equal yet livable" lead-in group — read at a glance.
export default function DensitySlope(props: Props) {
  let el!: HTMLDivElement
  let chart: echarts.ECharts | undefined

  onMount(async () => {
    const rows = parseCSV(await (await fetch(props.src)).text())
    const isPhone = el.clientWidth < 560

    const roleStyle = (role: string) => {
      if (role === "focus") return { color: VIZ.focus, width: 3.6, z: 10 }
      if (role === "reversal") return { color: VIZ.other, width: 2, z: 5 }
      return { color: VIZ.gold, width: 2, z: 5 } // leadin
    }

    const series = rows.map((r) => {
      const arith = parseFloat(r.arithmetic_density)
      const lived = parseFloat(r.lived_density)
      const st = roleStyle(r.role)
      const isFocus = r.role === "focus"
      return {
        name: r.country,
        type: "line",
        z: st.z,
        data: [arith, lived],
        symbol: "circle",
        symbolSize: isFocus ? 9 : 6,
        lineStyle: { color: st.color, width: st.width },
        itemStyle: { color: st.color },
        emphasis: { focus: "series", lineStyle: { width: st.width + 1.2 } },
        labelLayout: { moveOverlap: "shiftY" },
        endLabel: {
          show: true,
          formatter: () => `${r.country}  ${fmt(lived)}`,
          color: st.color,
          fontFamily: "Lato, sans-serif",
          fontSize: isFocus ? (isPhone ? 12 : 13) : isPhone ? 11 : 12,
          fontWeight: isFocus ? 700 : 400,
          padding: [0, 0, 0, isPhone ? 4 : 6],
        },
      }
    })

    chart = echarts.init(el, undefined, { renderer: "canvas" })
    chart.setOption({
      backgroundColor: "transparent",
      animation: !prefersReducedMotion(),
      // The right gutter holds the end labels ("Country 12,345"). Reserve less of it
      // on phones so the slope lines aren't squeezed into a sliver and there's no dead
      // black band on the right. On wider screens a matching left inset centres the
      // slope block under the centred caption instead of hugging the y-axis.
      grid: {
        left: isPhone ? 6 : 70,
        right: isPhone ? 104 : 132,
        top: 28,
        bottom: 28,
        containLabel: true,
      },
      tooltip: {
        ...tooltipStyle,
        trigger: "item",
        formatter: (p: any) => {
          const which = p.dataIndex === 0 ? "On paper" : "As lived"
          return `<strong>${p.seriesName}</strong><br/>${which}: ${fmt(
            p.value,
          )} people/km²`
        },
      },
      xAxis: {
        type: "category",
        data: ["On paper", "As lived"],
        boundaryGap: ["8%", "8%"],
        axisLine: { lineStyle: { color: VIZ.axis } },
        axisTick: { show: false },
        axisLabel: {
          color: VIZ.text,
          fontFamily: "Lato, sans-serif",
          fontSize: 13,
        },
      },
      yAxis: {
        type: "log",
        name: "people / km²",
        nameTextStyle: { color: VIZ.axis, fontFamily: "Lato, sans-serif", fontSize: 11 },
        axisLine: { show: false },
        axisLabel: {
          color: VIZ.axis,
          fontFamily: "Lato, sans-serif",
          fontSize: 11,
          formatter: (v: number) => fmt(v),
        },
        splitLine: { lineStyle: { color: VIZ.grid } },
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
      class="h-[440px] w-full sm:h-[520px]"
      role="img"
      aria-label="Slope chart connecting each country's arithmetic density on the left to its lived density on the right, on a logarithmic scale."
    />
  )
}
