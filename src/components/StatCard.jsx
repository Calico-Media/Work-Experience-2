import React from 'react'

export default function StatCard({ label, value, hint, trend }) {
  let trendClass = ''
  if (typeof trend === 'number') {
    trendClass = trend >= 0 ? 'stat__trend--up' : 'stat__trend--down'
  }

  return (
    <div className="stat">
      <div className="stat__label">{label}</div>
      <div className="stat__value">{value}</div>
      {(hint || typeof trend === 'number') && (
        <div className="stat__foot">
          {typeof trend === 'number' && (
            <span className={`stat__trend ${trendClass}`}>
              {trend >= 0 ? '+' : ''}
              {trend}%
            </span>
          )}
          {hint && <span className="stat__hint">{hint}</span>}
        </div>
      )}
    </div>
  )
}
