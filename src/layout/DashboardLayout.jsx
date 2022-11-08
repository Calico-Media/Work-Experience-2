import React, { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import client from '../api'
import Sidebar from './Sidebar'
import Header from './Header'
import { itemForPath, pathForItem } from './navigation'

const DEFAULT_ACCOUNT = 'northwind'

// Adds the current account to any path that needs it. /api/me is per user,
// not per account, so it goes through untouched.
function withAccount(path, account) {
  if (path.startsWith('/api/me')) return path
  if (path.includes('account=')) return path
  const joiner = path.includes('?') ? '&' : '?'
  return `${path}${joiner}account=${encodeURIComponent(account)}`
}

export default function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const [account, setAccount] = useState(DEFAULT_ACCOUNT)
  const [me, setMe] = useState(null)
  const [activeItem, setActiveItem] = useState(() => itemForPath(location.pathname))
  const [collapsed, setCollapsed] = useState(false)

  // Small wrapper so pages don't have to know which account is selected.
  const api = {
    get: (path) => client.get(withAccount(path, account)),
    patch: (path, body) => client.patch(path, body),
  }

  useEffect(() => {
    let cancelled = false
    api.get('/api/me').then((user) => {
      if (!cancelled) setMe(user)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // The sidebar owns the active item so the highlight moves straight away;
  // the URL follows. Deep links and the back button go the other way.
  useEffect(() => {
    const target = pathForItem(activeItem)
    if (target !== location.pathname) {
      navigate(target)
    }
  }, [activeItem])

  useEffect(() => {
    const current = itemForPath(location.pathname)
    if (current !== activeItem) {
      setActiveItem(current)
    }
  }, [location.pathname])

  const accounts = me ? me.accounts : []

  return (
    <div className={`shell ${collapsed ? 'shell--collapsed' : ''}`}>
      <Sidebar
        activeItem={activeItem}
        collapsed={collapsed}
        onSelect={setActiveItem}
        onToggleCollapse={() => setCollapsed((value) => !value)}
      />
      <div className="shell__main">
        <Header
          activeItem={activeItem}
          account={account}
          accounts={accounts}
          me={me}
          onChangeAccount={setAccount}
        />
        <main className="content">
          <Outlet context={{ api, account, me }} />
        </main>
      </div>
    </div>
  )
}
