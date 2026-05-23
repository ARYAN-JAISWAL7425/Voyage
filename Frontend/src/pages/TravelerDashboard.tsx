import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { formatINR } from '@/lib/format'
import { useMyBookings } from '@/hooks/useMyBookings'
import { useAuth } from '@/hooks/useAuth'
import { useSavedTrips } from '@/hooks/useSavedTrips'
import { useTrips } from '@/hooks/useTrips'
import { tripById } from '@/data/trips'
import type { Booking } from '@/types'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon, type IconName } from '@/components/ui/Icon'

const TODAY = new Date()
const daysUntil = (d: string) => Math.round((new Date(d).getTime() - TODAY.getTime()) / 86400000)

const statusMap: Record<Booking['status'], { tone: 'success' | 'accent' | 'info' | 'danger'; label: string; icon: IconName }> = {
  confirmed: { tone: 'success', label: 'Confirmed', icon: 'circle-check' },
  pending: { tone: 'accent', label: 'Pending', icon: 'timer' },
  completed: { tone: 'info', label: 'Completed', icon: 'check-check' },
  cancelled: { tone: 'danger', label: 'Cancelled', icon: 'circle-x' },
}

export default function TravelerDashboard() {
  const { bookings } = useMyBookings()
  const { trips } = useTrips()
  const { user } = useAuth()
  const { count: savedCount } = useSavedTrips()
  const upcoming = bookings.find((b) => b.status === 'confirmed')
  const upcomingTrip = upcoming ? (trips.find((t) => t.id === upcoming.tripId) ?? tripById(upcoming.tripId)) : undefined
  const firstName = ((user?.user_metadata?.full_name as string | undefined) || '').split(' ')[0]
  const upcomingCount = bookings.filter((b) => b.status === 'confirmed').length
  const completedCount = bookings.filter((b) => b.status === 'completed').length

  return (
    <DashboardLayout variant="traveler" title="Overview" active="Overview">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="font-heading text-2xl font-bold text-ink">Welcome back{firstName ? `, ${firstName}` : ''} 👋</h2>
          <p className="mt-0.5 text-sm text-ink-secondary">Here's what's happening with your trips</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Upcoming trips" value={String(upcomingCount)} icon="plane-takeoff" tone="brand" />
          <StatCard label="Total bookings" value={String(bookings.length)} icon="ticket" tone="accent" />
          <StatCard label="Saved trips" value={String(savedCount)} icon="heart" tone="danger" />
          <StatCard label="Completed" value={String(completedCount)} icon="circle-check" tone="success" />
        </div>

        {/* Upcoming trip */}
        {upcoming && upcomingTrip && (
          <div className="overflow-hidden rounded-lg border border-line bg-white">
            <div className="flex flex-col sm:flex-row">
              <img src={upcomingTrip.image} alt={upcomingTrip.title} className="h-40 w-full object-cover sm:h-auto sm:w-64" />
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="brand" icon="plane-takeoff">Next trip</Badge>
                  <span className="text-sm font-medium text-accent">Departs in {daysUntil(upcoming.departureDate)} days</span>
                </div>
                <h3 className="font-heading text-xl font-bold text-ink">{upcomingTrip.title}</h3>
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink-secondary">
                  <span className="inline-flex items-center gap-1.5"><Icon name="calendar-days" size={15} className="text-brand" /> {upcoming.departureDate}</span>
                  <span className="inline-flex items-center gap-1.5"><Icon name="users" size={15} className="text-brand" /> {upcoming.travelers} travelers</span>
                  <span className="inline-flex items-center gap-1.5"><Icon name="ticket" size={15} className="text-brand" /> {upcoming.reference}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-2.5">
                  <Button to={`/voucher?trip=${upcomingTrip.id}`} size="sm" iconLeft="ticket">View voucher</Button>
                  <Button to={`/trip/${upcomingTrip.id}`} variant="secondary" size="sm">Trip details</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bookings table */}
        <div className="overflow-hidden rounded-lg border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h3 className="font-heading text-base font-bold text-ink">My bookings</h3>
            <Link to="/dashboard/bookings" className="text-sm font-medium text-brand">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-5 py-3 font-medium">Trip</th>
                  <th className="px-5 py-3 font-medium">Departure</th>
                  <th className="px-5 py-3 font-medium">Travelers</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const trip = trips.find((t) => t.id === b.tripId) ?? tripById(b.tripId)
                  const s = statusMap[b.status]
                  return (
                    <tr key={b.id} className="border-b border-line last:border-0 hover:bg-surface-muted/60">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img src={trip?.image} alt="" className="h-10 w-12 shrink-0 rounded-md object-cover" />
                          <div>
                            <p className="font-medium text-ink">{trip?.title}</p>
                            <p className="font-mono text-xs text-ink-muted">{b.reference}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-ink-secondary">{b.departureDate}</td>
                      <td className="px-5 py-3.5 text-ink-secondary">{b.travelers}</td>
                      <td className="px-5 py-3.5 font-medium text-ink">{formatINR(b.amount)}</td>
                      <td className="px-5 py-3.5"><Badge tone={s.tone} icon={s.icon}>{s.label}</Badge></td>
                      <td className="px-5 py-3.5 text-right">
                        <Link to={`/voucher?trip=${b.tripId}`} className={cn('text-sm font-medium', b.status === 'cancelled' ? 'text-ink-muted' : 'text-brand')}>
                          View
                        </Link>
                      </td>
                    </tr>
                  )
                })}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-ink-muted">
                      No bookings yet — <Link to="/search" className="font-medium text-brand">find a trip</Link>.
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
