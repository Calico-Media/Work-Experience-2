import React from 'react'
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip)

export const meta = { key: 'signups', title: 'New customers by month', order: 1, span: 2 }

const MONTHS = 12

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function lastMonths(count) {
  const now = new Date()
  const out = []
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    out.push({ key: monthKey(d), label: d.toLocaleDateString('en-GB', { month: 'short' }) })
  }
  return out
}

const OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: { displayColors: false },
  },
  scales: {
    x: { grid: { display: false } },
    y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#eceff3' } },
  },
}

export default function SignupsPanel({ customers }) {
  const months = lastMonths(MONTHS)
  const counts = new Map(months.map((m) => [m.key, 0]))
  for (const customer of customers) {
    const key = monthKey(new Date(customer.createdAt))
    if (counts.has(key)) counts.set(key, counts.get(key) + 1)
  }

  const data = {
    labels: months.map((m) => m.label),
    datasets: [
      {
        label: 'New customers',
        data: months.map((m) => counts.get(m.key)),
        backgroundColor: '#2563eb',
        borderRadius: 4,
        maxBarThickness: 28,
      },
    ],
  }

  return (
    <div className="chart-box">
      <Bar data={data} options={OPTIONS} />
    </div>
  )
}
