import { useState } from 'react'
import { cn } from '@/lib/cn'
import { formatINR } from '@/lib/format'
import { type ListingStatus, type AdminListing } from '@/data/admin'
import { useListings } from '@/hooks/useAdminData'
import { deleteListing } from '@/lib/api/admin'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

const statusBadge: Record<ListingStatus, { tone: 'success' | 'accent' | 'danger'; label: string }> = {
  published: { tone: 'success', label: 'Published' },
  pending: { tone: 'accent', label: 'Pending review' },
  rejected: { tone: 'danger', label: 'Rejected' },
}

const tabs = ['All', 'pending', 'published', 'rejected'] as const

export default function Listings() {
  const { listings, loading, reload } = useListings()
  const [tab, setTab] = useState<(typeof tabs)[number]>('All')
  const [confirm, setConfirm] = useState<AdminListing | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [err, setErr] = useState('')
  const rows = tab === 'All' ? listings : listings.filter((l) => l.status === tab)

  const remove = async () => {
    if (!confirm) return
    setErr('')
    setDeleting(true)
    const { error } = await deleteListing(confirm.id)
    setDeleting(false)
    if (error) { setErr(error); return }
    setConfirm(null)
    reload()
  }

  return (
    <AdminLayout title="Listings">
      <div className="flex flex-col gap-5">
        <p className="text-sm text-ink-secondary">Every trip in the catalog. (A moderation workflow — pending/approve/reject — isn't enabled yet, so live trips show as Published.)</p>
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((t) => {
            const count = t === 'All' ? listings.length : listings.filter((l) => l.status === t).length
            return (
              <button key={t} onClick={() => setTab(t)} className={cn('rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition', tab === t ? 'bg-brand text-white' : 'border border-line bg-white text-ink-secondary hover:bg-surface-muted')}>
                {t} <span className={tab === t ? 'text-white/75' : 'text-ink-muted'}>{count}</span>
              </button>
            )
          })}
        </div>

        <div className="overflow-hidden rounded-lg border border-line bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-5 py-3 font-medium">Trip</th>
                  <th className="px-5 py-3 font-medium">Operator</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Submitted</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((l) => {
                  const s = statusBadge[l.status]
                  return (
                    <tr key={l.id} className="border-b border-line last:border-0 hover:bg-surface-muted/60">
                      <td className="px-5 py-3.5"><p className="font-medium text-ink">{l.title}</p><p className="text-xs text-ink-muted">{l.location}</p></td>
                      <td className="px-5 py-3.5 text-ink-secondary">{l.operator}</td>
                      <td className="px-5 py-3.5 font-medium text-ink">{formatINR(l.price)}</td>
                      <td className="px-5 py-3.5"><Badge tone={s.tone}>{s.label}</Badge></td>
                      <td className="px-5 py-3.5 text-ink-secondary">{l.submitted}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          {l.status === 'pending' && <><Button size="sm" variant="success" iconLeft="check">Approve</Button><Button size="sm" variant="secondary">Reject</Button></>}
                          {l.status === 'published' && <span className="inline-flex items-center gap-1 text-sm font-medium text-ink-muted"><Icon name="eye" size={14} /> Live</span>}
                          <Button size="sm" variant="danger" iconLeft="trash-2" onClick={() => { setErr(''); setConfirm(l) }}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {loading && <div className="px-5 py-12 text-center text-sm text-ink-muted">Loading listings…</div>}
          {!loading && rows.length === 0 && <div className="px-5 py-12 text-center text-sm text-ink-muted">No {tab === 'All' ? '' : tab + ' '}listings.</div>}
        </div>
      </div>

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !deleting && setConfirm(null)}>
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-danger-soft"><Icon name="trash-2" size={18} className="text-danger" /></span>
              <div>
                <h3 className="font-heading text-lg font-bold text-ink">Delete this listing?</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-secondary">
                  <span className="font-medium text-ink">{confirm.title}</span> by {confirm.operator} will be permanently removed, along with its departures and reviews. Existing bookings are kept but will no longer link to this trip.
                </p>
              </div>
            </div>
            {err && (
              <p className="mt-4 flex items-center gap-2 rounded-sm bg-danger-soft px-3 py-2.5 text-[13px] font-medium text-danger">
                <Icon name="circle-alert" size={15} className="shrink-0" /> {err}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-2.5">
              <Button variant="secondary" size="sm" onClick={() => setConfirm(null)} disabled={deleting}>Cancel</Button>
              <Button variant="danger" size="sm" iconLeft="trash-2" onClick={remove} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete listing'}</Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
