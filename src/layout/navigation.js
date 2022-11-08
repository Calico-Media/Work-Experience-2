export const NAV_ITEMS = [
  { key: 'overview', label: 'Overview', path: '/' },
  { key: 'customers', label: 'Customers', path: '/customers' },
  { key: 'activity', label: 'Activity', path: '/activity' },
]

export function itemForPath(pathname) {
  const match = NAV_ITEMS.find((item) => item.path === pathname)
  return match ? match.key : 'overview'
}

export function pathForItem(key) {
  const match = NAV_ITEMS.find((item) => item.key === key)
  return match ? match.path : '/'
}
