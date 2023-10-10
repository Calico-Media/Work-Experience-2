import React, { useMemo, useState } from 'react'
import { maxBy, minBy } from 'lodash'

// Line chart for the monthly trend cards. Draws straight into an SVG so the
// panel does not have to wait for a chart library to load.

const PADDING = { top: 12, right: 12, bottom: 24, left: 36 }

function scaleLinear(domainMin, domainMax, rangeMin, rangeMax) {
  const span = domainMax - domainMin || 1
  return (value) => rangeMin + ((value - domainMin) / span) * (rangeMax - rangeMin)
}

function niceTicks(min, max, count = 4) {
  const span = max - min || 1
  const rough = span / count
  const magnitude = Math.pow(10, Math.floor(Math.log10(rough)))
  const candidates = [1, 2, 5, 10].map((m) => m * magnitude)
  const step = candidates.find((c) => c >= rough) || candidates[candidates.length - 1]
  const start = Math.floor(min / step) * step
  const ticks = []
  for (let v = start; v <= max + step / 2; v += step) {
    ticks.push(Number(v.toFixed(6)))
  }
  return ticks
}

function buildPath(points) {
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ')
}

function buildArea(points, baseline) {
  if (points.length === 0) return ''
  const first = points[0]
  const last = points[points.length - 1]
  return `${buildPath(points)} L${last.x.toFixed(1)},${baseline} L${first.x.toFixed(1)},${baseline} Z`
}

export function ChartLegend({ series }) {
  return (
    <ul className="chart__legend">
      {series.map((entry) => (
        <li className="chart__legend-item" key={entry.label}>
          <span className="chart__legend-swatch" style={{ background: entry.color }} />
          {entry.label}
        </li>
      ))}
    </ul>
  )
}

export default function TrendChart({
  data,
  xKey = 'label',
  yKey = 'value',
  width = 420,
  height = 180,
  color = '#2563eb',
  formatValue = (v) => String(v),
}) {
  const [hover, setHover] = useState(null)

  const layout = useMemo(() => {
    const innerWidth = width - PADDING.left - PADDING.right
    const innerHeight = height - PADDING.top - PADDING.bottom
    const lowest = minBy(data, yKey)
    const highest = maxBy(data, yKey)
    const yMin = Math.min(0, lowest ? lowest[yKey] : 0)
    const yMax = highest ? highest[yKey] : 1
    const ticks = niceTicks(yMin, yMax)
    const x = scaleLinear(0, Math.max(1, data.length - 1), PADDING.left, PADDING.left + innerWidth)
    const y = scaleLinear(ticks[0], ticks[ticks.length - 1], PADDING.top + innerHeight, PADDING.top)
    const points = data.map((d, i) => ({ x: x(i), y: y(d[yKey]), datum: d }))
    return { points, ticks, y, baseline: PADDING.top + innerHeight }
  }, [data, xKey, yKey, width, height])

  if (data.length === 0) {
    return <div className="chart chart--empty">No data for this period</div>
  }

  const { points, ticks, y, baseline } = layout
  const active = hover === null ? null : points[hover]

  return (
    <div className="chart">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Trend chart"
        onMouseLeave={() => setHover(null)}
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={PADDING.left} x2={width - PADDING.right} y1={y(tick)} y2={y(tick)} stroke="#eceff3" />
            <text x={PADDING.left - 6} y={y(tick) + 4} fontSize="10" fill="#6b7280" textAnchor="end">
              {formatValue(tick)}
            </text>
          </g>
        ))}

        <path d={buildArea(points, baseline)} fill={color} fillOpacity="0.08" />
        <path d={buildPath(points)} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />

        {points.map((p, i) => (
          <g key={i}>
            <rect
              x={p.x - 12}
              y={PADDING.top}
              width={24}
              height={height - PADDING.top - PADDING.bottom}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
            {(i === 0 || i === points.length - 1 || i % 3 === 0) && (
              <text x={p.x} y={height - 6} fontSize="10" fill="#6b7280" textAnchor="middle">
                {p.datum[xKey]}
              </text>
            )}
          </g>
        ))}

        {active && (
          <g>
            <line x1={active.x} x2={active.x} y1={PADDING.top} y2={baseline} stroke={color} strokeDasharray="3 3" />
            <circle cx={active.x} cy={active.y} r="4" fill="#fff" stroke={color} strokeWidth="2" />
          </g>
        )}
      </svg>

      {active && (
        <div className="chart__tooltip" style={{ left: active.x, top: active.y }}>
          <div className="chart__tooltip-label">{active.datum[xKey]}</div>
          <div className="chart__tooltip-value">{formatValue(active.datum[yKey])}</div>
        </div>
      )}
    </div>
  )
}
