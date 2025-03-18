import React from 'react'
import { formatDateTime } from '../../../utils/format'

export const meta = { key: 'recent-activity', title: 'Recent activity', order: 2, span: 2 }

const LIMIT = 6

export default function RecentActivityPanel({ activity }) {
  const recent = activity.slice(0, LIMIT)

  if (recent.length === 0) {
    return <p className="panel__empty">Nothing has happened on this account yet.</p>
  }

  return (
    <ul className="recent">
      {recent.map((event) => (
        <li className="recent__item" key={event.id}>
          <span className={`recent__dot recent__dot--${event.type}`} aria-hidden="true" />
          <span className="recent__message">{event.message}</span>
          <time className="recent__time" dateTime={event.timestamp}>
            {formatDateTime(event.timestamp)}
          </time>
        </li>
      ))}
    </ul>
  )
}
