import React, { useEffect, useRef, useState } from 'react'

export default function AccountSwitcher({ value, accounts, onChange }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    function onDocumentClick(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    function onKey(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocumentClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocumentClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const current = accounts.find((a) => a.id === value)

  return (
    <div className="switcher" ref={rootRef}>
      <button
        type="button"
        className="switcher__button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="switcher__label">Account</span>
        <span className="switcher__value">{current ? current.name : value}</span>
        <span className="switcher__chevron" aria-hidden="true">▾</span>
      </button>

      {open && (
        <ul className="switcher__menu" role="listbox">
          {accounts.map((acct) => (
            <li key={acct.id}>
              <button
                type="button"
                role="option"
                aria-selected={acct.id === value}
                className={`switcher__option ${acct.id === value ? 'is-selected' : ''}`}
                onClick={() => {
                  onChange(acct.id)
                  setOpen(false)
                }}
              >
                <span>{acct.name}</span>
                <span className="switcher__plan">{acct.plan}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
