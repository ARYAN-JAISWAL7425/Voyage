import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Icon, type IconName } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { dashboardFor } from '@/lib/session'
import { useAuth } from '@/hooks/useAuth'

const brandImg = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1000&q=80'

const perks: { icon: IconName; text: string }[] = [
  { icon: 'luggage', text: '12,000+ verified trips at your fingertips' },
  { icon: 'shield-check', text: 'Secure payments & instant confirmation' },
  { icon: 'headphones', text: '24/7 traveler support before, during & after' },
]

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.6-11.3-8.4l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.6l6.3 5.2C41.4 35.6 44 30.3 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  )
}

export default function Auth() {
  const location = useLocation()
  const navigate = useNavigate()
  const { signUp, signIn, signInWithGoogle } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>(location.pathname === '/login' ? 'login' : 'signup')
  const [showPw, setShowPw] = useState(false)
  const [agree, setAgree] = useState(true)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isSignup = mode === 'signup'

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    if (isSignup) {
      const { error } = await signUp(email, password, fullName)
      setSubmitting(false)
      if (error) return setError(error)
      navigate('/get-started') // pick traveler vs operator
    } else {
      const { error, role } = await signIn(email, password)
      setSubmitting(false)
      if (error) return setError(error)
      navigate(role ? dashboardFor(role) : '/get-started')
    }
  }

  const onGoogle = async () => {
    setError('')
    const { error } = await signInWithGoogle()
    if (error) setError(error)
    // On success the browser redirects to Google, then back to /get-started.
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Brand panel */}
      <aside className="relative hidden w-[560px] shrink-0 flex-col justify-between overflow-hidden p-14 lg:flex">
        <img src={brandImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[#0A2230]/[0.72]" />
        <div className="relative flex flex-col gap-5">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-sm bg-brand"><Icon name="compass" size={20} className="text-white" /></span>
            <span className="font-heading text-[21px] font-bold text-white">Voyago</span>
          </Link>
          <h1 className="font-heading text-[38px] font-bold leading-tight text-white">Your next adventure starts here</h1>
          <div className="flex flex-col gap-3.5">
            {perks.map((p) => (
              <div key={p.text} className="flex items-center gap-3 text-white/90">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15"><Icon name={p.icon} size={18} /></span>
                <span className="text-[15px]">{p.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative rounded-lg bg-white/10 p-5 backdrop-blur">
          <p className="text-[14.5px] leading-relaxed text-white">
            “Voyago made planning our honeymoon effortless — everything booked in one afternoon.”
          </p>
          <div className="mt-3 flex items-center gap-2.5">
            <Avatar initials="AS" size={34} />
            <div>
              <p className="text-sm font-semibold text-white">Aarav Sharma</p>
              <p className="text-xs text-white/70">Honeymoon in Kerala</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <form onSubmit={submit} className="flex w-full max-w-[400px] flex-col gap-5">
          <Link to="/" className="flex items-center gap-2.5 lg:hidden">
            <span className="grid h-8 w-8 place-items-center rounded-sm bg-brand"><Icon name="compass" size={20} className="text-white" /></span>
            <span className="font-heading text-xl font-bold text-ink">Voyago</span>
          </Link>

          <div>
            <h2 className="font-heading text-[26px] font-bold text-ink">{isSignup ? 'Create your account' : 'Welcome back'}</h2>
            <p className="mt-1 text-sm text-ink-secondary">
              {isSignup ? 'Join Voyago to book and manage your trips' : 'Log in to continue your journey'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-line">
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m} type="button" onClick={() => setMode(m)}
                className={cn('flex-1 py-3 text-sm font-semibold transition-colors',
                  mode === m ? 'border-b-2 border-brand text-ink' : 'text-ink-muted hover:text-ink')}
              >
                {m === 'login' ? 'Log in' : 'Sign up'}
              </button>
            ))}
          </div>

          {/* Socials */}
          <div className="flex flex-col gap-2.5">
            <button type="button" onClick={onGoogle} className="flex h-[46px] items-center justify-center gap-2.5 rounded-sm border border-line-strong bg-white text-sm font-medium text-ink hover:bg-surface-muted">
              <GoogleMark /> Continue with Google
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="text-[12.5px] text-ink-muted">or {isSignup ? 'sign up' : 'log in'} with email</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <div className="flex flex-col gap-3.5">
            {isSignup && <Input label="Full name" icon="user" placeholder="Sarah Johnson" value={fullName} onChange={(e) => setFullName(e.target.value)} />}
            <Input label="Email address" icon="mail" type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input
              label="Password" icon="lock" type={showPw ? 'text' : 'password'} placeholder="••••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)}
              trailing={
                <button type="button" onClick={() => setShowPw((s) => !s)} className="text-ink-muted hover:text-ink">
                  <Icon name={showPw ? 'eye-off' : 'eye'} size={18} />
                </button>
              }
            />
          </div>

          {!isSignup && (
            <div className="flex items-center justify-between text-[13px]">
              <label className="flex items-center gap-2 text-ink-secondary">
                <input type="checkbox" className="h-4 w-4 accent-[#0E8C84]" defaultChecked /> Remember me
              </label>
              <Link to="/forgot-password" className="font-medium text-brand">Forgot password?</Link>
            </div>
          )}

          {isSignup && (
            <label className="flex items-start gap-2.5 text-[12.5px] leading-snug text-ink-secondary">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-[18px] w-[18px] accent-[#0E8C84]" />
              I agree to Voyago's <a href="#" className="text-brand">Terms of Service</a> and <a href="#" className="text-brand">Privacy Policy</a>.
            </label>
          )}

          {error && (
            <p className="flex items-center gap-2 rounded-sm bg-danger-soft px-3 py-2.5 text-[13px] font-medium text-danger">
              <Icon name="circle-alert" size={15} className="shrink-0" /> {error}
            </p>
          )}

          <button
            type="submit" disabled={submitting || (isSignup && !agree)}
            className="flex h-12 items-center justify-center gap-2 rounded-sm bg-brand text-[15px] font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
          >
            {submitting ? 'Please wait…' : isSignup ? 'Create account' : 'Log in'}
            {!submitting && <Icon name="arrow-right" size={17} />}
          </button>

          <p className="text-center text-[13.5px] text-ink-secondary">
            {isSignup ? 'Already have an account? ' : "Don't have an account? "}
            <button type="button" onClick={() => setMode(isSignup ? 'login' : 'signup')} className="font-semibold text-brand">
              {isSignup ? 'Log in' : 'Sign up'}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
