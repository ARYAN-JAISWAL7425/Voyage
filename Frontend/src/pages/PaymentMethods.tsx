import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon, type IconName } from '@/components/ui/Icon'

interface Method { id: string; label: string; sub: string; icon: IconName; primary?: boolean }

const methods: Method[] = [
  { id: 'm1', label: 'aarav@okhdfc', sub: 'UPI · HDFC Bank', icon: 'smartphone', primary: true },
  { id: 'm2', label: 'HDFC Credit •••• 4821', sub: 'Expires 08/27', icon: 'credit-card' },
  { id: 'm3', label: 'ICICI Debit •••• 1190', sub: 'Expires 02/29', icon: 'credit-card' },
]

export default function PaymentMethods() {
  return (
    <DashboardLayout variant="traveler" title="Payment methods" active="Payment methods">
      <div className="flex max-w-[680px] flex-col gap-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-secondary">Manage your saved payment options.</p>
          <Button size="sm" iconLeft="plus">Add method</Button>
        </div>

        <div className="flex flex-col gap-3">
          {methods.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-lg border border-line bg-white p-4">
              <div className="flex items-center gap-3.5">
                <span className="grid h-11 w-11 place-items-center rounded-md bg-brand-soft text-brand"><Icon name={m.icon} size={20} /></span>
                <div>
                  <p className="flex items-center gap-2 font-medium text-ink">{m.label}{m.primary && <Badge tone="brand">Default</Badge>}</p>
                  <p className="text-xs text-ink-muted">{m.sub}</p>
                </div>
              </div>
              <button className="text-ink-muted hover:text-danger"><Icon name="trash-2" size={18} /></button>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2.5 rounded-lg border border-line bg-surface-muted p-4 text-sm text-ink-secondary">
          <Icon name="shield-check" size={18} className="mt-0.5 shrink-0 text-brand" />
          <span>Payments are processed securely via Razorpay. Voyago never stores your full card details.</span>
        </div>
      </div>
    </DashboardLayout>
  )
}
