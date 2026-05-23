import { Routes, Route } from 'react-router-dom'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import Login from '@/pages/Login'
import Overview from '@/pages/Overview'
import Operators from '@/pages/Operators'
import Listings from '@/pages/Listings'
import Bookings from '@/pages/Bookings'
import Payments from '@/pages/Payments'
import Disputes from '@/pages/Disputes'
import Users from '@/pages/Users'

export default function App() {
  const { loading, isAdmin } = useAdminAuth()

  // Gate the whole console behind an admin sign-in.
  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-surface-page text-sm text-ink-muted">Loading…</div>
  }
  if (!isAdmin) return <Login />

  return (
    <Routes>
      <Route path="/" element={<Overview />} />
      <Route path="/operators" element={<Operators />} />
      <Route path="/listings" element={<Listings />} />
      <Route path="/bookings" element={<Bookings />} />
      <Route path="/payments" element={<Payments />} />
      <Route path="/disputes" element={<Disputes />} />
      <Route path="/users" element={<Users />} />
      <Route path="*" element={<Overview />} />
    </Routes>
  )
}
