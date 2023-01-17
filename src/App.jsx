import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from './layout/DashboardLayout'
import CustomersPage from './pages/CustomersPage'
import ActivityPage from './pages/ActivityPage'
import InvoicesPage from './pages/InvoicesPage'

export default function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Navigate to="/customers" replace />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/billing" element={<InvoicesPage />} />
        <Route path="*" element={<Navigate to="/customers" replace />} />
      </Route>
    </Routes>
  )
}
