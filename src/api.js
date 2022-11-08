// In-memory API client.
//
// The dashboard talks to this the same way it would talk to the real
// calico-api service: get(path) / patch(path, body) return promises and
// resolve after a short delay. Seed data is loaded once and kept in memory,
// so a PATCH is visible to later GETs until the page is reloaded.
//
// Every call is logged to the console with an `[api]` prefix.

import meSeed from './data/me.json'
import customersSeed from './data/customers.json'
import activitySeed from './data/activity.json'

const MIN_LATENCY_MS = 150
const MAX_LATENCY_MS = 400

const clone = (value) => JSON.parse(JSON.stringify(value))

const db = {
  me: clone(meSeed),
  customers: clone(customersSeed),
  activity: clone(activitySeed),
}

class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function log(method, path, body) {
  const style = 'font-weight: bold; color: #2563eb'
  if (body === undefined) {
    console.log(`%c[api] ${method} ${path}`, style)
  } else {
    console.log(`%c[api] ${method} ${path}`, style, body)
  }
}

function wait() {
  const ms = MIN_LATENCY_MS + Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS)
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function parse(path) {
  const [pathname, search = ''] = path.split('?')
  const params = new URLSearchParams(search)
  const segments = pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean)
  return { pathname, params, segments }
}

function byAccount(rows, params) {
  const account = params.get('account')
  if (!account) {
    throw new ApiError(400, 'account query parameter is required')
  }
  return rows.filter((row) => row.account === account)
}

function handleGet(path) {
  const { pathname, params, segments } = parse(path)

  if (segments[0] === 'me' && segments.length === 1) {
    return clone(db.me)
  }

  if (segments[0] === 'customers' && segments.length === 1) {
    return clone(byAccount(db.customers, params))
  }

  if (segments[0] === 'customers' && segments.length === 2) {
    const id = Number(segments[1])
    const customer = db.customers.find((c) => c.id === id)
    if (!customer) throw new ApiError(404, `customer ${segments[1]} not found`)
    return clone(customer)
  }

  if (segments[0] === 'activity' && segments.length === 1) {
    return clone(byAccount(db.activity, params))
  }

  throw new ApiError(404, `no route for GET ${pathname}`)
}

const EDITABLE_CUSTOMER_FIELDS = ['plan', 'seats', 'status']

function handlePatch(path, body) {
  const { pathname, segments } = parse(path)

  if (segments[0] === 'customers' && segments.length === 2) {
    const id = Number(segments[1])
    const customer = db.customers.find((c) => c.id === id)
    if (!customer) throw new ApiError(404, `customer ${segments[1]} not found`)

    for (const key of Object.keys(body || {})) {
      if (!EDITABLE_CUSTOMER_FIELDS.includes(key)) {
        throw new ApiError(400, `field "${key}" cannot be updated`)
      }
    }
    if (body.seats !== undefined && (!Number.isInteger(body.seats) || body.seats < 1)) {
      throw new ApiError(400, 'seats must be a positive whole number')
    }

    Object.assign(customer, body)
    return clone(customer)
  }

  throw new ApiError(404, `no route for PATCH ${pathname}`)
}

export async function get(path) {
  log('GET', path)
  await wait()
  return handleGet(path)
}

export async function patch(path, body) {
  log('PATCH', path, body)
  await wait()
  return handlePatch(path, body)
}

export default { get, patch }
