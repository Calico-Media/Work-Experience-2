import React from 'react'

export default function EmptyState({ title, body }) {
  return (
    <div className="empty">
      <div className="empty__title">{title}</div>
      {body && <div className="empty__body">{body}</div>}
    </div>
  )
}
