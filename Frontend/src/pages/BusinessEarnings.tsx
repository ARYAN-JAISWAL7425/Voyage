import { formatINR, formatINRCompact } from '@/lib/format'
import { useAuth } from '@/hooks/useAuth'
import { useOperatorBookings } from '@/hooks/useOperatorData'
import { revenueSeries } from '@/data/business'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'

const maxRev = Math.max(...revenueSeries.map((r) => r.v))

export default function BusinessEarnings() {
  const { operatorId } = useAuth()
  const { bookings, loading } = useOperatorBookings(operatorId)

  const live = bookings.filter((b) => b.status !== 'cancelled')
  const gross = live.reduce((s, b) => s + b.amount, 0)
  const commission = Math.round(gross * 0.1)
  const net = gross - commission

  return (
    <DashboardLayout variant="business" title="Earnings" active="Earnings">
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Gross bookings" value={formatINRCompact(gross)} icon="indian-rupee" tone="brand" />
          <StatCard label="Commission (10%)" value={formatINRCompact(commission)} icon="receipt" tone="accent" />
          <StatCard label="Net earnings" value={formatINRCompact(net)} icon="wallet" tone="success" />
          <StatCard label="Paid bookings" value={String(live.length)} icon="ticket" tone="info" />
        </div>

        <div className="rounded-lg border border-line bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <div><h3 className="font-heading text-base font-bold text-ink">Revenue trend</h3><p className="text-xs text-ink-muted">Illustrative · last 6 months</p></div>
            <Badge tone="success" icon="trending-up">+22%</Badge>
          </div>
          <div className="flex h-44 items-end justify-between gap-3">
            {revenueSeries.map((r) => (
              <div key={r.m} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-semibold text-ink">{r.v}</span>
                <div className="flex w-full items-end" style={{ height: '120px' }}><div className="w-full rounded-t-md bg-brand transition-all" style={{ height: `${(r.v / maxRev) * 100}%` }} /></div>
                <span className="text-xs text-ink-muted">{r.m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Earnings ledger from real bookings */}
        <div className="overflow-hidden rounded-lg border border-line bg-white">
          <div className="border-b border-line px-5 py-4"><h3 className="font-heading text-base font-bold text-ink">Earnings by booking</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-5 py-3 font-medium">Reference</th>
                  <th className="px-5 py-3 font-medium">Trip</th>
                  <th className="px-5 py-3 font-medium">Gross</th>
                  <th className="px-5 py-3 font-medium">Commission</th>
                  <th className="px-5 py-3 font-medium">You earn</th>
                </tr>
              </thead>
              <tbody>
                {live.map((b) => {
                  const c = Math.round(b.amount * 0.1)
                  return (
                    <tr key={b.id} className="border-b border-line last:border-0 hover:bg-surface-muted/60">
                      <td className="px-5 py-3.5 font-mono text-xs text-ink-secondary">{b.reference}</td>
                      <td className="px-5 py-3.5 text-ink-secondary">{b.tripTitle}</td>
                      <td className="px-5 py-3.5 text-ink">{formatINR(b.amount)}</td>
                      <td className="px-5 py-3.5 text-danger">− {formatINR(c)}</td>
                      <td className="px-5 py-3.5 font-medium text-success">{formatINR(b.amount - c)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {loading && <div className="px-5 py-12 text-center text-sm text-ink-muted">Loading…</div>}
          {!loading && live.length === 0 && <div className="px-5 py-12 text-center text-sm text-ink-muted">{operatorId ? 'No earnings yet — bookings will appear here.' : 'Complete operator setup to see earnings.'}</div>}
        </div>
      </div>
    </DashboardLayout>
  )
}
