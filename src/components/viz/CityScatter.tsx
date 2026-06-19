import { createSignal, onCleanup, onMount } from "solid-js"
import * as echarts from "echarts"
import { VIZ, parseCSV, prefersReducedMotion, tooltipStyle } from "./viz-shared"

type Props = { src: string }

type City = { city: string; group: string; lived: number; road: number; cong: number }

const GROUP_COLOUR: Record<string, string> = {
  india: VIZ.focus,
  livable: VIZ.other,
  developed: VIZ.gold,
  developing: VIZ.neutral,
}

// Spearman rank correlation: Pearson correlation on the ranks of each variable.
function spearman(xs: number[], ys: number[]): number {
  const rank = (a: number[]) => {
    const idx = a.map((v, i) => [v, i] as [number, number]).sort((p, q) => p[0] - q[0])
    const r = new Array(a.length)
    for (let i = 0; i < idx.length; ) {
      let j = i
      while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++
      const avg = (i + j) / 2 + 1
      for (let k = i; k <= j; k++) r[idx[k][1]] = avg
      i = j + 1
    }
    return r
  }
  const rx = rank(xs)
  const ry = rank(ys)
  const n = xs.length
  const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length
  const mx = mean(rx)
  const my = mean(ry)
  let num = 0
  let dx = 0
  let dy = 0
  for (let i = 0; i < n; i++) {
    num += (rx[i] - mx) * (ry[i] - my)
    dx += (rx[i] - mx) ** 2
    dy += (ry[i] - my) ** 2
  }
  return num / Math.sqrt(dx * dy)
}

// Two scatter panels for the same 12 cities (those with a congestion figure), both
// with congestion on the y-axis. Left: against crowding (lived density) — a loose
// cloud. Right: against road space per person — a clear downward slope. The contrast
// is the whole point: density barely sorts the cities, infrastructure sorts them sharply.
export default function CityScatter(props: Props) {
  let elLeft!: HTMLDivElement
  let elRight!: HTMLDivElement
  const charts: echarts.ECharts[] = []
  const [rhoLived, setRhoLived] = createSignal("")
  const [rhoRoad, setRhoRoad] = createSignal("")

  onMount(async () => {
    const cities: City[] = parseCSV(await (await fetch(props.src)).text())
      .map((r) => ({
        city: r.city,
        group: r.group,
        lived: parseFloat(r.lived_dens),
        road: parseFloat(r.road_m_per_person),
        cong: parseFloat(r.tomtom_congestion_pct_2024),
      }))
      .filter((c) => Number.isFinite(c.cong) && Number.isFinite(c.lived) && Number.isFinite(c.road))

    const fmtRho = (n: number) => (n > 0 ? "+" : "") + n.toFixed(2)
    setRhoLived(fmtRho(spearman(cities.map((c) => c.lived), cities.map((c) => c.cong))))
    setRhoRoad(fmtRho(spearman(cities.map((c) => c.road), cities.map((c) => c.cong))))

    const build = (
      el: HTMLDivElement,
      x: (c: City) => number,
      xType: "log" | "value",
      xName: string,
    ) => {
      const isPhone = el.clientWidth < 480
      const chart = echarts.init(el, undefined, { renderer: "canvas" })
      chart.setOption({
        backgroundColor: "transparent",
        animation: !prefersReducedMotion(),
        grid: { left: 8, right: 16, top: 14, bottom: 44, containLabel: true },
        tooltip: {
          ...tooltipStyle,
          trigger: "item",
          formatter: (p: any) =>
            `<strong>${p.data.city}</strong><br/>${xName}: ${p.data.value[0]}<br/>Traffic congestion: ${p.data.value[1]}%`,
        },
        xAxis: {
          type: xType,
          name: xName,
          nameLocation: "middle",
          nameGap: 30,
          nameTextStyle: { color: VIZ.axis, fontFamily: "Lato, sans-serif", fontSize: 11 },
          axisLine: { lineStyle: { color: VIZ.axis } },
          axisTick: { show: false },
          axisLabel: { color: VIZ.axis, fontFamily: "Lato, sans-serif", fontSize: 10 },
          splitLine: { lineStyle: { color: VIZ.grid } },
        },
        yAxis: {
          type: "value",
          name: "Traffic congestion %",
          nameTextStyle: { color: VIZ.axis, fontFamily: "Lato, sans-serif", fontSize: 11 },
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: VIZ.axis, fontFamily: "Lato, sans-serif", fontSize: 10 },
          splitLine: { lineStyle: { color: VIZ.grid } },
        },
        series: [
          {
            type: "scatter",
            symbolSize: isPhone ? 11 : 13,
            data: cities.map((c) => ({
              city: c.city,
              value: [x(c), c.cong],
              itemStyle: { color: GROUP_COLOUR[c.group] ?? VIZ.neutral, opacity: 0.92 },
            })),
            label: {
              show: !isPhone,
              position: "right",
              formatter: (p: any) => p.data.city,
              color: VIZ.text,
              fontFamily: "Lato, sans-serif",
              fontSize: 10,
            },
            labelLayout: { moveOverlap: "shiftY" },
          },
        ],
      })
      charts.push(chart)
    }

    build(elLeft, (c) => c.lived, "log", "Lived density (/km²)")
    build(elRight, (c) => c.road, "value", "Road m per person")

    const ro = new ResizeObserver(() => charts.forEach((c) => c.resize()))
    ro.observe(elLeft)
    ro.observe(elRight)
    onCleanup(() => {
      ro.disconnect()
      charts.forEach((c) => c.dispose())
    })
  })

  return (
    <div class="not-prose">
      <div class="mb-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-[#9aa0a6]">
        <span><span class="mr-1 inline-block h-2.5 w-2.5 rounded-full align-middle" style={`background:${VIZ.focus}`} />India's metros</span>
        <span><span class="mr-1 inline-block h-2.5 w-2.5 rounded-full align-middle" style={`background:${VIZ.other}`} />Dense &amp; livable</span>
        <span><span class="mr-1 inline-block h-2.5 w-2.5 rounded-full align-middle" style={`background:${VIZ.gold}`} />Lower-density developed</span>
        <span><span class="mr-1 inline-block h-2.5 w-2.5 rounded-full align-middle" style={`background:${VIZ.neutral}`} />Developing cities</span>
      </div>
      <div class="flex flex-col gap-6 sm:flex-row sm:gap-4">
        <div class="flex-1">
          <p class="mb-1 text-center font-sans text-sm text-[#e8e8e8]">
            vs crowding <span class="text-[#9aa0a6]">(ρ = {rhoLived()})</span>
          </p>
          <div ref={elLeft} class="h-[320px] w-full" role="img" aria-label="Scatter of congestion against lived density; a loose cloud." />
        </div>
        <div class="flex-1">
          <p class="mb-1 text-center font-sans text-sm text-[#e8e8e8]">
            vs road space per person <span class="text-[#9aa0a6]">(ρ = {rhoRoad()})</span>
          </p>
          <div ref={elRight} class="h-[320px] w-full" role="img" aria-label="Scatter of congestion against road metres per person; a clear downward slope." />
        </div>
      </div>
    </div>
  )
}
