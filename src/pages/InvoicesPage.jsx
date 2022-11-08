import React, { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import moment from 'moment'
import { groupBy, sumBy } from 'lodash'
import Badge from '../components/Badge'
import PageHeader from '../components/PageHeader'
import { TableSkeleton } from '../components/Skeleton'
import { formatMoney } from '../utils/format'

const STATUS_TONE = {
  paid: 'green',
  open: 'blue',
  overdue: 'red',
  void: 'neutral',
}

const PERIODS = [
  { key: '3m', label: 'Last 3 months', months: 3 },
  { key: '6m', label: 'Last 6 months', months: 6 },
  { key: '12m', label: 'Last 12 months', months: 12 },
]

function periodStart(months) {
  return moment().subtract(months, 'months').startOf('month')
}

export default function InvoicesPage() {
  const { api, account } = useOutletContext()
  const [invoices, setInvoices] = useState(null)
  const [period, setPeriod] = useState('6m')
  const [status, setStatus] = useState('all')

  useEffect(() => {
    let cancelled = false
    setInvoices(null)
    api.get('/api/invoices').then((data) => {
      if (!cancelled) setInvoices(data)
    })
    return () => {
      cancelled = true
    }
  }, [api, account])

  const months = PERIODS.find((p) => p.key === period).months

  const visible = useMemo(() => {
    if (!invoices) return []
    const from = periodStart(months)
    return invoices
      .filter((invoice) => moment(invoice.issuedAt).isSameOrAfter(from))
      .filter((invoice) => status === 'all' || invoice.status === status)
      .sort((a, b) => (a.issuedAt < b.issuedAt ? 1 : -1))
  }, [invoices, months, status])

  const byMonth = useMemo(() => groupBy(visible, (invoice) => moment(invoice.issuedAt).format('YYYY-MM')), [visible])

  const outstanding = sumBy(
    visible.filter((invoice) => invoice.status === 'open' || invoice.status === 'overdue'),
    'total'
  )

  return (
    <div className="page">
      <PageHeader
        title="Invoices"
        subtitle={invoices ? `${formatMoney(outstanding)} outstanding` : 'Loading…'}
        actions={
          <>
            <select className="input" value={period} onChange={(e) => setPeriod(e.target.value)}>
              {PERIODS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="paid">Paid</option>
              <option value="open">Open</option>
              <option value="overdue">Overdue</option>
              <option value="void">Void</option>
            </select>
          </>
        }
      />

      <div className="card">
        {!invoices ? (
          <TableSkeleton rows={8} columns={5} />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Issued</th>
                <th>Due</th>
                <th>Status</th>
                <th className="table__num">Total</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {Object.keys(byMonth)
                .sort()
                .reverse()
                .map((month) => (
                  <React.Fragment key={month}>
                    <tr className="table__group">
                      <td colSpan="6">{moment(month, 'YYYY-MM').format('MMMM YYYY')}</td>
                    </tr>
                    {byMonth[month].map((invoice) => (
                      <tr key={invoice.id}>
                        <td>
                          <div className="table__primary">{invoice.number}</div>
                          <div className="table__secondary">{invoice.description}</div>
                        </td>
                        <td>{moment(invoice.issuedAt).format('D MMM YYYY')}</td>
                        <td>{moment(invoice.dueAt).format('D MMM YYYY')}</td>
                        <td>
                          <Badge value={invoice.status} tone={STATUS_TONE[invoice.status]} />
                        </td>
                        <td className="table__num">{formatMoney(invoice.total)}</td>
                        <td className="table__actions">
                          <a className="btn btn--ghost btn--sm" href={invoice.pdfUrl} target="_blank" rel="noreferrer">
                            PDF
                          </a>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
