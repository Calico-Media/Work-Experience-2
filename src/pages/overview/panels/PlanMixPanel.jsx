import React from 'react'
import { PLAN_ORDER } from '../../../utils/format'

export const meta = { key: 'plan-mix', title: 'Plan mix', order: 3 }

export default function PlanMixPanel({ customers }) {
  const counts = PLAN_ORDER.map((plan) => ({
    plan,
    count: customers.filter((c) => c.plan === plan && c.status !== 'churned').length,
  }))
  const max = Math.max(1, ...counts.map((c) => c.count))

  return (
    <div className="bars">
      {counts.map(({ plan, count }) => (
        <div className="bars__row" key={plan}>
          <span className="bars__label">{plan}</span>
          <span className="bars__track">
            <span className={`bars__fill bars__fill--${plan.toLowerCase()}`} style={{ width: `${(count / max) * 100}%` }} />
          </span>
          <span className="bars__value">{count}</span>
        </div>
      ))}
    </div>
  )
}
