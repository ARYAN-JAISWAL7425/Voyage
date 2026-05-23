import { useState } from 'react'
import { cn } from '@/lib/cn'
import { Container } from '@/components/ui/Container'
import { Icon, type IconName } from '@/components/ui/Icon'

type Tone = 'success' | 'brand' | 'accent'
const toneClass: Record<Tone, string> = {
  success: 'bg-success-soft text-success',
  brand: 'bg-brand-soft text-brand',
  accent: 'bg-accent-soft text-accent',
}

const items: { icon: IconName; tone: Tone; text: string; time: string; unread?: boolean }[] = [
  { icon: 'circle-check', tone: 'success', text: 'Booking confirmed — Golden Triangle & Ranthambore Safari', time: '2 min ago', unread: true },
  { icon: 'message-circle', tone: 'brand', text: 'Heritage India Tours replied to your message', time: '1 hour ago', unread: true },
  { icon: 'trending-down', tone: 'accent', text: 'Price dropped ₹8,000 on Kerala Backwaters (saved)', time: '3 hours ago' },
  { icon: 'timer', tone: 'brand', text: 'Your trip departs in 21 days — complete check-in', time: '1 day ago' },
  { icon: 'star', tone: 'accent', text: 'How was your Goa trip? Leave a review', time: '2 days ago' },
]

export default function Notifications() {
  const [tab, setTab] = useState<'all' | 'unread'>('all')
  const shown = tab === 'all' ? items : items.filter((i) => i.unread)
  const unreadCount = items.filter((i) => i.unread).length

  return (
    <div className="bg-surface-page py-10">
      <Container className="max-w-[680px]">
        <div className="overflow-hidden rounded-lg border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h1 className="font-heading text-lg font-bold text-ink">Notifications</h1>
            <button className="text-[13px] font-medium text-brand hover:text-brand-dark">Mark all read</button>
          </div>

          <div className="flex gap-2 border-b border-line px-5 py-3">
            {(['all', 'unread'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={cn('rounded-full px-3 py-1.5 text-[13px] font-medium transition',
                  tab === t ? 'bg-brand-soft text-brand-dark' : 'text-ink-secondary hover:bg-surface-muted')}>
                {t === 'all' ? 'All' : `Unread · ${unreadCount}`}
              </button>
            ))}
          </div>

          <div className="flex flex-col">
            {shown.map((n, i) => (
              <div key={i} className={cn('flex items-center gap-3 border-b border-line px-5 py-3.5 last:border-0', n.unread && 'bg-brand-soft/40')}>
                <span className={cn('grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full', toneClass[n.tone])}>
                  <Icon name={n.icon} size={16} />
                </span>
                <div className="flex-1">
                  <p className={cn('text-sm leading-snug', n.unread ? 'font-semibold text-ink' : 'text-ink')}>{n.text}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">{n.time}</p>
                </div>
                {n.unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand" />}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  )
}
