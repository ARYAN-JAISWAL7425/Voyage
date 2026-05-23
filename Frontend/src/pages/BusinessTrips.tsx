import { Link } from 'react-router-dom'
import { formatINRCompact } from '@/lib/format'
import { useAuth } from '@/hooks/useAuth'
import { useOperatorTrips, useOperatorBookings } from '@/hooks/useOperatorData'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

export default function BusinessTrips() {
  const { operatorId } = useAuth()
  const { trips, loading } = useOperatorTrips(operatorId)
  const { bookings } = useOperatorBookings(operatorId)

  // Per-trip bookings + revenue from the operator's real bookings.
  const statsFor = (tripId: string) => {
    const bs = bookings.filter((b) => b.tripId === tripId && b.status !== 'cancelled')
    return { count: bs.length, revenue: bs.reduce((s, b) => s + b.amount, 0) }
  }

  return (
    <DashboardLayout variant="business" title="My trips" active="My trips">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-secondary">{trips.length} trip{trips.length !== 1 ? 's' : ''} listed</p>
          <Button to="/business/trips/new" size="sm" iconLeft="plus">Create trip</Button>
        </div>

        <div className="overflow-hidden rounded-lg border border-line bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
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
                          <div>
                            <p className="font-medium text-ink">{trip.title}</p>
                            <p className="text-xs text-ink-muted">{trip.destination} · {trip.durationDays} days</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><Badge tone="success">Active</Badge></td>
                      <td className="px-5 py-3.5 text-ink-secondary">{st.count}</td>
                      <td className="px-5 py-3.5 font-medium text-ink">{st.revenue ? formatINRCompact(st.revenue) : '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 text-ink"><Icon name="star" size={13} className="text-star" fill="currentColor" strokeWidth={1.5} /> {trip.rating}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link to={`/trip/${trip.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-ink-secondary hover:text-ink"><Icon name="eye" size={14} /> View</Link>
                          <Link to="/business/trips/new" className="inline-flex items-center gap-1 text-sm font-medium text-brand"><Icon name="pencil" size={14} /> Edit</Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {loading && <div className="px-5 py-12 text-center text-sm text-ink-muted">Loading trips…</div>}
          {!loading && !operatorId && (
            <div className="px-5 py-12 text-center text-sm text-ink-muted">Link your operator profile to manage trips — set <code>profiles.operator_id</code> in Supabase.</div>
          )}
          {!loading && operatorId && trips.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-ink-muted">No trips yet — create your first.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
