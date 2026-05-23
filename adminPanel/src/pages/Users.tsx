import { useState } from 'react'
import { cn } from '@/lib/cn'
import { type UserStatus } from '@/data/admin'
import { useUsers } from '@/hooks/useAdminData'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

const statusBadge: Record<UserStatus, { tone: 'success' | 'danger'; label: string }> = {
  active: { tone: 'success', label: 'Active' },
  suspended: { tone: 'danger', label: 'Suspended' },
}

const tabs = ['All', 'Traveler', 'Operator', 'suspended'] as const

export default function Users() {
  const { users, loading } = useUsers()
  const [tab, setTab] = useState<(typeof tabs)[number]>('All')
  const rows = users.filter((u) => {
    if (tab === 'All') return true
    if (tab === 'suspended') return u.status === 'suspended'
    return u.role === tab
  })

  return (
    <AdminLayout title="Users">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn('rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition', tab === t ? 'bg-brand text-white' : 'border border-line bg-white text-ink-secondary hover:bg-surface-muted')}>
              {t === 'Traveler' ? 'Travelers' : t === 'Operator' ? 'Operators' : t}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-lg border border-line bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 font-medium">Bookings</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => {
                  const s = statusBadge[u.status]
                  return (
                    <tr key={u.id} className="border-b border-line last:border-0 hover:bg-surface-muted/60">
                      <td className="px-5 py-3.5"><div className="flex items-center gap-3"><Avatar initials={u.initials} size={36} /><div><p className="font-medium text-ink">{u.name}</p><p className="text-xs text-ink-muted">{u.email}</p></div></div></td>
                      <td className="px-5 py-3.5"><Badge tone={u.role === 'Operator' ? 'brand' : 'neutral'}>{u.role}</Badge></td>
                      <td className="px-5 py-3.5 text-ink-secondary">{u.joined}</td>
                      <td className="px-5 py-3.5 text-ink-secondary">{u.bookings}</td>
                      <td className="px-5 py-3.5"><Badge tone={s.tone}>{s.label}</Badge></td>
                      <td className="px-5 py-3.5 text-right"><Button size="sm" variant="secondary">{u.status === 'active' ? 'Suspend' : 'Reinstate'}</Button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {loading && <div className="px-5 py-12 text-center text-sm text-ink-muted">Loading users…</div>}
          {!loading && rows.length === 0 && <div className="px-5 py-12 text-center text-sm text-ink-muted">No users yet — sign-ups will appear here.</div>}
        </div>
      </div>
    </AdminLayout>
  )
}
