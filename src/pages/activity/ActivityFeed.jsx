import React from 'react'
import EventRow from './EventRow'
import EmptyState from '../../components/EmptyState'

export default function ActivityFeed({ events, compact, total }) {
  if (events.length === 0) {
    return <EmptyState title="No matching events" body={`Nothing in the last ${total} events matches your filters.`} />
  }

  return (
    <div className={`feed ${compact ? 'feed--compact' : ''}`}>
      <div className="feed__summary">
        Showing {events.length} of {total}
      </div>
      <ul className="feed__list">
        {events.map((event) => (
          <EventRow key={event.id} event={event} compact={compact} />
        ))}
      </ul>
    </div>
  )
}
