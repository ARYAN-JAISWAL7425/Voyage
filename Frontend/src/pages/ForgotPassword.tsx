import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { error } = await resetPassword(email)
    setSubmitting(false)
    if (error) return setError(error)
    setSent(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-muted p-6">
      <div className="w-full max-w-[420px] rounded-lg border border-line bg-white p-8 shadow-sm">
        <Link to="/" className="mb-7 flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-sm bg-brand"><Icon name="compass" size={20} className="text-white" /></span>
          <span className="font-heading text-xl font-bold text-ink">Voyago</span>
        </Link>

        {sent ? (
          <div className="flex flex-col gap-4 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-soft"><Icon name="mail" size={26} className="text-brand" /></span>
            <h2 className="font-heading text-[22px] font-bold text-ink">Check your email</h2>
            <p className="text-sm leading-relaxed text-ink-secondary">
              We've sent a password reset link to <span className="font-semibold text-ink">{email}</span>. Open it and follow the link to set a new password.
            </p>
            <p className="text-[13px] text-ink-muted">
              Didn't get it? Check your spam folder, or{' '}
              <button type="button" onClick={() => setSent(false)} className="font-medium text-brand">try again</button>.
            </p>
            <Link to="/login" className="mt-2 text-sm font-semibold text-brand">Back to log in</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-5">
            <div>
              <h2 className="font-heading text-[24px] font-bold text-ink">Forgot password?</h2>
              <p className="mt-1 text-sm text-ink-secondary">Enter your email and we'll send you a link to reset it.</p>
            </div>
            <Input label="Email address" icon="mail" type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            {error && (
              <p className="flex items-center gap-2 rounded-sm bg-danger-soft px-3 py-2.5 text-[13px] font-medium text-danger">
                <Icon name="circle-alert" size={15} className="shrink-0" /> {error}
              </p>
            )}
            <button
              type="submit" disabled={submitting || !email}
              className="flex h-12 items-center justify-center gap-2 rounded-sm bg-brand text-[15px] font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
            >
              {submitting ? 'Sending…' : 'Send reset link'}
              {!submitting && <Icon name="arrow-right" size={17} />}
            </button>
            <Link to="/login" className="text-center text-[13.5px] font-medium text-brand">Back to log in</Link>
          </form>
        )}
      </div>
    </div>
  )
}
