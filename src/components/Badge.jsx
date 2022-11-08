import React from 'react'

const TONES = {
  Starter: 'neutral',
  Growth: 'blue',
  Enterprise: 'purple',
  active: 'green',
  trialing: 'blue',
  past_due: 'amber',
  churned: 'red',
  invited: 'amber',
}

const LABELS = {
  past_due: 'Past due',
}

export default function Badge({ value, tone }) {
  const resolvedTone = tone || TONES[value] || 'neutral'
  const label = LABELS[value] || value
  return <span className={`badge badge--${resolvedTone}`}>{label}</span>
}
