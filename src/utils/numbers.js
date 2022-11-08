// Number formatting for the reporting screens. Everything here is locale
// aware through Intl so the same helpers work for GBP and EUR accounts.

const DEFAULT_LOCALE = 'en-GB'
const DEFAULT_CURRENCY = 'USD'

const formatterCache = new Map()

function cachedFormatter(key, factory) {
  if (!formatterCache.has(key)) {
    formatterCache.set(key, factory())
  }
  return formatterCache.get(key)
}

export function currency(amount, { currency: code = DEFAULT_CURRENCY, locale = DEFAULT_LOCALE, cents = false } = {}) {
  const formatter = cachedFormatter(`currency:${locale}:${code}:${cents}`, () =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: cents ? 2 : 0,
      maximumFractionDigits: cents ? 2 : 0,
    })
  )
  return formatter.format(amount)
}

export function integer(value, locale = DEFAULT_LOCALE) {
  const formatter = cachedFormatter(`integer:${locale}`, () =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: 0 })
  )
  return formatter.format(value)
}

export function percent(fraction, { digits = 0, locale = DEFAULT_LOCALE, signed = false } = {}) {
  const formatter = cachedFormatter(`percent:${locale}:${digits}:${signed}`, () =>
    new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
      signDisplay: signed ? 'exceptZero' : 'auto',
    })
  )
  return formatter.format(fraction)
}

export function compact(value, locale = DEFAULT_LOCALE) {
  const formatter = cachedFormatter(`compact:${locale}`, () =>
    new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 })
  )
  return formatter.format(value)
}

export function change(current, previous) {
  if (!previous) return null
  return (current - previous) / previous
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function sum(values, pick = (v) => v) {
  return values.reduce((total, item) => total + (Number(pick(item)) || 0), 0)
}

export function average(values, pick) {
  if (values.length === 0) return 0
  return sum(values, pick) / values.length
}

export function median(values, pick = (v) => v) {
  if (values.length === 0) return 0
  const sorted = values.map(pick).map(Number).sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2
  }
  return sorted[middle]
}

// Buckets a numeric field into labelled ranges, used by the seat histogram.
export function histogram(values, edges, pick = (v) => v) {
  const buckets = edges.map((edge, index) => ({
    from: edge,
    to: edges[index + 1],
    label: edges[index + 1] === undefined ? `${edge}+` : `${edge}–${edges[index + 1] - 1}`,
    count: 0,
  }))
  for (const item of values) {
    const value = Number(pick(item))
    for (let i = buckets.length - 1; i >= 0; i--) {
      if (value >= buckets[i].from) {
        buckets[i].count += 1
        break
      }
    }
  }
  return buckets
}

export function seatPrice(plan, seats) {
  const base = { Starter: 49, Growth: 129, Enterprise: 249 }[plan] || 0
  const perSeat = 12
  return base + Math.max(0, seats - 1) * perSeat
}

export function annualise(monthly) {
  return monthly * 12
}
