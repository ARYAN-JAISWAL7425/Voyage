import { useState } from 'react'
import { cn } from '@/lib/cn'
import { formatINRCompact } from '@/lib/format'
import { type OperatorStatus } from '@/data/admin'
import { useOperators } from '@/hooks/useAdminData'
import { setOperatorStatus } from '@/lib/api/admin'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

const statusBadge: Record<OperatorStatus, { tone: 'success' | 'accent' | 'danger'; label: string }> = {
  verified: { tone: 'success', label: 'Verified' },
  pending: { tone: 'accent', label: 'Pending' },
  suspended: { tone: 'danger', label: 'Suspended' },
}

const tabs = ['All', 'pending', 'verified', 'suspended'] as const

export default function Operators() {
  const { operators, loading, reload } = useOperators()
  const [tab, setTab] = useState<(typeof tabs)[number]>('All')
  const [busy, setBusy] = useState<string | null>(null)
  const rows = tab === 'All' ? operators : operators.filter((o) => o.status === tab)

  const act = async (id: string, status: OperatorStatus) => {
    setBusy(id)
    await setOperatorStatus(id, status)
    setBusy(null)
    reload()
  }

  return (
    <AdminLayout title="Operators">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((t) => {
            const count = t === 'All' ? operators.length : operators.filter((o) => o.status === t).length
            return (
              <button key={t} onClick={() => setTab(t)} className={cn('rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition', tab === t ? 'bg-brand text-white' : 'border border-line bg-white text-ink-secondary hover:bg-surface-muted')}>
                {t} <span className={tab === t ? 'text-white/75' : 'text-ink-muted'}>{count}</span>
              </button>
            )
          })}
        </div>

        <div className="overflow-hidden rounded-lg border border-line bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-5 py-3 font-medium">Operator</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Trips</th>
                  <th className="px-5 py-3 font-medium">GMV</th>
                  <th className="px-5 py-3 font-medium">Rating</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => {
                  const s = statusBadge[o.status]
                  const isBusy = busy === o.id
                  return (
                    <tr key={o.id} className="border-b border-line last:border-0 hover:bg-surface-muted/60">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3"><Avatar initials={o.initials} size={36} /><div><p className="font-medium text-ink">{o.name}</p><p className="text-xs text-ink-muted">{o.location}</p></div></div>
                      </td>
                      <td className="px-5 py-3.5"><Badge tone={s.tone}>{s.label}</Badge></td>
                      <td className="px-5 py-3.5 text-ink-secondary">{o.trips || '—'}</td>
                      <td className="px-5 py-3.5 font-medium text-ink">{o.gmv ? formatINRCompact(o.gmv) : '—'}</td>
                      <td className="px-5 py-3.5">{o.rating ? <span className="inline-flex items-center gap-1 text-ink"><Icon name="star" size={13} className="text-star" fill="currentColor" strokeWidth={1.5} /> {o.rating}</span> : <span className="text-ink-muted">—</span>}</td>
                      <td className="px-5 py-3.5 text-ink-secondary">{o.joined}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          {o.status === 'pending' && <><Button size="sm" variant="success" iconLeft="check" disabled={isBusy} onClick={() => act(o.id, 'verified')}>Verify</Button><Button size="sm" variant="secondary" disabled={isBusy} onClick={() => act(o.id, 'suspended')}>Reject</Button></>}
                          {o.status === 'verified' && <Button size="sm" variant="secondary" disabled={isBusy} onClick={() => act(o.id, 'suspended')}>Suspend</Button>}
                          {o.status === 'suspended' && <Button size="sm" variant="secondary" disabled={isBusy} onClick={() => act(o.id, 'verified')}>Reinstate</Button>}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {loading && <div className="px-5 py-12 text-center text-sm text-ink-muted">Loading operators…</div>}
          {!loading && rows.length === 0 && <div className="px-5 py-12 text-center text-sm text-ink-muted">No {tab === 'All' ? '' : tab + ' '}operators.</div>}
        </div>
      </div>
    </AdminLayout>
  )
}
