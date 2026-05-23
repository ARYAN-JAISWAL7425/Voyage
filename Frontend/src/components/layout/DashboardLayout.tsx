import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useAuth } from '@/hooks/useAuth'
import { Icon, type IconName } from '@/components/ui/Icon'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'

interface NavItem { label: string; icon: IconName; to: string }

const travelerNav: NavItem[] = [
  { label: 'Overview', icon: 'layout-dashboard', to: '/dashboard' },
  { label: 'My bookings', icon: 'ticket', to: '/dashboard/bookings' },
  { label: 'Saved trips', icon: 'heart', to: '/saved' },
  { label: 'My reviews', icon: 'star', to: '/dashboard/reviews' },
  { label: 'Messages', icon: 'message-circle', to: '/messages' },
  { label: 'Payment methods', icon: 'credit-card', to: '/dashboard/payment-methods' },
  { label: 'Settings', icon: 'settings', to: '/dashboard/settings' },
]

const businessNav: NavItem[] = [
  { label: 'Overview', icon: 'layout-dashboard', to: '/business/dashboard' },
  { label: 'My trips', icon: 'map', to: '/business/trips' },
  { label: 'Bookings', icon: 'ticket', to: '/business/bookings' },
  { label: 'Availability', icon: 'calendar-days', to: '/business/availability' },
  { label: 'Reviews', icon: 'star', to: '/business/reviews' },
  { label: 'Earnings', icon: 'wallet', to: '/business/earnings' },
  { label: 'Promote', icon: 'megaphone', to: '/business/promote' },
  { label: 'Settings', icon: 'settings', to: '/business/settings' },
]

function initialsOf(name: string): string {
  return name.split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'U'
}

interface Props {
  variant: 'traveler' | 'business'
  title: string
  active: string
  children: ReactNode
}

export function DashboardLayout({ variant, title, active, children }: Props) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { user: authUser, signOut } = useAuth()
  const nav = variant === 'traveler' ? travelerNav : businessNav

  const displayName = (authUser?.user_metadata?.full_name as string | undefined) || authUser?.email || 'Guest'
  const user = { name: displayName, email: authUser?.email ?? 'Not signed in', initials: initialsOf(displayName) }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const Sidebar = (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-line p-5">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-[30px] w-[30px] place-items-center rounded-sm bg-brand"><Icon name="compass" size={19} className="text-white" /></span>
          <span className="font-heading text-[19px] font-bold text-ink">Voyago</span>
        </Link>
        <button onClick={() => setOpen(false)} className="text-ink-muted lg:hidden"><Icon name="x" size={20} /></button>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {nav.map((item) => {
          const isActive = item.label === active
          return (
            <Link
              key={item.label} to={item.to} onClick={() => setOpen(false)}
              className={cn('flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors',
                isActive ? 'bg-brand-soft font-semibold text-brand-dark' : 'text-ink-secondary hover:bg-surface-muted')}
            >
              <Icon name={item.icon} size={19} className={isActive ? 'text-brand' : ''} />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="flex items-center gap-3 border-t border-line p-4">
        <Avatar initials={user.initials} size={38} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
          <p className="truncate text-xs text-ink-muted">{user.email}</p>
        </div>
        <button onClick={handleSignOut} title="Sign out" className="text-ink-muted hover:text-ink"><Icon name="log-out" size={16} /></button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-surface-page">
      {/* Desktop sidebar */}
      <aside className="hidden w-[252px] shrink-0 border-r border-line lg:block">{Sidebar}</aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[252px] border-r border-line shadow-xl">{Sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-line bg-white px-5 py-3.5 sm:px-7">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="text-ink lg:hidden"><Icon name="menu" size={22} /></button>
            <h1 className="font-heading text-lg font-bold text-ink">{title}</h1>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="hidden items-center gap-2 rounded-sm border border-line-strong px-3 py-2 md:flex">
              <Icon name="search" size={16} className="text-ink-muted" />
              <input placeholder="Search…" className="w-40 bg-transparent text-sm outline-none placeholder:text-ink-muted" />
            </div>
            <Link to="/notifications" className="relative grid h-9 w-9 place-items-center rounded-sm border border-line-strong text-ink-secondary hover:text-ink">
              <Icon name="bell" size={18} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
            </Link>
            {variant === 'business' ? (
              <Button to="/business/trips/new" size="sm" iconLeft="plus">Create trip</Button>
            ) : (
              <Button to="/search" size="sm" iconLeft="search">Find trips</Button>
            )}
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-7">{children}</main>
      </div>
    </div>
  )
}
