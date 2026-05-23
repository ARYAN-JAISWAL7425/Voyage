import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Avatar } from '@/components/ui/Avatar'
import { Icon } from '@/components/ui/Icon'

interface Msg { from: 'me' | 'them'; text: string; time: string }

const conversations = [
  { id: 'hi', initials: 'HI', name: 'Heritage India Tours', last: 'Great! Your safari slots are confirmed. 🎉', time: '2m', unread: 2, online: true },
  { id: 'ke', initials: 'KE', name: 'Kerala Escapes', last: 'Yes, the houseboat has AC bedrooms.', time: '1h', unread: 0, online: true },
  { id: 'ht', initials: 'HT', name: 'Himalayan Trails', last: 'We recommend the June departure.', time: '1d', unread: 0, online: false },
  { id: 'cg', initials: 'CG', name: 'Coastal Goa Tours', last: 'Thanks for booking with us!', time: '3d', unread: 0, online: false },
]

const initialThread: Msg[] = [
  { from: 'them', text: 'Hi Aarav! Thanks for your interest in the Golden Triangle & Ranthambore Safari.', time: '10:02' },
  { from: 'me', text: 'Hi! Are the Ranthambore safari slots guaranteed for the Sep 12 batch?', time: '10:05' },
  { from: 'them', text: 'Yes — two jeep safaris are included and pre-booked for your group.', time: '10:06' },
  { from: 'me', text: 'Perfect. And is the airport pickup included?', time: '10:08' },
  { from: 'them', text: 'Absolutely — our host will receive you at Delhi airport with a Voyago sign board.', time: '10:09' },
  { from: 'them', text: 'Great! Your safari slots are confirmed. 🎉', time: '10:10' },
]

export default function Messages() {
  const [active, setActive] = useState('hi')
  const [thread, setThread] = useState<Msg[]>(initialThread)
  const [draft, setDraft] = useState('')
  const convo = conversations.find((c) => c.id === active)!

  const send = () => {
    if (!draft.trim()) return
    setThread([...thread, { from: 'me', text: draft.trim(), time: 'now' }])
    setDraft('')
  }

  return (
    <DashboardLayout variant="traveler" title="Messages" active="Messages">
      <div className="flex h-[calc(100vh-150px)] min-h-[480px] overflow-hidden rounded-lg border border-line bg-white">
        {/* Conversation list */}
        <div className="hidden w-[300px] shrink-0 flex-col border-r border-line sm:flex">
          <div className="border-b border-line p-3.5">
            <div className="flex items-center gap-2 rounded-sm border border-line bg-surface-muted px-3 py-2">
              <Icon name="search" size={15} className="text-ink-muted" />
              <input placeholder="Search messages" className="w-full bg-transparent text-sm outline-none placeholder:text-ink-muted" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((c) => (
              <button key={c.id} onClick={() => setActive(c.id)}
                className={cn('flex w-full items-center gap-3 border-b border-line px-4 py-3.5 text-left transition', active === c.id ? 'bg-brand-soft' : 'hover:bg-surface-muted')}>
                <div className="relative">
                  <Avatar initials={c.initials} size={42} />
                  {c.online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-success" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-sm font-semibold text-ink">{c.name}</span>
                    <span className="text-xs text-ink-muted">{c.time}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13px] text-ink-secondary">{c.last}</span>
                    {c.unread > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[11px] font-semibold text-white">{c.unread}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Thread */}
        <div className="flex flex-1 flex-col bg-surface-page">
          <div className="flex items-center justify-between border-b border-line bg-white px-5 py-3">
            <div className="flex items-center gap-3">
              <Avatar initials={convo.initials} size={38} />
              <div>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">{convo.name} <Icon name="badge-check" size={14} className="text-brand" /></p>
                <p className="text-xs text-success">{convo.online ? 'Online now' : 'Offline'}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="grid h-9 w-9 place-items-center rounded-sm text-ink-secondary hover:bg-surface-muted"><Icon name="phone" size={17} /></button>
              <button className="grid h-9 w-9 place-items-center rounded-sm text-ink-secondary hover:bg-surface-muted"><Icon name="more-vertical" size={17} /></button>
            </div>
          </div>

          <Link to="/voucher" className="flex items-center gap-3 border-b border-line bg-brand-soft px-5 py-2.5 text-sm hover:bg-brand-soft/70">
            <Icon name="ticket" size={16} className="text-brand" />
            <span className="flex-1 text-ink">Golden Triangle & Ranthambore Safari · 12 Sep 2026</span>
            <span className="font-semibold text-brand">View booking</span>
          </Link>

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-5">
            {thread.map((m, i) => (
              <div key={i} className={cn('flex', m.from === 'me' ? 'justify-end' : 'justify-start')}>
                <div className={cn('max-w-[75%] rounded-2xl px-4 py-2.5 text-sm', m.from === 'me' ? 'rounded-br-md bg-brand text-white' : 'rounded-bl-md border border-line bg-white text-ink')}>
                  <p className="leading-relaxed">{m.text}</p>
                  <p className={cn('mt-1 text-[10px]', m.from === 'me' ? 'text-white/70' : 'text-ink-muted')}>{m.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 border-t border-line bg-white px-4 py-3">
            <button className="text-ink-muted hover:text-ink"><Icon name="paperclip" size={20} /></button>
            <input
              value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Type a message…"
              className="h-11 flex-1 rounded-full border border-line bg-surface-muted px-4 text-sm outline-none focus:border-brand placeholder:text-ink-muted"
            />
            <button onClick={send} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-white hover:bg-brand-dark"><Icon name="send" size={18} /></button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
