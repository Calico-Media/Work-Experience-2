import React from 'react'
import { formatNumber } from '../../../utils/format'

export const meta = { key: 'seat-usage', title: 'Largest customers by seats', order: 4 }

export default function SeatUsagePanel({ customers }) {
  const top = [...customers]
    .filter((c) => c.status !== 'churned')
    .sort((a, b) => b.seats - a.seats)
    .slice(0, 5)
  const total = customers.reduce((sum, c) => sum + (c.status === 'churned' ? 0 : c.seats), 0)

  return (
    <div>
      <p className="panel__lead">{formatNumber(total)} seats in use</p>
      <ol className="ranked">
        {top.map((c) => (
          <li className="ranked__item" key={c.id}>
            <span className="ranked__name">{c.company}</span>
            <span className="ranked__value">{formatNumber(c.seats)}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
