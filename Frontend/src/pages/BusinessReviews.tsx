import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useOperatorReviews } from '@/hooks/useOperatorData'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

export default function BusinessReviews() {
  const { operatorId } = useAuth()
  const { reviews, loading } = useOperatorReviews(operatorId)
  const [replyTo, setReplyTo] = useState<string | null>(null)

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '—'
  const dist = [5, 4, 3, 2, 1].map((star) => ({ star, count: reviews.filter((r) => r.rating === star).length }))

  return (
    <DashboardLayout variant="business" title="Reviews" active="Reviews">
      <div className="flex flex-col gap-5">
        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-[260px_1fr]">
          <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-line bg-white p-6">
            <span className="font-heading text-4xl font-bold text-ink">{avg}</span>
            <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Icon key={i} name="star" size={16} className="text-star" fill="currentColor" strokeWidth={1.5} />)}</div>
            <span className="text-sm text-ink-secondary">{reviews.length} reviews</span>
          </div>
          <div className="flex flex-col justify-center gap-1.5 rounded-lg border border-line bg-white p-6">
            {dist.map((d) => (
              <div key={d.star} className="flex items-center gap-3 text-sm">
                <span className="flex w-10 items-center gap-1 text-ink-secondary">{d.star} <Icon name="star" size={12} className="text-star" fill="currentColor" strokeWidth={1.5} /></span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-star" style={{ width: `${reviews.length ? (d.count / reviews.length) * 100 : 0}%` }} /></div>
                <span className="w-6 text-right text-ink-muted">{d.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex flex-col gap-4">
          {loading && <div className="rounded-lg border border-dashed border-line-strong py-12 text-center text-sm text-ink-muted">Loading reviews…</div>}
          {!loading && reviews.length === 0 && <div className="rounded-lg border border-dashed border-line-strong py-12 text-center text-sm text-ink-muted">{operatorId ? 'No reviews yet.' : 'Complete operator setup to see reviews.'}</div>}
          {reviews.map((r) => (
            <div key={r.id} className="rounded-lg border border-line bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar initials={r.initials} size={40} />
                  <div>
                    <p className="font-semibold text-ink">{r.author}</p>
                    <p className="text-xs text-ink-muted">{r.tripTitle} · {r.date}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, i) => <Icon key={i} name="star" size={14} className="text-star" fill="currentColor" strokeWidth={1.5} />)}</div>
              </div>
              <h3 className="mt-3 font-heading text-base font-semibold text-ink">{r.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-secondary">{r.body}</p>
              <div className="mt-3 flex items-center gap-4 text-sm text-ink-muted">
                <span className="inline-flex items-center gap-1"><Icon name="thumbs-up" size={14} /> {r.helpful} helpful</span>
                <button onClick={() => setReplyTo(replyTo === r.id ? null : r.id)} className="inline-flex items-center gap-1 font-medium text-brand"><Icon name="message-circle" size={14} /> Reply</button>
              </div>
              {replyTo === r.id && (
                <div className="mt-3 flex flex-col gap-2">
                  <textarea rows={2} placeholder="Write a public reply…" className="rounded-sm border border-line-strong bg-white p-3 text-sm text-ink outline-none focus:border-brand placeholder:text-ink-muted" />
                  <div className="flex gap-2"><Button size="sm">Post reply</Button><Button size="sm" variant="secondary" onClick={() => setReplyTo(null)}>Cancel</Button></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
