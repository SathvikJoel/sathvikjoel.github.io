import { onCleanup, onMount } from "solid-js"
import * as echarts from "echarts"
import {
  MONO,
  VIZ,
  fmt,
  normaliseIso,
  parseCSV,
  prefersReducedMotion,
  tooltipStyle,
} from "./viz-shared"

type Props = {
  geoSrc: string
  dataSrc: string
  valueCol: string
  label: string // e.g. "Arithmetic density" / "Lived density"
  showC?: boolean // append the concentration ratio C to the tooltip
}

// Linear interpolation of the p-th quantile (0..1) from a pre-sorted array.
function quantile(sorted: number[], p: number): number {
  const idx = (sorted.length - 1) * p
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return sorted[lo]
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
}

// Density is wildly skewed, so a straight linear (or even log) ramp leaves most
// countries the same mid shade. Binning by quantile gives every bin a roughly
// equal share of countries, which spreads the hue across the whole distribution:
// the genuinely dense places land in the darkest bin and become easy to tell apart.
// Returned high -> low so the legend reads darkest (densest) at the top.
function quantilePieces(values: number[], colors: string[]) {
  const sorted = [...values].sort((a, b) => a - b)
  const n = colors.length
  const breaks: number[] = []
  for (let i = 1; i < n; i++) breaks.push(quantile(sorted, i / n))
  const lowToHigh = colors.map((color, i) => {
    const lower = i === 0 ? undefined : breaks[i - 1]
    const upper = i === n - 1 ? undefined : breaks[i]
    const piece: { color: string; gte?: number; lt?: number; label: string } = {
      color,
      label:
        lower == null
          ? `< ${fmt(upper as number)}`
          : upper == null
            ? `≥ ${fmt(lower)}`
            : `${fmt(lower)}–${fmt(upper)}`,
    }
    if (lower != null) piece.gte = lower
    if (upper != null) piece.lt = upper
    return piece
  })
  return lowToHigh.reverse()
}

// One world geojson is shared by both choropleths — fetch + register it once.
let geoPromise: Promise<void> | undefined
function ensureWorldMap(src: string): Promise<void> {
  if (!geoPromise) {
    geoPromise = fetch(src)
      .then((r) => r.json())
      .then((geo) => {
        echarts.registerMap("op-world", geo)
      })
  }
  return geoPromise
}

// World choropleth shaded by a density column on a logarithmic inferno ramp. The two
// instances (arithmetic / lived) are a matched pair: identical projection, scale type
// and hover behaviour, so the reader can flip between them and watch the picture change.
export default function DensityMap(props: Props) {
  let el!: HTMLDivElement
  let chart: echarts.ECharts | undefined

  onMount(async () => {
    const [rows] = await Promise.all([
      fetch(props.dataSrc)
        .then((r) => r.text())
        .then(parseCSV),
      ensureWorldMap(props.geoSrc),
    ])

    const data = rows
      .map((r) => {
        const density = parseFloat(r[props.valueCol])
        return {
          iso: normaliseIso(r.iso_a3, r.country),
          cname: r.country,
          density,
          C: r.C ? parseFloat(r.C) : null,
        }
      })
      .filter((d) => Number.isFinite(d.density) && d.density > 0)

    const values = data.map((d) => d.density)
    const pieces = quantilePieces(values, MONO)

    const seriesData = data.map((d) => ({
      name: d.iso,
      value: d.density, // colour binned by quantile (see quantilePieces)
      density: d.density,
      cname: d.cname,
      C: d.C,
    }))

    chart = echarts.init(el, undefined, { renderer: "canvas" })
    chart.setOption({
      backgroundColor: "transparent",
      animation: !prefersReducedMotion(),
      tooltip: {
        ...tooltipStyle,
        trigger: "item",
        formatter: (p: any) => {
          const d = p.data
          if (!d || d.density == null) return `${p.name}<br/>No data`
          const c = props.showC && d.C ? ` · C = ${d.C}×` : ""
          return `<strong>${d.cname}</strong><br/>${props.label}: ${fmt(
            d.density,
          )} people/km²${c}`
        },
      },
      visualMap: {
        type: "piecewise",
        pieces,
        showLabel: true,
        itemWidth: 13,
        itemHeight: 11,
        itemGap: 4,
        textStyle: { color: VIZ.text, fontFamily: "Lato, sans-serif", fontSize: 10 },
        left: 12,
        bottom: 18,
      },
      series: [
        {
          type: "map",
          map: "op-world",
          nameProperty: "name",
          roam: true,
          scaleLimit: { min: 1, max: 6 },
          zoom: 1.15,
          left: 0,
          right: 0,
          top: 6,
          bottom: 6,
          itemStyle: {
            areaColor: VIZ.noData,
            borderColor: VIZ.noDataBorder,
            borderWidth: 0.4,
          },
          emphasis: {
            label: { show: false },
            itemStyle: { borderColor: VIZ.text, borderWidth: 1.5 },
          },
          select: { disabled: true },
          data: seriesData,
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
    <div
      ref={el}
      class="h-[360px] w-full sm:h-[460px]"
      role="img"
      aria-label={`World map shaded by ${props.label.toLowerCase()}. Hover any country for its value.`}
    />
  )
}
