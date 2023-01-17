export const EVENT_TYPES = [
  { type: 'login', label: 'Sign-ins', tone: 'neutral' },
  { type: 'plan_changed', label: 'Plan changes', tone: 'purple' },
  { type: 'seat_added', label: 'Seats added', tone: 'blue' },
  { type: 'export', label: 'Exports', tone: 'amber' },
  { type: 'invite_sent', label: 'Invites', tone: 'green' },
  { type: 'settings_changed', label: 'Settings', tone: 'neutral' },
]

export function describeType(type) {
  return EVENT_TYPES.find((entry) => entry.type === type) || { type, label: type, tone: 'neutral' }
}
