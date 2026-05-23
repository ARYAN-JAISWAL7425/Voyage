import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useAuth } from '@/hooks/useAuth'
import { Icon } from '@/components/ui/Icon'
import { IconBox } from '@/components/ui/IconBox'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'

const navItems = [
  { label: 'Explore', to: '/search' },
  { label: 'Destinations', to: '/destinations' },
  { label: 'Deals', to: '/deals' },
  { label: 'How it works', to: '/how-it-works' },
]

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <IconBox icon="compass" tone="inverse" size={30} iconSize={19} radius={8} />
      <span className="font-heading text-xl font-bold text-ink">Voyago</span>
    </Link>
  )
}

export function Header() {
  const [open, setOpen] = useState(false)
  const { user, role } = useAuth()
  const fullName = (user?.user_metadata?.full_name as string | undefined) || user?.email || ''
  const firstName = fullName.split(/[ @]/)[0]
  const initials = fullName.includes(' ')
    ? fullName.split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
    : fullName.slice(0, 2).toUpperCase() || 'U'
  const dashPath = role === 'operator' ? '/business/dashboard' : '/dashboard'

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
      <div className="flex h-[68px] items-center justify-between px-5 sm:px-10">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-7 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className="text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4 sm:gap-[18px]">
          {user ? (
            <>
              <Link
                to={dashPath}
                className="hidden items-center gap-2 rounded-full border border-line py-1 pl-1 pr-3 transition-colors hover:bg-surface-muted sm:flex"
              >
                <Avatar initials={initials} size={30} />
                <span className="text-sm font-medium text-ink">{firstName || 'Dashboard'}</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/business/register"
                className="hidden items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand-dark md:inline-flex"
              >
                <Icon name="store" size={16} />
                List your trips
              </Link>
              <Link to="/login" className="hidden text-sm font-medium text-ink transition-colors hover:text-brand sm:block">
                Log in
              </Link>
              <Button to="/signup" size="md" className="hidden sm:inline-flex">
                Sign up
              </Button>
            </>
          )}
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-sm border border-line text-ink lg:hidden"
          >
            <Icon name={open ? 'x' : 'menu'} size={20} />
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      <div className={cn('border-t border-line bg-white lg:hidden', open ? 'block' : 'hidden')}>
        <nav className="flex flex-col gap-1 px-5 py-3">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={() => setOpen(false)}
              className="rounded-sm px-3 py-2.5 text-sm font-medium text-ink-secondary hover:bg-surface-muted"
            >
              {item.label}
            </Link>
          ))}
          {!user && (
            <Link
              to="/business/register"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-sm px-3 py-2.5 text-sm font-semibold text-brand hover:bg-surface-muted"
            >
              <Icon name="store" size={16} />
              List your trips
            </Link>
          )}
          {user ? (
            <div className="mt-2 px-3 pb-2">
              <Button to={dashPath} fullWidth iconLeft="layout-dashboard" onClick={() => setOpen(false)}>
                {firstName ? `${firstName}'s dashboard` : 'My dashboard'}
              </Button>
            </div>
          ) : (
            <div className="mt-2 flex gap-3 px-3 pb-2">
              <Button to="/login" variant="secondary" fullWidth onClick={() => setOpen(false)}>
                Log in
              </Button>
              <Button to="/signup" fullWidth onClick={() => setOpen(false)}>
                Sign up
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
