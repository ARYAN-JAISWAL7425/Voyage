import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getOperatorById } from '@/lib/api/operators'
import { updateOperator } from '@/lib/api/operator'
import type { Operator } from '@/types'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'

function Card({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-white p-6">
      <h2 className="font-heading text-base font-bold text-ink">{title}</h2>
      {desc && <p className="mt-0.5 text-sm text-ink-secondary">{desc}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

export default function BusinessSettings() {
  const { operatorId } = useAuth()
  const [operator, setOperator] = useState<Operator | null>(null)
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [responseTime, setResponseTime] = useState('')
  const [about, setAbout] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!operatorId) return
    let active = true
    getOperatorById(operatorId).then((op) => {
      if (active && op) {
        setOperator(op)
        setName(op.name)
        setLocation(op.location)
        setResponseTime(op.responseTime)
        setAbout(op.about)
      }
    })
    return () => {
      active = false
    }
  }, [operatorId])

  const save = async () => {
    if (!operatorId) return
    setSaving(true)
    setSaved(false)
    await updateOperator(operatorId, { name, location, about, response_time: responseTime })
    setSaving(false)
    setSaved(true)
  }

  return (
    <DashboardLayout variant="business" title="Settings" active="Settings">
      <div className="flex max-w-[760px] flex-col gap-5">
        {/* Verification status */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface-muted p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-soft text-brand"><Icon name={operator?.verified ? 'shield-check' : 'timer'} size={22} /></span>
            <div>
              <p className="font-semibold text-ink">{operator?.verified ? 'Verified operator' : 'Verification pending'}</p>
              <p className="text-sm text-ink-secondary">{operator ? `Partner since ${operator.since} · ${operator.tripsCount} trips` : 'Loading…'}</p>
            </div>
          </div>
          <Badge tone={operator?.verified ? 'success' : 'accent'} icon={operator?.verified ? 'badge-check' : 'timer'}>{operator?.verified ? 'Verified' : 'Pending'}</Badge>
        </div>

        <Card title="Business profile" desc="This is what travelers see on your trips">
          <div className="flex flex-col gap-4">
            <Input label="Business name" value={name} onChange={(e) => setName(e.target.value)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Location" icon="map-pin" value={location} onChange={(e) => setLocation(e.target.value)} />
              <Input label="Typical response time" value={responseTime} onChange={(e) => setResponseTime(e.target.value)} />
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-ink-secondary">About</span>
              <textarea rows={3} value={about} onChange={(e) => setAbout(e.target.value)} className="rounded-sm border border-line-strong bg-white p-3.5 text-sm text-ink outline-none focus:border-brand" />
            </label>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          {saved && <span className="inline-flex items-center gap-1 text-sm font-medium text-success"><Icon name="circle-check" size={15} /> Saved</span>}
          <Button iconLeft="check" onClick={save} disabled={saving || !operatorId}>{saving ? 'Saving…' : 'Save changes'}</Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
