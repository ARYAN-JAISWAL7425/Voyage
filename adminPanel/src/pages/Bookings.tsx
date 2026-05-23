import { useState } from 'react'
import { cn } from '@/lib/cn'
import { formatINR, formatINRCompact } from '@/lib/format'
import { type BookingStatus } from '@/data/admin'
import { usePlatformBookings } from '@/hooks/useAdminData'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'
import { type IconName } from '@/components/ui/Icon'

const statusMap: Record<BookingStatus, { tone: 'success' | 'accent' | 'info' | 'danger'; label: string; icon: IconName }> = {
  confirmed: { tone: 'success', label: 'Confirmed', icon: 'circle-check' },
  pending: { tone: 'accent', label: 'Pending', icon: 'timer' },
  completed: { tone: 'info', label: 'Completed', icon: 'check-check' },
  cancelled: { tone: 'danger', label: 'Cancelled', icon: 'circle-x' },
}

const tabs = ['All', 'confirmed', 'pending', 'completed', 'cancelled'] as const

export default function Bookings() {
  const { bookings, loading } = usePlatformBookings()
  const [tab, setTab] = useState<(typeof tabs)[number]>('All')
  const rows = tab === 'All' ? bookings : bookings.filter((b) => b.status === tab)
  const live = bookings.filter((b) => b.status !== 'cancelled')
  const gmv = live.reduce((s, b) => s + b.amount, 0)
  const commission = live.reduce((s, b) => s + b.commission, 0)

  return (
    <AdminLayout title="Bookings">
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard label="Total bookings" value={String(bookings.length)} icon="ticket" tone="brand" />
          <StatCard label="Gross value" value={formatINRCompact(gmv)} icon="indian-rupee" tone="accent" />
          <StatCard label="Commission" value={formatINRCompact(commission)} icon="wallet" tone="success" />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn('rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition', tab === t ? 'bg-brand text-white' : 'border border-line bg-white text-ink-secondary hover:bg-surface-muted')}>{t}</button>
          ))}
        </div>

        <div className="overflow-hidden rounded-lg border border-line bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-5 py-3 font-medium">Reference</th>
                  <th className="px-5 py-3 font-medium">Traveler</th>
                  <th className="px-5 py-3 font-medium">Operator</th>
                  <th className="px-5 py-3 font-medium">Trip</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Commission</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => {
                  const s = statusMap[b.status]
                  return (
                    <tr key={b.id} className="border-b border-line last:border-0 hover:bg-surface-muted/60">
                      <td className="px-5 py-3.5 font-mono text-xs text-ink-secondary">{b.reference}</td>
                      <td className="px-5 py-3.5 font-medium text-ink">{b.traveler}</td>
                      <td className="px-5 py-3.5 text-ink-secondary">{b.operator}</td>
                      <td className="px-5 py-3.5 text-ink-secondary">{b.trip}</td>
                      <td className="px-5 py-3.5 font-medium text-ink">{formatINR(b.amount)}</td>
                      <td className="px-5 py-3.5 font-medium text-success">{formatINR(b.commission)}</td>
                      <td className="px-5 py-3.5"><Badge tone={s.tone} icon={s.icon}>{s.label}</Badge></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {loading && <div className="px-5 py-12 text-center text-sm text-ink-muted">Loading bookings…</div>}
          {!loading && rows.length === 0 && <div className="px-5 py-12 text-center text-sm text-ink-muted">No {tab === 'All' ? '' : tab + ' '}bookings yet.</div>}
        </div>
      </div>
    </AdminLayout>
  )
}
