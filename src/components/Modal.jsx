import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

// Modal rendered into a portal at the end of <body>. Traps tab focus inside
// the panel while open and restores focus to the opener on close.

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

let portalRoot = null

function getPortalRoot() {
  if (!portalRoot) {
    portalRoot = document.createElement('div')
    portalRoot.setAttribute('data-modal-root', '')
    document.body.appendChild(portalRoot)
  }
  return portalRoot
}

export default function Modal({ open, title, size = 'md', onClose, children, actions }) {
  const panelRef = useRef(null)
  const openerRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    openerRef.current = document.activeElement

    const panel = panelRef.current
    const focusable = panel ? panel.querySelectorAll(FOCUSABLE) : []
    if (focusable.length > 0) focusable[0].focus()

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panel) return
      const items = panel.querySelectorAll(FOCUSABLE)
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      if (openerRef.current && typeof openerRef.current.focus === 'function') {
        openerRef.current.focus()
      }
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div
        className={`modal modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        ref={panelRef}
      >
        <header className="modal__header">
          <h2 id="modal-title" className="modal__title">
            {title}
          </h2>
          <button type="button" className="modal__close" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </header>
        <div className="modal__content">{children}</div>
        {actions && <footer className="modal__actions">{actions}</footer>}
      </div>
    </div>,
    getPortalRoot()
  )
}

export function ConfirmModal({ open, title, body, confirmLabel = 'Confirm', onConfirm, onClose }) {
  return (
    <Modal
      open={open}
      title={title}
      size="sm"
      onClose={onClose}
      actions={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn--primary" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </>
      }
    >
      <p>{body}</p>
    </Modal>
  )
}

// Small state helper so a screen can open a modal with a payload and read it
// back from the modal body: const invoice = useModal(); invoice.open(row).
export function useModal() {
  const [state, setState] = React.useState({ open: false, payload: null })

  const open = React.useCallback((payload = null) => {
    setState({ open: true, payload })
  }, [])

  const close = React.useCallback(() => {
    setState((current) => ({ ...current, open: false }))
  }, [])

  return { isOpen: state.open, payload: state.payload, open, close }
}

export function FormModal({ open, title, onClose, onSubmit, submitLabel = 'Save', busy = false, children }) {
  function handleSubmit(event) {
    event.preventDefault()
    if (busy) return
    onSubmit(new FormData(event.currentTarget))
  }

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      actions={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" form="modal-form" className="btn btn--primary" disabled={busy}>
            {busy ? 'Saving…' : submitLabel}
          </button>
        </>
      }
    >
      <form id="modal-form" className="form" onSubmit={handleSubmit}>
        {children}
      </form>
    </Modal>
  )
}
