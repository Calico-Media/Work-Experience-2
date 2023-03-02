import { get, orderBy } from 'lodash'

// CSV export helpers for the Customers and Activity tables. Columns are
// described as { key, label, format } so the same definition drives both
// the on-screen table and the download.

const BOM = '﻿'

function escapeCell(value) {
  if (value === null || value === undefined) return ''
  const text = String(value)
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

export function toCsv(rows, columns, { sortKey, sortDirection = 'asc' } = {}) {
  const ordered = sortKey ? orderBy(rows, [sortKey], [sortDirection]) : rows
  const header = columns.map((column) => escapeCell(column.label)).join(',')
  const lines = ordered.map((row) =>
    columns
      .map((column) => {
        const raw = get(row, column.key)
        const value = column.format ? column.format(raw, row) : raw
        return escapeCell(value)
      })
      .join(',')
  )
  return [header, ...lines].join('\r\n')
}

export function download(filename, contents, type = 'text/csv;charset=utf-8') {
  const blob = new Blob([BOM + contents], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function stampedFilename(base, extension = 'csv') {
  const now = new Date()
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')
  return `${base}-${stamp}.${extension}`
}

export const CUSTOMER_COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'company', label: 'Company' },
  { key: 'plan', label: 'Plan' },
  { key: 'seats', label: 'Seats' },
  { key: 'status', label: 'Status' },
  { key: 'mrr', label: 'MRR (USD)' },
  { key: 'createdAt', label: 'Customer since', format: (value) => value.slice(0, 10) },
]

export const ACTIVITY_COLUMNS = [
  { key: 'timestamp', label: 'When' },
  { key: 'type', label: 'Type' },
  { key: 'actor', label: 'Who' },
  { key: 'target', label: 'Target' },
  { key: 'message', label: 'Message' },
]

export const TEAM_COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'joinedAt', label: 'Joined', format: (value) => value.slice(0, 10) },
]

export function exportCustomers(rows) {
  download(stampedFilename('customers'), toCsv(rows, CUSTOMER_COLUMNS, { sortKey: 'company' }))
}

export function exportActivity(rows) {
  download(stampedFilename('activity'), toCsv(rows, ACTIVITY_COLUMNS, { sortKey: 'timestamp', sortDirection: 'desc' }))
}

export function exportTeam(rows) {
  download(stampedFilename('team'), toCsv(rows, TEAM_COLUMNS, { sortKey: 'name' }))
}

// Summary block appended under the customer export: one line per plan with
// the customer count and the MRR total, so finance can paste it straight in.
export function planSummary(rows) {
  const plans = ['Starter', 'Growth', 'Enterprise']
  return plans.map((plan) => {
    const members = rows.filter((row) => row.plan === plan && row.status !== 'churned')
    return {
      plan,
      customers: members.length,
      seats: members.reduce((sum, row) => sum + row.seats, 0),
      mrr: members.reduce((sum, row) => sum + row.mrr, 0),
    }
  })
}

export function toCsvWithSummary(rows) {
  const main = toCsv(rows, CUSTOMER_COLUMNS, { sortKey: 'company' })
  const summary = toCsv(planSummary(rows), [
    { key: 'plan', label: 'Plan' },
    { key: 'customers', label: 'Customers' },
    { key: 'seats', label: 'Seats' },
    { key: 'mrr', label: 'MRR (USD)' },
  ])
  return `${main}\r\n\r\n${summary}`
}
