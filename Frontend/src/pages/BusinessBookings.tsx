import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { formatINR } from '@/lib/format'
import { useAuth } from '@/hooks/useAuth'
import { useOperatorBookings } from '@/hooks/useOperatorData'
import { cancelBooking } from '@/lib/api/bookings'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Icon, type IconName } from '@/components/ui/Icon'

type Status = 'confirmed' | 'pending' | 'completed' | 'cancelled'

const statusMap: Record<Status, { tone: 'success' | 'accent' | 'info' | 'danger'; label: string; icon: IconName }> = {
  confirmed: { tone: 'success', label: 'Confirmed', icon: 'circle-check' },
  pending: { tone: 'accent', label: 'Pending', icon: 'timer' },
  completed: { tone: 'info', label: 'Completed', icon: 'check-check' },
  cancelled: { tone: 'danger', label: 'Cancelled', icon: 'circle-x' },
}

const tabs = ['All', 'pending', 'confirmed', 'completed', 'cancelled'] as const

export default function BusinessBookings() {
  const { operatorId } = useAuth()
  const { bookings, loading, reload } = useOperatorBookings(operatorId)
  const [tab, setTab] = useState<(typeof tabs)[number]>('All')
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const cancel = async (id: string) => {
    if (!window.confirm('Cancel this booking? Seats will be released. This cannot be undone.')) return
    setError('')
    setCancellingId(id)
    const { error } = await cancelBooking(id)
    setCancellingId(null)
    if (error) { setError(error); return }
    reload()
  }

  const rows = tab === 'All' ? bookings : bookings.filter((b) => b.status === tab)
  const live = bookings.filter((b) => b.status !== 'cancelled')
  const revenue = live.reduce((s, b) => s + b.amount, 0)
  const pending = bookings.filter((b) => b.status === 'pending').length
  const pax = live.reduce((s, b) => s + b.travelers, 0)

  return (
    <DashboardLayout variant="business" title="Bookings" active="Bookings">
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total bookings" value={String(bookings.length)} icon="ticket" tone="brand" />
          <StatCard label="Pending requests" value={String(pending)} icon="timer" tone="accent" />
          <StatCard label="Travelers" value={String(pax)} icon="users" tone="info" />
          <StatCard label="Booking revenue" value={formatINR(revenue)} icon="indian-rupee" tone="success" />
        </div>

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

        <div className="overflow-hidden rounded-lg border border-line bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-5 py-3 font-medium">Traveler</th>
                  <th className="px-5 py-3 font-medium">Trip</th>
                  <th className="px-5 py-3 font-medium">Travel</th>
                  <th className="px-5 py-3 font-medium">Departure</th>
                  <th className="px-5 py-3 font-medium">Pax</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => {
                  const s = statusMap[b.status]
                  return (
                    <tr key={b.id} className="border-b border-line last:border-0 hover:bg-surface-muted/60">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar initials={b.initials} size={34} />
                          <div>
                            <p className="font-medium text-ink">{b.traveler}</p>
                            <p className="font-mono text-xs text-ink-muted">{b.reference}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-ink-secondary">{b.tripTitle}</td>
                      <td className="px-5 py-3.5">
                        {b.option === 'full' ? (
                          <span className="inline-flex items-center gap-1 text-ink-secondary"><Icon name="plane-takeoff" size={14} className="text-brand" /> {b.fromCity}</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-ink-secondary"><Icon name="luggage" size={14} className="text-brand" /> Land only</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-ink-secondary">{b.departureDate}</td>
                      <td className="px-5 py-3.5 text-ink-secondary">{b.travelers}</td>
                      <td className="px-5 py-3.5 font-medium text-ink">{formatINR(b.amount)}</td>
                      <td className="px-5 py-3.5"><Badge tone={s.tone} icon={s.icon}>{s.label}</Badge></td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/voucher?trip=${b.tripId}&ref=${b.reference}`} className={cn('text-sm font-medium', b.status === 'cancelled' ? 'text-ink-muted' : 'text-brand')}>View</Link>
                          {(b.status === 'confirmed' || b.status === 'pending') && (
                            <Button size="sm" variant="secondary" onClick={() => cancel(b.id)} disabled={cancellingId === b.id}>
                              {cancellingId === b.id ? 'Cancelling…' : 'Cancel'}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {loading && <div className="px-5 py-12 text-center text-sm text-ink-muted">Loading bookings…</div>}
          {!loading && !operatorId && (
            <div className="px-5 py-12 text-center text-sm text-ink-muted">Link your operator profile to see bookings — set <code>profiles.operator_id</code> in Supabase.</div>
          )}
          {!loading && operatorId && rows.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-ink-muted">No {tab === 'All' ? '' : `${tab} `}bookings yet.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
