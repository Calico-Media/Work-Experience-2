import React, { useEffect, useState } from 'react'

// Account settings panel. Reads and writes through the settings endpoint and
// keeps a local draft so the user can cancel without touching the server.

const SECTIONS = [
  {
    title: 'Notifications',
    fields: [
      { key: 'weeklyDigest', label: 'Weekly digest', type: 'checkbox' },
      { key: 'checkinReminders', label: 'Check-in reminders', type: 'checkbox' },
      { key: 'digestDay', label: 'Digest day', type: 'select', options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
    ],
  },
  {
    title: 'Reporting',
    fields: [
      { key: 'currency', label: 'Report currency', type: 'select', options: ['USD', 'GBP', 'EUR'] },
      { key: 'includeChurned', label: 'Include churned customers in totals', type: 'checkbox' },
      { key: 'fiscalYearStart', label: 'Fiscal year starts', type: 'select', options: ['January', 'April', 'July', 'October'] },
    ],
  },
  {
    title: 'Security',
    fields: [
      { key: 'requireTwoFactor', label: 'Require two-factor sign-in for admins', type: 'checkbox' },
      { key: 'sessionHours', label: 'Sign out after (hours)', type: 'number' },
    ],
  },
]

const DEFAULTS = {
  weeklyDigest: true,
  checkinReminders: true,
  digestDay: 'Monday',
  currency: 'USD',
  includeChurned: false,
  fiscalYearStart: 'January',
  requireTwoFactor: false,
  sessionHours: 12,
}

export default function SettingsPanel({ api, account }) {
  const [saved, setSaved] = useState(DEFAULTS)
  const [draft, setDraft] = useState(DEFAULTS)
  const [state, setState] = useState('loading')
  const [message, setMessage] = useState(null)

  useEffect(() => {
    let cancelled = false
    setState('loading')
    api
      .get(`/api/settings?account=${account}`)
      .then((data) => {
        if (cancelled) return
        const merged = { ...DEFAULTS, ...data }
        setSaved(merged)
        setDraft(merged)
        setState('idle')
      })
      .catch(() => {
        if (!cancelled) setState('error')
      })
    return () => {
      cancelled = true
    }
  }, [api, account])

  const dirty = Object.keys(draft).some((key) => draft[key] !== saved[key])

  function update(key, value) {
    setDraft((current) => ({ ...current, [key]: value }))
    setMessage(null)
  }

  async function save() {
    setState('saving')
    try {
      const result = await api.patch(`/api/settings?account=${account}`, draft)
      const merged = { ...DEFAULTS, ...result }
      setSaved(merged)
      setDraft(merged)
      setMessage('Settings saved.')
      setState('idle')
    } catch (err) {
      setMessage(err.message)
      setState('idle')
    }
  }

  function renderField(field) {
    const value = draft[field.key]
    if (field.type === 'checkbox') {
      return (
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => update(field.key, e.target.checked)} />
      )
    }
    if (field.type === 'select') {
      return (
        <select className="input" value={value} onChange={(e) => update(field.key, e.target.value)}>
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )
    }
    return (
      <input
        className="input"
        type="number"
        min="1"
        value={value}
        onChange={(e) => update(field.key, Number(e.target.value))}
      />
    )
  }

  if (state === 'loading') {
    return <div className="settings-panel settings-panel--loading">Loading settings…</div>
  }

  if (state === 'error') {
    return <div className="alert alert--error">Settings could not be loaded.</div>
  }

  return (
    <div className="settings-panel">
      {SECTIONS.map((section) => (
        <section className="settings-panel__section" key={section.title}>
          <h3 className="settings-panel__heading">{section.title}</h3>
          {section.fields.map((field) => (
            <label className="settings-panel__field" key={field.key}>
              <span>{field.label}</span>
              {renderField(field)}
            </label>
          ))}
        </section>
      ))}

      <div className="settings-panel__actions">
        {message && <span className="settings-panel__message">{message}</span>}
        <button type="button" className="btn btn--ghost" onClick={() => setDraft(saved)} disabled={!dirty}>
          Discard
        </button>
        <button type="button" className="btn btn--primary" onClick={save} disabled={!dirty || state === 'saving'}>
          {state === 'saving' ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}
