import React from 'react'
import AccountSwitcher from './AccountSwitcher'
import { NAV_ITEMS } from './navigation'
import { initials } from '../utils/format'

export default function Header({ activeItem, account, accounts, me, onChangeAccount }) {
  const item = NAV_ITEMS.find((entry) => entry.key === activeItem)

  return (
    <header className="topbar">
      <h1 className="topbar__title">{item ? item.label : 'Calico'}</h1>

      <div className="topbar__right">
        <AccountSwitcher value={account} accounts={accounts} onChange={onChangeAccount} />

        <div className="topbar__user">
          <span className="avatar avatar--sm">{me ? initials(me.name) : '…'}</span>
          <span className="topbar__user-name">{me ? me.name : 'Loading'}</span>
        </div>
      </div>
    </header>
  )
}
