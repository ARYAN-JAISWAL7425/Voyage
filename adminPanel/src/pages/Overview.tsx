import { Link } from 'react-router-dom'
import { formatINR, formatINRCompact, formatNumberIN } from '@/lib/format'
import { gmvSeries, disputes } from '@/data/admin'
import { usePlatformStats, useOperators, usePlatformBookings } from '@/hooks/useAdminData'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Icon, type IconName } from '@/components/ui/Icon'

const maxGmv = Math.max(...gmvSeries.map((g) => g.v))

const bookingTone: Record<string, 'success' | 'accent' | 'info' | 'danger'> = {
  confirmed: 'success', pending: 'accent', completed: 'info', cancelled: 'danger',
}

export default function Overview() {
  const stats = usePlatformStats()
  const { operators } = useOperators()
  const { bookings } = usePlatformBookings()

  const pendingOps = operators.filter((o) => o.status === 'pending').length
  const openDisputes = disputes.filter((d) => d.status === 'open').length // illustrative
  const topOperators = operators.filter((o) => o.status === 'verified').sort((a, b) => b.gmv - a.gmv).slice(0, 5)
  const maxOpGmv = topOperators[0]?.gmv || 1
  const recent = bookings.slice(0, 5)

  const attention: { label: string; count: number; icon: IconName; to: string; tone: string }[] = [
    { label: 'Operators awaiting verification', count: pendingOps, icon: 'badge-check', to: '/operators', tone: 'text-accent' },
    { label: 'Open disputes (illustrative)', count: openDisputes, icon: 'life-buoy', to: '/disputes', tone: 'text-danger' },
  ]

  return (
    <AdminLayout title="Overview">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Gross bookings (GMV)" value={formatINRCompact(stats?.gmv ?? 0)} icon="indian-rupee" tone="brand" />
          <StatCard label="Total bookings" value={formatNumberIN(stats?.bookings ?? 0)} icon="ticket" tone="accent" />
          <StatCard label="Active operators" value={String(stats?.operators ?? 0)} icon="badge-check" tone="info" />
          <StatCard label="Commission earned" value={formatINRCompact(stats?.commission ?? 0)} icon="wallet" tone="success" />
        </div>

        <div className="flex flex-col gap-5 lg:flex-row">
          {/* GMV chart — illustrative sample trend */}
          <div className="flex-1 rounded-lg border border-line bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <div><h3 className="font-heading text-base font-bold text-ink">Gross merchandise value</h3><p className="text-xs text-ink-muted">Illustrative · last 6 months (₹ lakh)</p></div>
              <Badge tone="info">Sample</Badge>
            </div>
            <div className="flex h-48 items-end justify-between gap-3">
              {gmvSeries.map((g) => (
                <div key={g.m} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-semibold text-ink">{g.v}</span>
                  <div className="flex w-full items-end" style={{ height: '140px' }}><div className="w-full rounded-t-md bg-brand transition-all" style={{ height: `${(g.v / maxGmv) * 100}%` }} /></div>
                  <span className="text-xs text-ink-muted">{g.m}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Needs attention */}
          <div className="w-full lg:w-80">
            <div className="rounded-lg border border-line bg-white p-5">
              <h3 className="mb-3 font-heading text-base font-bold text-ink">Needs attention</h3>
              <div className="flex flex-col gap-1">
                {attention.map((a) => (
                  <Link key={a.label} to={a.to} className="flex items-center justify-between rounded-md px-2 py-2.5 hover:bg-surface-muted">
                    <span className="flex items-center gap-2.5 text-sm text-ink-secondary"><Icon name={a.icon} size={16} className={a.tone} /> {a.label}</span>
                    <span className="grid h-6 min-w-6 place-items-center rounded-full bg-surface-muted px-2 text-xs font-bold text-ink">{a.count}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 lg:flex-row">
          {/* Recent bookings */}
          <div className="flex-1 overflow-hidden rounded-lg border border-line bg-white">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h3 className="font-heading text-base font-bold text-ink">Recent bookings</h3>
              <Link to="/bookings" className="text-sm font-medium text-brand">View all</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead><tr className="border-b border-line text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-5 py-3 font-medium">Traveler</th><th className="px-5 py-3 font-medium">Operator</th><th className="px-5 py-3 font-medium">Amount</th><th className="px-5 py-3 font-medium">Status</th>
                </tr></thead>
                <tbody>
                  {recent.map((b) => (
                    <tr key={b.id} className="border-b border-line last:border-0">
                      <td className="px-5 py-3 font-medium text-ink">{b.traveler}</td>
                      <td className="px-5 py-3 text-ink-secondary">{b.operator}</td>
                      <td className="px-5 py-3 font-medium text-ink">{formatINR(b.amount)}</td>
                      <td className="px-5 py-3"><Badge tone={bookingTone[b.status]} className="capitalize">{b.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {recent.length === 0 && <div className="px-5 py-10 text-center text-sm text-ink-muted">No bookings yet — they'll appear as travelers book.</div>}
          </div>

          {/* Top operators */}
          <div className="w-full lg:w-80">
            <div className="rounded-lg border border-line bg-white p-5">
              <h3 className="mb-3 font-heading text-base font-bold text-ink">Top operators by GMV</h3>
              <div className="flex flex-col gap-3">
                {topOperators.map((o) => (
                  <div key={o.id} className="flex items-center gap-3">
                    <Avatar initials={o.initials} size={32} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{o.name}</p>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-brand" style={{ width: `${(o.gmv / maxOpGmv) * 100}%` }} /></div>
                    </div>
                    <span className="text-xs font-semibold text-ink-secondary">{o.gmv ? formatINRCompact(o.gmv) : '—'}</span>
                  </div>
                ))}
                {topOperators.length === 0 && <p className="text-sm text-ink-muted">No verified operators yet.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
