import React, { useEffect, useMemo, useState } from 'react'
import EventRow from './EventRow'
import EmptyState from '../../components/EmptyState'
import { TableSkeleton } from '../../components/Skeleton'
import { EVENT_TYPES } from './eventTypes'
 
const SEARCH_DELAY_MS = 250
 
export default function ActivityFeed({ events, loading, type, onTypeChange, compact }) {
  const [query, setQuery] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')
 
  // Apply the search a beat after the last keystroke rather than on every one.
  useEffect(() => {
    const timer = setTimeout(() => setAppliedQuery(query), SEARCH_DELAY_MS)
    return () => clearTimeout(timer)
  }, [query])
 
  // Change 3: useMemo caches the filtered list and only re-runs the filter when
  // events, type or appliedQuery change (appliedQuery, not query, so the
  // debounce still works). needle moved inside because it is only used here.
  const filtered = useMemo(() => {
    const needle = appliedQuery.trim().toLowerCase()
    return events.filter((event) => {
      if (type !== 'all' && event.type !== type) return false
      if (!needle) return true
      return (
        event.message.toLowerCase().includes(needle) ||
        event.actor.toLowerCase().includes(needle) ||
        event.target.toLowerCase().includes(needle)
      )
    })
  }, [events, type, appliedQuery])
  const total = events.length
 
  return (
    <>
      <div className="filters">
        <input
          type="search"
          className="input input--search"
          placeholder="Search by person, customer or message"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search activity"
        />
        <div className="chips">
          <button type="button" className={`chip ${type === 'all' ? 'is-active' : ''}`} onClick={() => onTypeChange('all')}>
            All
          </button>
          {EVENT_TYPES.map((entry) => (
            <button
              type="button"
              key={entry.type}
              className={`chip ${type === entry.type ? 'is-active' : ''}`}
              onClick={() => onTypeChange(entry.type)}
            >
              {entry.label}
            </button>
          ))}
        </div>
      </div>
 
      <div className="card">
        {loading ? (
          <TableSkeleton rows={12} columns={3} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No matching events" body={`Nothing in the last ${total} events matches your filters.`} />
        ) : (
          <div className={`feed ${compact ? 'feed--compact' : ''}`}>
            <div className="feed__summary">
              Showing {filtered.length} of {total}
            </div>
            <ul className="feed__list">
              {filtered.map((event) => (
                <EventRow key={event.id} event={event} compact={compact} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  )
}
