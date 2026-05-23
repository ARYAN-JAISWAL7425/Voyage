import { formatINR } from '@/lib/format'
import { usePlatformBookings } from '@/hooks/useAdminData'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'

export default function Disputes() {
  const { bookings, loading } = usePlatformBookings()
  const cancelled = bookings.filter((b) => b.status === 'cancelled')
  const refunded = cancelled.reduce((s, b) => s + b.amount, 0)

  return (
    <AdminLayout title="Disputes">
      <div className="flex flex-col gap-5">
        <p className="text-sm text-ink-secondary">
          Cancelled bookings &amp; refund cases from real data. (A full dispute/ticketing workflow isn't built yet — this surfaces cancellations, the platform's real refund signal.)
        </p>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard label="Cancellations" value={String(cancelled.length)} icon="circle-x" tone="danger" />
          <StatCard label="Active bookings" value={String(bookings.length - cancelled.length)} icon="circle-check" tone="success" />
          <StatCard label="Refunded (total)" value={formatINR(refunded)} icon="banknote" tone="info" />
        </div>

        <div className="overflow-hidden rounded-lg border border-line bg-white">
          <div className="border-b border-line px-5 py-4"><h3 className="font-heading text-base font-bold text-ink">Cancelled bookings</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-5 py-3 font-medium">Traveler</th>
                  <th className="px-5 py-3 font-medium">Trip</th>
                  <th className="px-5 py-3 font-medium">Operator</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {cancelled.map((b) => (
                  <tr key={b.id} className="border-b border-line last:border-0 hover:bg-surface-muted/60">
                    <td className="px-5 py-3.5"><p className="font-medium text-ink">{b.traveler}</p><p className="font-mono text-xs text-ink-muted">{b.reference}</p></td>
                    <td className="px-5 py-3.5 text-ink-secondary">{b.trip}</td>
                    <td className="px-5 py-3.5 text-ink-secondary">{b.operator}</td>
                    <td className="px-5 py-3.5 font-medium text-ink">{formatINR(b.amount)}</td>
                    <td className="px-5 py-3.5 text-ink-secondary">{b.date}</td>
                    <td className="px-5 py-3.5 text-right"><Badge tone="danger">Cancelled</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {loading && <div className="px-5 py-12 text-center text-sm text-ink-muted">Loading…</div>}
          {!loading && cancelled.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-5 py-14 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-surface-muted"><Icon name="circle-check" size={24} className="text-success" /></span>
              <p className="font-heading text-base font-semibold text-ink">No cancellations or disputes</p>
              <p className="text-sm text-ink-secondary">Every booking on the platform is currently active.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
