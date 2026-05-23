import { useState, type FormEvent, type ReactNode } from 'react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center bg-surface-page p-6">
      <div className="w-full max-w-sm rounded-lg border border-line bg-white p-7 shadow-sm">{children}</div>
    </div>
  )
}

export default function Login() {
  const { email, isAdmin, signIn, signOut } = useAdminAuth()
  const [emailInput, setEmailInput] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Signed in, but this account is not an admin.
  if (email && !isAdmin) {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-danger-soft text-danger"><Icon name="shield-check" size={24} /></span>
          <h1 className="font-heading text-xl font-bold text-ink">Not an admin account</h1>
          <p className="text-sm text-ink-secondary"><span className="font-medium text-ink">{email}</span> doesn't have admin access. Ask a platform admin to grant your account the admin role, then sign in again.</p>
          <Button variant="secondary" iconLeft="log-out" onClick={signOut} className="mt-2">Sign out</Button>
        </div>
      </Shell>
    )
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const res = await signIn(emailInput.trim(), password)
    setSubmitting(false)
    if (res.error) setError(res.error)
    // On success the auth listener flips isAdmin and App swaps to the panel.
  }

  return (
    <Shell>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="grid h-11 w-11 place-items-center rounded-md bg-brand"><Icon name="compass" size={22} className="text-white" /></span>
          <h1 className="font-heading text-xl font-bold text-ink">Voyago Admin</h1>
          <p className="text-sm text-ink-secondary">Sign in to the platform console.</p>
        </div>
        {error && <div className="rounded-sm border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">{error}</div>}
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-ink-secondary">Email</span>
          <input type="email" required value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="you@example.com" className="rounded-sm border border-line-strong bg-white p-3 text-sm text-ink outline-none focus:border-brand placeholder:text-ink-muted" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-ink-secondary">Password</span>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="rounded-sm border border-line-strong bg-white p-3 text-sm text-ink outline-none focus:border-brand placeholder:text-ink-muted" />
        </label>
        <Button type="submit" fullWidth disabled={submitting} iconLeft="shield-check">{submitting ? 'Signing in…' : 'Sign in'}</Button>
      </form>
    </Shell>
  )
}
