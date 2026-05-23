import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useAuth } from '@/hooks/useAuth'
import { becomeOperator } from '@/lib/api/operator'
import { Icon, type IconName } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const steps = [
  { n: 1, title: 'Business details', desc: 'Tell us about your company', icon: 'store' as IconName },
  { n: 2, title: 'Verification', desc: 'Upload documents', icon: 'file-check' as IconName },
  { n: 3, title: 'Payout details', desc: 'Where to send earnings', icon: 'wallet' as IconName },
  { n: 4, title: 'Review & submit', desc: 'Confirm and apply', icon: 'check-check' as IconName },
]

function UploadBox({ label, hint }: { label: string; hint: string }) {
  return (
    <div>
      <p className="mb-1.5 text-[13px] font-medium text-ink-secondary">{label}</p>
      <div className="flex cursor-pointer flex-col items-center gap-1.5 rounded-md border border-dashed border-line-strong bg-surface-muted py-7 text-center transition hover:border-brand hover:bg-brand-soft/40">
        <Icon name="upload" size={20} className="text-brand" />
        <span className="text-sm font-medium text-ink">Click to upload or drag & drop</span>
        <span className="text-xs text-ink-muted">{hint}</span>
      </div>
    </div>
  )
}

function Select({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="flex w-full flex-col gap-1.5">
      <span className="text-[13px] font-medium text-ink-secondary">{label}</span>
      <div className="relative">
        <select className="h-[46px] w-full appearance-none rounded-sm border border-line-strong bg-white px-3.5 pr-9 text-sm text-ink outline-none focus:border-brand">
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
        <Icon name="chevron-down" size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted" />
      </div>
    </label>
  )
}

