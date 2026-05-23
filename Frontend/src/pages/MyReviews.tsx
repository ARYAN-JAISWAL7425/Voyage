import { Link } from 'react-router-dom'
import { tripById } from '@/data/trips'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

interface MyReview { tripId: string; rating: number; date: string; title: string; body: string }

const myReviews: MyReview[] = [
  { tripId: 'kerala-backwaters', rating: 5, date: '20 Jan 2026', title: 'Houseboat night was unforgettable', body: 'The Alleppey houseboat and Munnar tea gardens were stunning. Smoothly organised end to end — would book again.' },
  { tripId: 'manali-snow', rating: 4, date: '12 Jan 2026', title: 'Great value snow trip', body: 'Solang Valley was full of snow and fun. The overnight Volvo is long but the price made it totally worth it.' },
]

// Completed trips the traveler hasn't reviewed yet.
const awaiting = ['ladakh-himalayan']

export default function MyReviews() {
  return (
    <DashboardLayout variant="traveler" title="My reviews" active="My reviews">
      <div className="flex flex-col gap-6">
        {/* Awaiting review */}
        {awaiting.length > 0 && (
          <div className="flex flex-col gap-3 rounded-lg border border-line bg-white p-5">
            <h3 className="font-heading text-base font-bold text-ink">Awaiting your review</h3>
            {awaiting.map((id) => {
              const trip = tripById(id)
              if (!trip) return null
              return (
                <div key={id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line bg-surface-muted p-3.5">
                  <div className="flex items-center gap-3">
                    <img src={trip.image} alt="" className="h-12 w-14 rounded-md object-cover" />
                    <div><p className="font-medium text-ink">{trip.title}</p><p className="text-xs text-ink-muted">Completed · share your experience</p></div>
                  </div>
                  <Button size="sm" iconLeft="star">Write a review</Button>
                </div>
              )
            })}
          </div>
        )}

        {/* Written reviews */}
        <div className="flex flex-col gap-4">
          <h3 className="font-heading text-base font-bold text-ink">Your reviews</h3>
          {myReviews.map((r) => {
            const trip = tripById(r.tripId)
            return (
              <div key={r.tripId} className="rounded-lg border border-line bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {trip && <img src={trip.image} alt="" className="h-12 w-14 rounded-md object-cover" />}
                    <div>
                      <Link to={`/trip/${r.tripId}`} className="font-semibold text-ink hover:text-brand">{trip?.title}</Link>
                      <p className="text-xs text-ink-muted">{r.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Icon key={i} name="star" size={14} className={i < r.rating ? 'text-star' : 'text-line-strong'} fill={i < r.rating ? 'currentColor' : 'none'} strokeWidth={1.5} />)}</div>
                </div>
                <h4 className="mt-3 font-heading text-base font-semibold text-ink">{r.title}</h4>
                <p className="mt-1 text-sm leading-relaxed text-ink-secondary">{r.body}</p>
                <div className="mt-3 flex gap-3">
                  <button className="inline-flex items-center gap-1 text-sm font-medium text-brand"><Icon name="pencil" size={14} /> Edit</button>
                  <button className="inline-flex items-center gap-1 text-sm font-medium text-ink-muted hover:text-danger"><Icon name="trash-2" size={14} /> Delete</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
