import { useState, type ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { Icon, type IconName } from '@/components/ui/Icon'

interface NavItem { label: string; icon: IconName; to: string; badge?: number }

const nav: NavItem[] = [
  { label: 'Overview', icon: 'layout-dashboard', to: '/' },
  { label: 'Operators', icon: 'badge-check', to: '/operators', badge: 3 },
  { label: 'Listings', icon: 'map', to: '/listings', badge: 2 },
  { label: 'Bookings', icon: 'ticket', to: '/bookings' },
  { label: 'Payments', icon: 'wallet', to: '/payments' },
  { label: 'Disputes', icon: 'life-buoy', to: '/disputes', badge: 2 },
  { label: 'Users', icon: 'users', to: '/users' },
]

export function AdminLayout({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const { email, signOut } = useAdminAuth()
  const initials = (email ?? 'AD').split('@')[0].slice(0, 2).toUpperCase() || 'AD'

  const Sidebar = (
    <div className="flex h-full flex-col bg-surface-inverse text-white">
      <div className="flex items-center justify-between border-b border-white/10 p-5">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-brand"><Icon name="compass" size={18} className="text-white" /></span>
          <span className="font-heading text-[19px] font-bold">Voyago</span>
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/90">Admin</span>
        </Link>
        <button onClick={() => setOpen(false)} className="text-white/60 lg:hidden"><Icon name="x" size={20} /></button>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {nav.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.to === '/'}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center justify-between gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors',
                isActive ? 'bg-brand font-semibold text-white' : 'text-white/70 hover:bg-white/10 hover:text-white',
              )
            }
          >
            <span className="flex items-center gap-3"><Icon name={item.icon} size={19} /> {item.label}</span>
            {item.badge ? (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-white">{item.badge}</span>
            ) : null}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-3 border-t border-white/10 p-4">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15"><Icon name="shield-check" size={18} /></span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">Platform Admin</p>
          <p className="truncate text-xs text-white/50">{email ?? '—'}</p>
        </div>
        <button onClick={signOut} className="text-white/50 hover:text-white" title="Sign out"><Icon name="log-out" size={16} /></button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-surface-page">
      {/* Desktop sidebar */}
      <aside className="hidden w-[252px] shrink-0 lg:block">{Sidebar}</aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[252px] shadow-xl">{Sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-line bg-white px-5 py-3.5 sm:px-7">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="text-ink lg:hidden"><Icon name="menu" size={22} /></button>
            <h1 className="font-heading text-lg font-bold text-ink">{title}</h1>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="hidden items-center gap-2 rounded-sm border border-line-strong px-3 py-2 md:flex">
              <Icon name="search" size={16} className="text-ink-muted" />
              <input placeholder="Search…" className="w-44 bg-transparent text-sm outline-none placeholder:text-ink-muted" />
            </div>
            <button className="relative grid h-9 w-9 place-items-center rounded-sm border border-line-strong text-ink-secondary hover:text-ink">
              <Icon name="bell" size={18} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
            </button>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-soft text-sm font-semibold text-brand">{initials}</span>
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-7">{children}</main>
      </div>
    </div>
  )
}
