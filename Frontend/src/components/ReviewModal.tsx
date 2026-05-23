import { useState } from 'react'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'

interface Props {
  open: boolean
  onClose: () => void
  tripTitle: string
  tripImage: string
  operatorName?: string
}

export function ReviewModal({ open, onClose, tripTitle, tripImage, operatorName }: Props) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [recommend, setRecommend] = useState<boolean | null>(null)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-[#0C2027]/80 p-4" onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-[560px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-heading text-[17px] font-bold text-ink">Write a review</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink"><Icon name="x" size={20} /></button>
        </div>

        <div className="flex flex-col gap-5 overflow-y-auto p-6">
          <div className="flex items-center gap-3 rounded-md border border-line bg-surface-muted p-3">
            <img src={tripImage} alt="" className="h-12 w-14 rounded-md object-cover" />
            <div>
              <p className="text-sm font-semibold text-ink">{tripTitle}</p>
              {operatorName && <p className="text-xs text-ink-muted">{operatorName}</p>}
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-medium text-ink-secondary">How would you rate this trip?</p>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => setRating(n)}>
                  <Icon name="star" size={34} className={(hover || rating) >= n ? 'text-star' : 'text-line-strong'} fill="currentColor" strokeWidth={1} />
                </button>
              ))}
            </div>
            {rating > 0 && <span className="text-xs text-ink-muted">{['Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating - 1]}</span>}
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-ink">Review title</span>
            <input placeholder="Sum up your experience" className="h-11 rounded-sm border border-line-strong px-3.5 text-sm text-ink outline-none focus:border-brand placeholder:text-ink-muted" />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-ink">Your review</span>
            <textarea rows={4} placeholder="Tell other travelers about the trip, the operator, and the highlights…" className="rounded-sm border border-line-strong p-3.5 text-sm text-ink outline-none focus:border-brand placeholder:text-ink-muted" />
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-ink">Would you recommend this trip?</span>
            <div className="flex gap-2.5">
              {[{ v: true, label: 'Yes, definitely', icon: 'thumbs-up' as const }, { v: false, label: 'Not really', icon: 'x' as const }].map((o) => (
                <button key={o.label} onClick={() => setRecommend(o.v)}
                  className={cn('flex flex-1 items-center justify-center gap-2 rounded-sm border py-2.5 text-sm font-medium transition',
                    recommend === o.v ? 'border-brand bg-brand-soft text-brand' : 'border-line-strong text-ink-secondary hover:border-brand')}>
                  <Icon name={o.icon} size={16} /> {o.label}
                </button>
              ))}
            </div>
          </div>

          <button className="flex items-center justify-center gap-2 rounded-sm border-[1.5px] border-dashed border-line-strong py-3 text-sm font-medium text-ink-secondary hover:border-brand hover:text-brand">
            <Icon name="camera" size={17} /> Add photos
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-line px-6 py-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose} disabled={rating === 0} iconLeft="check">Submit review</Button>
        </div>
      </div>
    </div>
  )
}
