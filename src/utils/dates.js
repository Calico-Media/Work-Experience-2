import moment from 'moment'
import 'moment-timezone'

const DEFAULT_ZONE = 'Europe/London'
const DISPLAY = 'D MMM YYYY'
const DISPLAY_WITH_TIME = 'D MMM YYYY, HH:mm'

export function inZone(value, zone = DEFAULT_ZONE) {
  return moment.tz(value, zone)
}

export function formatDate(value, zone) {
  return inZone(value, zone).format(DISPLAY)
}

export function formatDateTime(value, zone) {
  return inZone(value, zone).format(DISPLAY_WITH_TIME)
}

export function fromNow(value, zone) {
  return inZone(value, zone).fromNow()
}

export function startOfWeek(value, zone) {
  return inZone(value, zone).startOf('isoWeek')
}

export function endOfWeek(value, zone) {
  return inZone(value, zone).endOf('isoWeek')
}

export function isSameDay(a, b, zone) {
  return inZone(a, zone).isSame(inZone(b, zone), 'day')
}

export function weeksBetween(start, end) {
  return Math.max(0, moment(end).diff(moment(start), 'weeks'))
}

export function daysUntil(value, zone) {
  const target = inZone(value, zone).startOf('day')
  const today = moment.tz(zone || DEFAULT_ZONE).startOf('day')
  return target.diff(today, 'days')
}

// Groups rows into day buckets, newest day first. Used by the feed and
// the invoices list so they can show "Today", "Yesterday", then dates.
export function groupByDay(rows, getTimestamp, zone) {
  const buckets = new Map()
  for (const row of rows) {
    const key = inZone(getTimestamp(row), zone).format('YYYY-MM-DD')
    if (!buckets.has(key)) buckets.set(key, [])
    buckets.get(key).push(row)
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([key, items]) => ({ key, label: dayLabel(key, zone), items }))
}

export function dayLabel(key, zone) {
  const day = moment.tz(key, 'YYYY-MM-DD', zone || DEFAULT_ZONE)
  const today = moment.tz(zone || DEFAULT_ZONE).startOf('day')
  const diff = today.diff(day, 'days')
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7) return day.format('dddd')
  return day.format(DISPLAY)
}

// Twelve-week plan helpers. A plan runs from its start date for 12 ISO weeks
// and the check-in lands on the Monday of each week.
export const PLAN_WEEKS = 12

export function planWeeks(startDate, zone) {
  const start = startOfWeek(startDate, zone)
  const weeks = []
  for (let i = 0; i < PLAN_WEEKS; i++) {
    const from = start.clone().add(i, 'weeks')
    weeks.push({
      index: i + 1,
      from: from.toISOString(),
      to: from.clone().endOf('isoWeek').toISOString(),
      checkin: from.clone().day(1).hour(9).minute(0).toISOString(),
    })
  }
  return weeks
}

export function currentPlanWeek(startDate, zone) {
  const start = startOfWeek(startDate, zone)
  const elapsed = moment.tz(zone || DEFAULT_ZONE).diff(start, 'weeks')
  if (elapsed < 0) return 0
  return Math.min(PLAN_WEEKS, elapsed + 1)
}

export function monthRange(value, zone) {
  const m = inZone(value, zone)
  return {
    from: m.clone().startOf('month').toISOString(),
    to: m.clone().endOf('month').toISOString(),
    label: m.format('MMMM YYYY'),
  }
}

export function lastNMonths(n, zone) {
  const months = []
  const cursor = moment.tz(zone || DEFAULT_ZONE).startOf('month')
  for (let i = n - 1; i >= 0; i--) {
    months.push(monthRange(cursor.clone().subtract(i, 'months'), zone))
  }
  return months
}
