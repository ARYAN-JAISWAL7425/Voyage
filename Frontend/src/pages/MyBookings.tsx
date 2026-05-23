import { useState } from 'react'
import { cn } from '@/lib/cn'
import { formatINR } from '@/lib/format'
import { useMyBookings } from '@/hooks/useMyBookings'
import { useTrips } from '@/hooks/useTrips'
import { cancelBooking } from '@/lib/api/bookings'
import { tripById } from '@/data/trips'
import type { Booking } from '@/types'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon, type IconName } from '@/components/ui/Icon'

const statusMap: Record<Booking['status'], { tone: 'success' | 'accent' | 'info' | 'danger'; label: string; icon: IconName }> = {
  confirmed: { tone: 'success', label: 'Confirmed', icon: 'circle-check' },
  pending: { tone: 'accent', label: 'Pending', icon: 'timer' },
  completed: { tone: 'info', label: 'Completed', icon: 'check-check' },
  cancelled: { tone: 'danger', label: 'Cancelled', icon: 'circle-x' },
}

const tabs = ['All', 'confirmed', 'pending', 'completed', 'cancelled'] as const

export default function MyBookings() {
  const { bookings, loading, reload } = useMyBookings()
  const { trips } = useTrips()
  const [tab, setTab] = useState<(typeof tabs)[number]>('All')
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const rows = tab === 'All' ? bookings : bookings.filter((b) => b.status === tab)

  const cancel = async (id: string) => {
    if (!window.confirm('Cancel this booking? Your seats will be released and this cannot be undone.')) return
    setError('')
    setCancellingId(id)
    const { error } = await cancelBooking(id)
    setCancellingId(null)
    if (error) { setError(error); return }
    reload()
  }

  return (
    <DashboardLayout variant="traveler" title="My bookings" active="My bookings">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn('rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition', tab === t ? 'bg-brand text-white' : 'border border-line bg-white text-ink-secondary hover:bg-surface-muted')}
            >
              {t}
            </button>
          ))}
        </div>

        {error && (
          <p className="flex items-center gap-2 rounded-sm bg-danger-soft px-3 py-2.5 text-sm font-medium text-danger">
            <Icon name="circle-alert" size={15} className="shrink-0" /> {error}
          </p>
        )}

        <div className="flex flex-col gap-4">
          {loading && <div className="rounded-lg border border-dashed border-line-strong py-12 text-center text-sm text-ink-muted">Loading your bookings…</div>}
          {!loading && rows.map((b) => {
            const trip = trips.find((t) => t.id === b.tripId) ?? tripById(b.tripId)
            const s = statusMap[b.status]
            const title = trip?.title ?? 'Your trip'
            const image = trip?.image ?? 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=400&q=80'
            return (
              <div key={b.id} className="flex flex-col gap-4 rounded-lg border border-line bg-white p-4 sm:flex-row sm:items-center">
                <img src={image} alt="" className="h-32 w-full rounded-md object-cover sm:h-20 sm:w-28" />
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2"><Badge tone={s.tone} icon={s.icon}>{s.label}</Badge><span className="font-mono text-xs text-ink-muted">{b.reference}</span></div>
                  <h3 className="font-heading text-base font-bold text-ink">{title}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-secondary">
                    <span className="inline-flex items-center gap-1.5"><Icon name="calendar-days" size={14} className="text-brand" /> {b.departureDate}</span>
                    <span className="inline-flex items-center gap-1.5"><Icon name="users" size={14} className="text-brand" /> {b.travelers} travelers</span>
                    <span className="inline-flex items-center gap-1.5"><Icon name="indian-rupee" size={14} className="text-brand" /> {formatINR(b.amount)}</span>
                  </div>
                </div>
                <div className="flex gap-2 sm:flex-col">
                  {b.status !== 'cancelled' && <Button to={`/voucher?trip=${b.tripId}`} size="sm" iconLeft="ticket">Voucher</Button>}
                  <Button to={`/trip/${b.tripId}`} size="sm" variant="secondary">Details</Button>
                  {(b.status === 'confirmed' || b.status === 'pending') && (
                    <Button size="sm" variant="ghost" onClick={() => cancel(b.id)} disabled={cancellingId === b.id}>
                      {cancellingId === b.id ? 'Cancelling…' : 'Cancel'}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
          {!loading && rows.length === 0 && <div className="rounded-lg border border-dashed border-line-strong py-12 text-center text-sm text-ink-muted">No {tab} bookings yet.</div>}
        </div>
      </div>
    </DashboardLayout>
  )
}
