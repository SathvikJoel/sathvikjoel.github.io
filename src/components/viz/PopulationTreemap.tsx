import { onCleanup, onMount } from "solid-js"
import * as echarts from "echarts"
import { VIZ, fmt, parseCSV, prefersReducedMotion, tooltipStyle } from "./viz-shared"

type Props = { src: string }

// Treemap of the world's ten most-populous countries (2024) plus a single pale
// "Rest of World" block — area is proportional to population. India and China read
// as two near-equal giants.
export default function PopulationTreemap(props: Props) {
  let el!: HTMLDivElement
  let chart: echarts.ECharts | undefined

  onMount(async () => {
    const rows = parseCSV(await (await fetch(props.src)).text())
    const colourFor = (name: string): string => {
      if (name === "India") return VIZ.focus
      if (name === "China") return VIZ.gold
      if (name === "Rest of World") return "#3a4356"
      return VIZ.other
    }
    const data = rows.map((r) => {
      const value = parseFloat(r.population_millions)
      const share = parseFloat(r.world_share_pct)
      // Rest of World is the one dark tile, so it needs light text; every other
      // tile uses a bright fill and reads best with near-black text on top.
      const darkTile = r.country === "Rest of World"
      return {
        name: r.country,
        value,
        share,
        itemStyle: {
          color: colourFor(r.country),
          borderColor: "#000000",
          borderWidth: 2,
          gapWidth: 2,
        },
        label: {
          color: darkTile ? VIZ.text : "#10171f",
        },
      }
    })

    chart = echarts.init(el, undefined, { renderer: "canvas" })
    chart.setOption({
      backgroundColor: "transparent",
      animation: !prefersReducedMotion(),
      tooltip: {
        ...tooltipStyle,
        formatter: (p: any) =>
          `<strong>${p.name}</strong><br/>${fmt(p.value)} million · ${p.data.share}% of humanity`,
      },
      series: [
        {
          type: "treemap",
          roam: false,
          nodeClick: false,
          breadcrumb: { show: false },
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          itemStyle: { borderColor: "#000", borderWidth: 2, gapWidth: 2 },
          label: {
            show: true,
            position: "insideTopLeft",
            formatter: (p: any) => `{n|${p.name}}\n{s|${p.data.share}%}`,
            rich: {
              n: { fontFamily: "Fraunces, serif", fontSize: 18, fontWeight: 600, lineHeight: 23 },
              s: { fontFamily: "Lato, sans-serif", fontSize: 13, opacity: 0.9, lineHeight: 18 },
            },
          },
          upperLabel: { show: false },
          data,
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

  return <div ref={el} class="h-[420px] w-full sm:h-[480px]" role="img" aria-label="Treemap of the ten most populous countries in 2024; India and China are the two largest, near-equal blocks, together about a third of the world." />
}
