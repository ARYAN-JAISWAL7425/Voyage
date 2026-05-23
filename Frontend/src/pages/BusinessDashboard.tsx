import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { formatINR, formatINRCompact } from '@/lib/format'
import { useAuth } from '@/hooks/useAuth'
import { useOperatorTrips, useOperatorBookings } from '@/hooks/useOperatorData'
import { revenueSeries } from '@/data/business'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

const maxRev = Math.max(...revenueSeries.map((r) => r.v))

export default function BusinessDashboard() {
  const { operatorId } = useAuth()
  const { trips } = useOperatorTrips(operatorId)
  const { bookings } = useOperatorBookings(operatorId)

  const live = bookings.filter((b) => b.status !== 'cancelled')
  const totalRevenue = live.reduce((s, b) => s + b.amount, 0)
  const pendingCount = bookings.filter((b) => b.status === 'pending').length
  const ratable = trips.filter((t) => t.rating > 0)
  const avgRating = ratable.length ? (ratable.reduce((s, t) => s + t.rating, 0) / ratable.length).toFixed(1) : '—'
  const statsFor = (tripId: string) => {
    const bs = live.filter((b) => b.tripId === tripId)
    return { count: bs.length, revenue: bs.reduce((s, b) => s + b.amount, 0) }
  }

  return (
    <DashboardLayout variant="business" title="Overview" active="Overview">
      <div className="flex flex-col gap-6">
        {/* Stats (real, scoped to the signed-in operator) */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Booking revenue" value={formatINRCompact(totalRevenue)} icon="indian-rupee" tone="brand" />
          <StatCard label="Total bookings" value={String(bookings.length)} icon="ticket" tone="accent" />
          <StatCard label="Active trips" value={String(trips.length)} icon="map" tone="info" />
          <StatCard label="Avg rating" value={avgRating} icon="star" tone="success" />
        </div>

        {/* Chart + payout */}
        <div className="flex flex-col gap-5 lg:flex-row">
          <div className="flex-1 rounded-lg border border-line bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-heading text-base font-bold text-ink">Revenue trend</h3>
                <p className="text-xs text-ink-muted">Illustrative · last 6 months</p>
              </div>
              <Badge tone="success" icon="trending-up">+22%</Badge>
            </div>
            <div className="flex h-48 items-end justify-between gap-3">
              {revenueSeries.map((r) => (
                <div key={r.m} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-semibold text-ink">{r.v}</span>
                  <div className="flex w-full items-end" style={{ height: '140px' }}>
                    <div className="w-full rounded-t-md bg-brand transition-all" style={{ height: `${(r.v / maxRev) * 100}%` }} />
                  </div>
                  <span className="text-xs text-ink-muted">{r.m}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex w-full flex-col gap-4 lg:w-80">
            <div className="rounded-lg border border-line bg-white p-5">
              <div className="flex items-center gap-2 text-sm text-ink-secondary"><Icon name="wallet" size={16} className="text-brand" /> Booking revenue</div>
              <p className="mt-2 font-heading text-2xl font-bold text-ink">{formatINR(totalRevenue)}</p>
              <p className="mt-1 text-xs text-ink-muted">{live.length} paid booking{live.length !== 1 ? 's' : ''} · before 10% commission</p>
              <Button to="/business/earnings" variant="secondary" size="sm" fullWidth iconRight="arrow-right" className="mt-3">View earnings</Button>
            </div>
            <div className="rounded-lg border border-line bg-white p-5">
              <h4 className="mb-3 text-sm font-bold text-ink">Pending actions</h4>
              <div className="flex flex-col gap-2.5 text-sm">
                <Link to="/business/bookings" className="flex items-center justify-between text-ink-secondary hover:text-ink">
                  <span className="flex items-center gap-2"><Icon name="inbox" size={15} className="text-accent" /> Booking requests</span>
                  <Badge tone="accent">{pendingCount}</Badge>
                </Link>
                <Link to="/messages" className="flex items-center justify-between text-ink-secondary hover:text-ink">
                  <span className="flex items-center gap-2"><Icon name="message-circle" size={15} className="text-info" /> Messages</span>
                  <Icon name="chevron-right" size={15} />
                </Link>
                <Link to="/business/reviews" className="flex items-center justify-between text-ink-secondary hover:text-ink">
                  <span className="flex items-center gap-2"><Icon name="star" size={15} className="text-star" /> Reviews</span>
                  <Icon name="chevron-right" size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Trips table (real) */}
        <div className="overflow-hidden rounded-lg border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h3 className="font-heading text-base font-bold text-ink">Your trips</h3>
            <div className="flex items-center gap-3">
              <Link to="/business/trips" className="text-sm font-medium text-brand">View all</Link>
              <Button to="/business/trips/new" size="sm" iconLeft="plus">Create trip</Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-5 py-3 font-medium">Trip</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Bookings</th>
                  <th className="px-5 py-3 font-medium">Revenue</th>
                  <th className="px-5 py-3 font-medium">Rating</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {trips.map((trip) => {
                  const st = statsFor(trip.id)
                  return (
                    <tr key={trip.id} className="border-b border-line last:border-0 hover:bg-surface-muted/60">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img src={trip.image} alt="" className="h-10 w-12 shrink-0 rounded-md object-cover" />
                          <p className="font-medium text-ink">{trip.title}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><Badge tone="success">Active</Badge></td>
                      <td className="px-5 py-3.5 text-ink-secondary">{st.count}</td>
                      <td className="px-5 py-3.5 font-medium text-ink">{st.revenue ? formatINRCompact(st.revenue) : '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 text-ink"><Icon name="star" size={13} className="text-star" fill="currentColor" strokeWidth={1.5} /> {trip.rating || '—'}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link to="/business/trips/new" className={cn('inline-flex items-center gap-1 text-sm font-medium text-brand')}>
                          <Icon name="pencil" size={14} /> Edit
                        </Link>
                      </td>
                    </tr>
                  )
                })}
                {trips.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-ink-muted">
                      {operatorId ? 'No trips yet — create your first.' : 'Complete operator setup to start listing.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
