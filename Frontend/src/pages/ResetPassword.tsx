import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { dashboardFor } from '@/lib/session'
import { useAuth } from '@/hooks/useAuth'

export default function ResetPassword() {
  const { updatePassword, session, role, loading } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (password !== confirm) return setError('Passwords do not match.')
    setSubmitting(true)
    const { error } = await updatePassword(password)
    setSubmitting(false)
    if (error) return setError(error)
    setDone(true)
  }

  const renderBody = () => {
    // Wait for Supabase to process the recovery link in the URL.
    if (loading) {
      return <p className="py-6 text-center text-sm text-ink-secondary">Verifying your reset link…</p>
    }

    // No session means the link is missing, already used, or expired.
    if (!session) {
      return (
        <div className="flex flex-col gap-4 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-danger-soft"><Icon name="circle-alert" size={26} className="text-danger" /></span>
          <h2 className="font-heading text-[22px] font-bold text-ink">Link expired or invalid</h2>
          <p className="text-sm leading-relaxed text-ink-secondary">This password reset link is no longer valid. Request a fresh one and try again.</p>
          <Link to="/forgot-password" className="mt-2 flex h-12 items-center justify-center rounded-sm bg-brand text-[15px] font-semibold text-white transition hover:bg-brand-dark">
            Request a new link
          </Link>
        </div>
      )
    }

    if (done) {
      return (
        <div className="flex flex-col gap-4 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-soft"><Icon name="circle-check" size={26} className="text-brand" /></span>
          <h2 className="font-heading text-[22px] font-bold text-ink">Password updated</h2>
          <p className="text-sm leading-relaxed text-ink-secondary">Your password has been changed. You're all set.</p>
          <Link to={role ? dashboardFor(role) : '/dashboard'} className="mt-2 flex h-12 items-center justify-center gap-2 rounded-sm bg-brand text-[15px] font-semibold text-white transition hover:bg-brand-dark">
            Continue <Icon name="arrow-right" size={17} />
          </Link>
        </div>
      )
    }

    return (
      <form onSubmit={submit} className="flex flex-col gap-5">
        <div>
          <h2 className="font-heading text-[24px] font-bold text-ink">Set a new password</h2>
          <p className="mt-1 text-sm text-ink-secondary">Choose a strong password you don't use elsewhere.</p>
        </div>
        <Input
          label="New password" icon="lock" type={showPw ? 'text' : 'password'} placeholder="••••••••••"
          value={password} onChange={(e) => setPassword(e.target.value)}
          trailing={
            <button type="button" onClick={() => setShowPw((s) => !s)} className="text-ink-muted hover:text-ink">
              <Icon name={showPw ? 'eye-off' : 'eye'} size={18} />
            </button>
          }
        />
        <Input
          label="Confirm new password" icon="lock" type={showPw ? 'text' : 'password'} placeholder="••••••••••"
          value={confirm} onChange={(e) => setConfirm(e.target.value)}
        />
        {error && (
          <p className="flex items-center gap-2 rounded-sm bg-danger-soft px-3 py-2.5 text-[13px] font-medium text-danger">
            <Icon name="circle-alert" size={15} className="shrink-0" /> {error}
          </p>
        )}
        <button
          type="submit" disabled={submitting || !password || !confirm}
          className="flex h-12 items-center justify-center gap-2 rounded-sm bg-brand text-[15px] font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
        >
          {submitting ? 'Updating…' : 'Update password'}
          {!submitting && <Icon name="arrow-right" size={17} />}
        </button>
      </form>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-muted p-6">
      <div className="w-full max-w-[420px] rounded-lg border border-line bg-white p-8 shadow-sm">
        <Link to="/" className="mb-7 flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-sm bg-brand"><Icon name="compass" size={20} className="text-white" /></span>
          <span className="font-heading text-xl font-bold text-ink">Voyago</span>
        </Link>
        {renderBody()}
      </div>
    </div>
  )
}
