import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Icon, type IconName } from '@/components/ui/Icon'
import { dashboardFor, type Role } from '@/lib/session'
import { useAuth } from '@/hooks/useAuth'

const options: { id: Role; label: string; tagline: string; icon: IconName; points: string[]; cta: string; to: string }[] = [
  {
    id: 'traveler',
    label: "I'm a Traveler",
    tagline: 'Discover and book trips',
    icon: 'luggage',
    points: ['Browse curated trips from verified operators', 'Book securely & get instant e-tickets', 'Manage bookings, reviews & saved trips'],
    cta: 'Start exploring',
    to: '/dashboard',
  },
  {
    id: 'operator',
    label: "I'm an Operator",
    tagline: 'List trips & grow your travel business',
    icon: 'store',
    points: ['List trip packages & manage departures', 'Earn the verified-operator badge', 'Track bookings, earnings & payouts'],
    cta: 'Set up my business',
    to: '/business/register',
  },
]

export default function RoleSelect() {
  const navigate = useNavigate()
  const { setRole, role, loading } = useAuth()
  const [hover, setHover] = useState<Role | null>(null)

  // Returning users (e.g. via Google) already have a role → send them straight in.
  useEffect(() => {
    if (!loading && role) navigate(dashboardFor(role), { replace: true })
  }, [loading, role, navigate])

  const choose = async (id: Role, to: string) => {
    await setRole(id) // writes profiles.role
    navigate(to)
  }

  if (loading || role) {
    return <div className="grid min-h-screen place-items-center bg-surface-page text-sm text-ink-muted">Loading…</div>
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-page px-5 py-12">
      <Link to="/" className="mb-8 flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-md bg-brand"><Icon name="compass" size={20} className="text-white" /></span>
        <span className="font-heading text-2xl font-bold text-ink">Voyago</span>
      </Link>

      <div className="mb-8 max-w-[560px] text-center">
        <h1 className="font-heading text-3xl font-bold text-ink">How will you use Voyago?</h1>
        <p className="mt-2 text-[15px] text-ink-secondary">Pick how you'd like to start. You can always add the other later from your account.</p>
      </div>

      <div className="grid w-full max-w-[760px] gap-5 sm:grid-cols-2">
        {options.map((o) => {
          const active = hover === o.id
          return (
            <button
              key={o.id}
              type="button"
              onMouseEnter={() => setHover(o.id)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(o.id)}
              onBlur={() => setHover(null)}
              onClick={() => choose(o.id, o.to)}
              className={cn(
                'flex flex-col gap-4 rounded-xl border bg-white p-7 text-left transition',
                active ? 'border-brand shadow-lg ring-2 ring-brand/30' : 'border-line hover:border-brand hover:shadow-sm',
              )}
            >
              <span className={cn('grid h-14 w-14 place-items-center rounded-lg', active ? 'bg-brand text-white' : 'bg-brand-soft text-brand')}><Icon name={o.icon} size={26} /></span>
              <div>
                <h2 className="font-heading text-xl font-bold text-ink">{o.label}</h2>
                <p className="mt-0.5 text-sm text-ink-secondary">{o.tagline}</p>
              </div>
              <ul className="flex flex-col gap-2">
                {o.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-ink-secondary"><Icon name="circle-check" size={16} className="mt-0.5 shrink-0 text-success" /> {p}</li>
                ))}
              </ul>
              <span className={cn('mt-1 inline-flex items-center gap-1.5 text-sm font-semibold', active ? 'text-brand' : 'text-ink')}>
                {o.cta} <Icon name="arrow-right" size={16} />
              </span>
            </button>
          )
        })}
      </div>

      <p className="mt-8 text-[13px] text-ink-muted">Operators are reviewed by our team before their listings go live.</p>
    </div>
  )
}
