import { useState } from 'react'
import { cn } from '@/lib/cn'
import { useAuth } from '@/hooks/useAuth'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

function Card({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-white p-6">
      <h2 className="font-heading text-base font-bold text-ink">{title}</h2>
      {desc && <p className="mt-0.5 text-sm text-ink-secondary">{desc}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

function Toggle({ label, desc, on, onClick }: { label: string; desc: string; on: boolean; onClick: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-xs text-ink-muted">{desc}</p>
      </div>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={on}
        className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', on ? 'bg-brand' : 'bg-line-strong')}
      >
        <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', on ? 'left-[22px]' : 'left-0.5')} />
      </button>
    </div>
  )
}

export default function TravelerSettings() {
  const { user } = useAuth()
  const fullName = (user?.user_metadata?.full_name as string | undefined) || ''
  const userEmail = user?.email || ''
  const [prefs, setPrefs] = useState({ deals: true, trip: true, sms: false, newsletter: true })
  const toggle = (k: keyof typeof prefs) => setPrefs((p) => ({ ...p, [k]: !p[k] }))

  return (
    <DashboardLayout variant="traveler" title="Settings" active="Settings">
      <div className="flex max-w-[680px] flex-col gap-5">
        <Card title="Profile" desc="Your personal details">
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Full name" defaultValue={fullName} placeholder="Your full name" />
              <Input label="City" icon="map-pin" placeholder="Your city" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Email" icon="mail" defaultValue={userEmail} placeholder="you@example.com" />
              <Input label="Phone" icon="phone" placeholder="+91 ..." />
            </div>
          </div>
        </Card>

        <Card title="Notifications" desc="Choose what we email or text you about">
          <div className="flex flex-col divide-y divide-line">
            <Toggle label="Deals & offers" desc="Discounts on trips you might like" on={prefs.deals} onClick={() => toggle('deals')} />
            <Toggle label="Trip updates" desc="Booking confirmations & reminders" on={prefs.trip} onClick={() => toggle('trip')} />
            <Toggle label="SMS alerts" desc="Texts for important updates" on={prefs.sms} onClick={() => toggle('sms')} />
            <Toggle label="Newsletter" desc="Travel inspiration, monthly" on={prefs.newsletter} onClick={() => toggle('newsletter')} />
          </div>
        </Card>

        <Card title="Security">
          <div className="flex flex-wrap gap-2.5">
            <Button variant="secondary" iconLeft="lock">Change password</Button>
            <Button variant="secondary" iconLeft="smartphone">Two-factor auth</Button>
          </div>
        </Card>

        <div className="flex justify-end gap-2.5">
          <Button variant="secondary">Cancel</Button>
          <Button iconLeft="check">Save changes</Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