export default function BusinessRegister() {
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()
  const [step, setStep] = useState(1)
  const [businessName, setBusinessName] = useState('')
  const [city, setCity] = useState('')
  const [about, setAbout] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const pct = Math.round((step / 4) * 100)

  const back = () => step > 1 && setStep(step - 1)
  const next = async () => {
    if (step < 4) {
      setStep(step + 1)
      return
    }
    setError('')
    setSubmitting(true)
    const { error } = await becomeOperator(businessName || 'My Travel Co', city, about)
    if (error) {
      setSubmitting(false)
      setError(error)
      return
    }
    await refreshProfile()
    navigate('/business/dashboard')
  }

  return (
    <div className="min-h-screen bg-surface-page">
      {/* Top bar */}
      <header className="flex h-16 items-center justify-between border-b border-line bg-white px-5 sm:px-10">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-[30px] w-[30px] place-items-center rounded-sm bg-brand"><Icon name="compass" size={19} className="text-white" /></span>
          <span className="font-heading text-xl font-bold text-ink">Voyago</span>
          <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand">Partners</span>
        </Link>
        <button className="flex items-center gap-1.5 text-[13px] font-medium text-ink"><Icon name="save" size={15} /> Save & exit</button>
      </header>

      {/* Progress */}
      <div className="border-b border-line bg-white px-5 py-6 sm:px-10">
        <div className="mx-auto max-w-[1120px]">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="font-heading text-xl font-bold text-ink">Become a Voyago partner</h1>
              <p className="mt-0.5 text-sm text-ink-secondary">List your trips and reach thousands of travelers</p>
            </div>
            <span className="text-[13px] font-medium text-brand">Step {step} of 4 · {pct}% complete</span>
          </div>
          <div className="mt-3.5 h-[7px] overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-brand transition-all duration-300" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1120px] flex-col gap-8 px-5 py-8 sm:px-10 lg:flex-row">
        {/* Side steps */}
        <aside className="flex w-full flex-col gap-5 lg:w-[300px] lg:shrink-0">
          <div className="rounded-lg border border-line bg-white p-2">
            {steps.map((s) => {
              const done = s.n < step
              const active = s.n === step
              return (
                <button key={s.n} onClick={() => setStep(s.n)} className={cn('flex w-full items-center gap-3 rounded-md p-3 text-left transition', active && 'bg-brand-soft')}>
                  <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-semibold',
                    done ? 'bg-brand text-white' : active ? 'bg-brand text-white' : 'border border-line-strong bg-white text-ink-muted')}>
                    {done ? <Icon name="check" size={15} /> : s.n}
                  </span>
                  <span>
                    <span className={cn('block text-sm font-semibold', active || done ? 'text-ink' : 'text-ink-secondary')}>{s.title}</span>
                    <span className="block text-xs text-ink-muted">{s.desc}</span>
                  </span>
                </button>
              )
            })}
          </div>
          <div className="rounded-lg bg-surface-inverse p-5 text-white">
            <Icon name="headphones" size={22} className="text-brand" />
            <h3 className="mt-2 font-heading text-base font-bold">Need a hand?</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-white/70">Our partner success team helps you get verified and live within 48 hours.</p>
            <a href="#" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">Contact partner team <Icon name="arrow-right" size={15} /></a>
          </div>
        </aside>

        {/* Main */}
        <div className="flex flex-1 flex-col gap-5">
          <div className="flex items-center gap-3.5 rounded-lg border border-[#F2C98C] bg-accent-soft p-4">
            <Icon name="shield-check" size={20} className="shrink-0 text-accent" />
            <p className="text-sm text-ink">Verification usually takes <span className="font-semibold">24–48 hours</span>. You can save your progress and finish later.</p>
          </div>

          <div className="rounded-lg border border-line bg-white p-6">
            {step === 1 && (
              <div className="flex flex-col gap-5">
                <h2 className="font-heading text-lg font-bold text-ink">Business details</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Registered business name" placeholder="Heritage India Tours Pvt Ltd" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                  <Select label="Business type" options={['Private Limited', 'Partnership / LLP', 'Proprietorship', 'Other']} />
                  <Input label="Year established" placeholder="2009" type="number" />
                  <Input label="Company website" icon="globe" placeholder="https://" />
                  <Input label="City" icon="map-pin" placeholder="Jaipur" value={city} onChange={(e) => setCity(e.target.value)} />
                  <Input label="Contact number" icon="phone" placeholder="+91" />
                </div>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-medium text-ink-secondary">About your business</span>
                  <textarea rows={4} value={about} onChange={(e) => setAbout(e.target.value)} placeholder="Tell travelers what makes your trips special…" className="rounded-sm border border-line-strong bg-white p-3.5 text-sm text-ink outline-none focus:border-brand placeholder:text-ink-muted" />
                </label>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-5">
                <h2 className="font-heading text-lg font-bold text-ink">Verification documents</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="GSTIN" placeholder="22AAAAA0000A1Z5" />
                  <Input label="PAN" placeholder="ABCDE1234F" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <UploadBox label="Business registration certificate" hint="PDF or JPG, max 5MB" />
                  <UploadBox label="GST certificate" hint="PDF or JPG, max 5MB" />
                  <UploadBox label="Owner's government ID" hint="Aadhaar / passport" />
                  <UploadBox label="Travel/tourism license (optional)" hint="If applicable" />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-5">
                <h2 className="font-heading text-lg font-bold text-ink">Payout details</h2>
                <p className="text-sm text-ink-secondary">Earnings are paid out weekly via Razorpay Route, minus the platform commission.</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Account holder name" placeholder="Heritage India Tours Pvt Ltd" />
                  <Input label="Bank account number" placeholder="0000 0000 0000" />
                  <Input label="IFSC code" placeholder="HDFC0001234" />
                  <Input label="UPI ID (optional)" placeholder="business@upi" />
                </div>
                <div className="flex items-center gap-3 rounded-md border border-line bg-surface-muted p-4 text-sm text-ink-secondary">
                  <Icon name="shield-check" size={18} className="text-brand" /> Bank details are encrypted and verified via a ₹1 test deposit.
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col gap-5">
                <h2 className="font-heading text-lg font-bold text-ink">Review & submit</h2>
                <div className="flex flex-col divide-y divide-line rounded-md border border-line">
                  {[
                    ['Business name', 'Heritage India Tours Pvt Ltd'],
                    ['Business type', 'Private Limited'],
                    ['GSTIN', '22AAAAA0000A1Z5'],
                    ['City', 'Jaipur, Rajasthan'],
                    ['Payout account', 'HDFC •••• 4321'],
                    ['Commission', '10% per booking'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between px-4 py-3 text-sm">
                      <span className="text-ink-secondary">{k}</span>
                      <span className="font-medium text-ink">{v}</span>
                    </div>
                  ))}
                </div>
                <label className="flex items-start gap-2.5 text-[13px] leading-snug text-ink-secondary">
                  <input type="checkbox" defaultChecked className="mt-0.5 h-[18px] w-[18px] accent-[#0E8C84]" />
                  I confirm the information is accurate and agree to Voyago's Partner Terms, commission structure and payout policy.
                </label>
              </div>
            )}
          </div>

          {error && (
            <p className="flex items-center gap-2 rounded-sm bg-danger-soft px-3 py-2.5 text-[13px] font-medium text-danger">
              <Icon name="circle-alert" size={15} className="shrink-0" /> {error}
            </p>
          )}
          <div className="flex items-center justify-between">
            <Button variant="secondary" iconLeft="arrow-left" onClick={back} disabled={step === 1}>Back</Button>
            <Button iconRight={step === 4 ? 'check' : 'arrow-right'} onClick={next} disabled={submitting}>
              {step === 4 ? (submitting ? 'Submitting…' : 'Submit application') : 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
