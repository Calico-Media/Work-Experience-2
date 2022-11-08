import React from 'react'

export function SkeletonLine({ width = '100%' }) {
  return <span className="skeleton skeleton--line" style={{ width }} />
}

export function TableSkeleton({ rows = 8, columns = 5 }) {
  const widths = ['60%', '80%', '40%', '30%', '50%', '70%']
  return (
    <div className="skeleton-table" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, r) => (
        <div className="skeleton-table__row" key={r}>
          {Array.from({ length: columns }).map((__, c) => (
            <SkeletonLine key={c} width={widths[(r + c) % widths.length]} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton({ lines = 3 }) {
  return (
    <div className="skeleton-card" aria-busy="true">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} width={i === 0 ? '40%' : '90%'} />
      ))}
    </div>
  )
}
