import { formatINR, formatINRCompact } from '@/lib/format'
import { useOperatorPayouts, usePlatformStats } from '@/hooks/useAdminData'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { StatCard } from '@/components/ui/StatCard'
import { Avatar } from '@/components/ui/Avatar'
import { Icon } from '@/components/ui/Icon'

export default function Payments() {
  const { payouts, loading } = useOperatorPayouts()
  const stats = usePlatformStats()
  const totalPayout = payouts.reduce((s, p) => s + p.payout, 0)

  return (
    <AdminLayout title="Payments">
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3 rounded-lg border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-ink-secondary">
          <Icon name="info" size={16} className="mt-0.5 shrink-0 text-accent" />
          <p>
            <span className="font-semibold text-ink">Payouts are manual for now.</span> Every payment settles into the platform's Razorpay account first — pay each operator their <span className="font-medium text-ink">Net payout</span> (booking revenue − 10% commission) by bank transfer / UPI. Automatic splitting at payment time would need Razorpay Route + each operator onboarded with KYC.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="GMV" value={formatINRCompact(stats?.gmv ?? 0)} icon="indian-rupee" tone="brand" />
          <StatCard label="Commission earned" value={formatINRCompact(stats?.commission ?? 0)} icon="wallet" tone="success" />
          <StatCard label="Operator payouts" value={formatINRCompact(totalPayout)} icon="banknote" tone="accent" />
          <StatCard label="Bookings" value={String(stats?.bookings ?? 0)} icon="ticket" tone="info" />
        </div>

        <div className="overflow-hidden rounded-lg border border-line bg-white">
          <div className="border-b border-line px-5 py-4"><h3 className="font-heading text-base font-bold text-ink">Operator payouts</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-5 py-3 font-medium">Operator</th>
                  <th className="px-5 py-3 font-medium">Bookings</th>
                  <th className="px-5 py-3 font-medium">Gross revenue</th>
                  <th className="px-5 py-3 font-medium">Commission (10%)</th>
                  <th className="px-5 py-3 text-right font-medium">Net payout</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id} className="border-b border-line last:border-0 hover:bg-surface-muted/60">
                    <td className="px-5 py-3.5"><div className="flex items-center gap-3"><Avatar initials={p.initials} size={34} /><span className="font-medium text-ink">{p.operator}</span></div></td>
                    <td className="px-5 py-3.5 text-ink-secondary">{p.bookings}</td>
                    <td className="px-5 py-3.5 text-ink-secondary">{formatINR(p.gross)}</td>
                    <td className="px-5 py-3.5 text-ink-secondary">{formatINR(p.commission)}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-ink">{formatINR(p.payout)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {loading && <div className="px-5 py-12 text-center text-sm text-ink-muted">Loading payouts…</div>}
          {!loading && payouts.length === 0 && <div className="px-5 py-12 text-center text-sm text-ink-muted">No operator earnings yet — payouts appear once bookings come in.</div>}
        </div>
      </div>
    </AdminLayout>
  )
}
