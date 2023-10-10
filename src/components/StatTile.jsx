import React from 'react'

// Stat tile with an optional sparkline and comparison against the previous
// period. Values are passed in already formatted.

function Sparkline({ points, width = 80, height = 24 }) {
  if (!points || points.length < 2) return null
  const max = Math.max(...points)
  const min = Math.min(...points)
  const span = max - min || 1
  const step = width / (points.length - 1)
  const d = points
    .map((value, index) => {
      const x = index * step
      const y = height - ((value - min) / span) * (height - 2) - 1
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <svg className="stat-tile__spark" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function changeLabel(current, previous) {
  if (previous === 0 || previous === undefined || previous === null) return null
  const delta = ((current - previous) / previous) * 100
  const rounded = Math.round(delta * 10) / 10
  return {
    text: `${rounded > 0 ? '+' : ''}${rounded}%`,
    direction: rounded > 0 ? 'up' : rounded < 0 ? 'down' : 'flat',
  }
}

export default function StatTile({ label, value, rawValue, previousValue, series, footnote, accent }) {
  const change = changeLabel(rawValue, previousValue)

  return (
    <div className={`stat-tile ${accent ? `stat-tile--${accent}` : ''}`}>
      <div className="stat-tile__top">
        <span className="stat-tile__label">{label}</span>
        <Sparkline points={series} />
      </div>
      <div className="stat-tile__value">{value}</div>
      <div className="stat-tile__bottom">
        {change && <span className={`stat-tile__change stat-tile__change--${change.direction}`}>{change.text}</span>}
        {footnote && <span className="stat-tile__footnote">{footnote}</span>}
      </div>
    </div>
  )
}

export function StatTileGroup({ children }) {
  return <div className="stat-tile-group">{children}</div>
}

// Turns a list of { period, value } rows into the props StatTile wants:
// the latest value, the one before it, and the series for the sparkline.
export function statFromSeries(rows, { label, format = (v) => String(v), footnote, accent } = {}) {
  const ordered = [...rows].sort((a, b) => (a.period < b.period ? -1 : 1))
  const series = ordered.map((row) => row.value)
  const current = series[series.length - 1] || 0
  const previous = series.length > 1 ? series[series.length - 2] : undefined
  return {
    label,
    value: format(current),
    rawValue: current,
    previousValue: previous,
    series,
    footnote,
    accent,
  }
}

// Fills in missing months so the sparkline does not skip gaps. Periods are
// "YYYY-MM" strings; months with no row get a zero.
export function fillMonths(rows, months) {
  if (rows.length === 0) return []
  const byPeriod = new Map(rows.map((row) => [row.period, row.value]))
  const [startYear, startMonth] = rows[0].period.split('-').map(Number)
  const filled = []
  let year = startYear
  let month = startMonth
  for (let i = 0; i < months; i++) {
    const period = `${year}-${String(month).padStart(2, '0')}`
    filled.push({ period, value: byPeriod.get(period) || 0 })
    month += 1
    if (month > 12) {
      month = 1
      year += 1
    }
  }
  return filled
}

export const TILE_PRESETS = {
  customers: { label: 'Customers', accent: 'blue' },
  mrr: { label: 'Monthly recurring revenue', accent: 'green', format: (v) => `$${Math.round(v).toLocaleString('en-GB')}` },
  seats: { label: 'Seats in use', accent: 'purple' },
  churn: { label: 'Churn', accent: 'red', format: (v) => `${(v * 100).toFixed(1)}%` },
}
