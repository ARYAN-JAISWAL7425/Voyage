import { cn } from '@/lib/cn'
import { useAuth } from '@/hooks/useAuth'
import { useOperatorTrips } from '@/hooks/useOperatorData'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'

export default function BusinessAvailability() {
  const { operatorId } = useAuth()
  const { trips, loading } = useOperatorTrips(operatorId)

  return (
    <DashboardLayout variant="business" title="Availability" active="Availability">
      <div className="flex flex-col gap-5">
        <p className="text-sm text-ink-secondary">Seats and departure dates across your live trips.</p>

        {loading && <div className="rounded-lg border border-dashed border-line-strong py-12 text-center text-sm text-ink-muted">Loading…</div>}
        {!loading && !operatorId && <div className="rounded-lg border border-dashed border-line-strong py-12 text-center text-sm text-ink-muted">Complete operator setup to manage availability.</div>}
        {!loading && operatorId && trips.length === 0 && <div className="rounded-lg border border-dashed border-line-strong py-12 text-center text-sm text-ink-muted">No trips yet.</div>}

        {trips.map((trip) => {
          const total = trip.maxGroup || 0
          return (
            <div key={trip.id} className="overflow-hidden rounded-lg border border-line bg-white">
              <div className="flex items-center gap-3 border-b border-line px-5 py-4">
                <img src={trip.image} alt="" className="h-10 w-12 rounded-md object-cover" />
                <div>
                  <p className="font-medium text-ink">{trip.title}</p>
                  <p className="text-xs text-ink-muted">Max group {total} · {trip.durationDays} days</p>
                </div>
              </div>
              <div className="flex flex-col divide-y divide-line">
                {trip.departures.length === 0 && <div className="px-5 py-4 text-sm text-ink-muted">No departures added.</div>}
                {trip.departures.map((d) => {
                  const left = d.seatsLeft
                  const booked = Math.max(0, total - left)
                  const pct = total ? Math.round((booked / total) * 100) : 0
                  return (
                    <div key={d.id} className="flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-center sm:gap-5">
                      <span className="flex items-center gap-2 text-sm font-medium text-ink sm:w-44"><Icon name="calendar-days" size={15} className="text-brand" /> {d.date}</span>
                      <div className="flex-1"><div className="h-2 overflow-hidden rounded-full bg-line"><div className={cn('h-full rounded-full', left === 0 ? 'bg-danger' : 'bg-brand')} style={{ width: `${pct}%` }} /></div></div>
                      <span className="text-sm text-ink-secondary sm:w-28">{booked}/{total} booked</span>
                      <Badge tone={left === 0 ? 'danger' : left <= 3 ? 'accent' : 'success'}>{left === 0 ? 'Sold out' : `${left} left`}</Badge>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </DashboardLayout>
  )
}
