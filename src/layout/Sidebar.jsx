import React from 'react'
import { NAV_ITEMS } from './navigation'

const ICONS = {
  overview: (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <rect x="3" y="3" width="6" height="6" rx="1.5" />
      <rect x="11" y="3" width="6" height="6" rx="1.5" />
      <rect x="3" y="11" width="6" height="6" rx="1.5" />
      <rect x="11" y="11" width="6" height="6" rx="1.5" />
    </svg>
  ),
  customers: (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="7" r="3.2" />
      <path d="M4 17c0-3 2.7-5 6-5s6 2 6 5" />
    </svg>
  ),
  activity: (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M2.5 10h3l2-5 3 10 2-7 1.5 2h3.5" />
    </svg>
  ),
}

export default function Sidebar({ activeItem, collapsed, onSelect, onToggleCollapse }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__logo">C</span>
        {!collapsed && <span className="sidebar__name">Calico</span>}
      </div>

      <nav className="sidebar__nav" aria-label="Main">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`sidebar__item ${activeItem === item.key ? 'is-active' : ''}`}
            onClick={() => onSelect(item.key)}
            title={collapsed ? item.label : undefined}
            aria-current={activeItem === item.key ? 'page' : undefined}
          >
            <span className="sidebar__icon">{ICONS[item.key]}</span>
            {!collapsed && <span className="sidebar__label">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar__footer">
        <button type="button" className="sidebar__collapse" onClick={onToggleCollapse}>
          {collapsed ? '»' : '« Collapse'}
        </button>
      </div>
    </aside>
  )
}
