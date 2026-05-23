import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { formatINR } from '@/lib/format'
import { createBooking } from '@/lib/api/bookings'
import { isRazorpayConfigured, startRazorpayPayment } from '@/lib/payments'
import { useAuth } from '@/hooks/useAuth'
import { useTrip } from '@/hooks/useTrips'
import { useOperator } from '@/hooks/useOperator'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'

const steps = ['Trip selected', 'Traveler details', 'Payment', 'Confirmation']

function Stepper() {
  return (
    <div className="flex items-center justify-center gap-2 overflow-x-auto px-4 py-5">
      {steps.map((label, i) => {
        const done = i < 2
        const active = i === 2
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-2.5">
              <span className={cn('grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full text-[13px] font-semibold',
                done || active ? 'bg-brand text-white' : 'border-[1.5px] border-line-strong bg-white text-ink-muted')}>
                {done ? <Icon name="check" size={15} /> : i + 1}
              </span>
              <span className={cn('hidden whitespace-nowrap text-sm sm:block', active ? 'font-semibold text-ink' : done ? 'font-medium text-ink' : 'text-ink-muted')}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && <span className={cn('h-0.5 w-8 rounded-full sm:w-16', i < 2 ? 'bg-brand' : 'bg-line')} />}
          </div>
        )
      })}
    </div>
  )
}

function SummaryRow({ label, value, strong, muted, accent }: { label: string; value: string; strong?: boolean; muted?: boolean; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={cn(muted ? 'text-ink-muted' : 'text-ink-secondary', strong && 'font-semibold text-ink')}>{label}</span>
      <span className={cn(strong ? 'font-semibold text-ink' : 'text-ink', accent && 'text-success')}>{value}</span>
    </div>
  )
}

function CheckoutHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-line bg-white px-5 sm:px-10">
      <Link to="/" className="flex items-center gap-2.5">
        <span className="grid h-[30px] w-[30px] place-items-center rounded-sm bg-brand"><Icon name="compass" size={19} className="text-white" /></span>
        <span className="font-heading text-xl font-bold text-ink">Voyago</span>
      </Link>
      <span className="hidden items-center gap-2 text-[13px] font-medium text-ink-secondary sm:flex">
        <Icon name="lock" size={15} className="text-success" /> Secure checkout · 256-bit SSL encrypted
      </span>
      <button className="flex items-center gap-1.5 text-[13px] font-medium text-ink"><Icon name="life-buoy" size={15} /> Need help?</button>
    </header>
  )
}

export default function Checkout() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  // Trip + departures load from Supabase, so their ids always match what the
  // create-order / verify-payment Edge Functions validate against — no more
  // "Trip or departure not found". (Mock data is only a fallback when offline.)
  const { trip, loading } = useTrip(params.get('trip') ?? '')
  const { operator } = useOperator(trip?.operatorId)

  const [gstOpen, setGstOpen] = useState(false)
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')

  const pax = Math.max(1, Number(params.get('pax')) || 2)
  const option = params.get('option') === 'land' ? 'land' : 'full'
  const fullName = (user?.user_metadata?.full_name as string | undefined) || ''
  const userEmail = user?.email || ''

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-page">
        <CheckoutHeader />
        <div className="grid place-items-center py-32">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-brand" />
        </div>
      </div>
    )
  }

  if (!trip || trip.departures.length === 0) {
    return (
      <div className="min-h-screen bg-surface-page">
        <CheckoutHeader />
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-28 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-surface-muted"><Icon name="map-pin" size={26} className="text-ink-muted" /></span>
          <h1 className="font-heading text-xl font-bold text-ink">{trip ? 'No departures available' : 'Trip not found'}</h1>
          <p className="text-sm text-ink-secondary">
            {trip
              ? 'This trip has no scheduled departures to book right now. Please check back later or pick another trip.'
              : "We couldn't find this trip — it may have been removed. Browse our other trips instead."}
          </p>
          <Link to="/search" className="mt-2 flex h-11 items-center justify-center gap-2 rounded-md bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-dark">
            <Icon name="search" size={16} /> Browse trips
          </Link>
        </div>
      </div>
    )
  }

  const dep = trip.departures.find((d) => d.id === params.get('dep')) ?? trip.departures[0]
  const from = params.get('from') || trip.departureCities[0] || ''

  const unit = option === 'land' ? dep.price - trip.travelFare : dep.price
  const base = unit * pax
  const savings = option === 'full' && trip.originalPrice ? (trip.originalPrice - trip.price) * pax : 0
  const gst = Math.round(base * 0.05)
  const total = base + gst

  const finalizeBooking = async () => {
    // Saves to Supabase when signed in; otherwise the voucher still shows from the URL.
    const { reference } = await createBooking({
      tripId: trip.id,
      departureId: dep.id,
      operatorId: trip.operatorId,
      travelerName: fullName || user?.email || 'Guest',
      fromCity: from,
      option,
      travelers: pax,
      amount: total,
    })
    navigate(`/voucher?trip=${trip.id}&dep=${dep.id}&pax=${pax}&from=${encodeURIComponent(from)}&option=${option}&ref=${reference}`)
  }

  const pay = async () => {
    if (paying) return
    setPayError('')
    setPaying(true)
    if (isRazorpayConfigured) {
      // Secure flow: create order → Razorpay modal → verify signature server-side → booking saved server-side.
      await startRazorpayPayment({
        draft: { tripId: trip.id, departureId: dep.id, option, pax, fromCity: from, travelerName: fullName || user?.email || 'Guest' },
        description: trip.title,
        prefill: { name: fullName, email: userEmail },
        onSuccess: (reference) => {
          navigate(`/voucher?trip=${trip.id}&dep=${dep.id}&pax=${pax}&from=${encodeURIComponent(from)}&option=${option}&ref=${reference}`)
        },
        onDismiss: () => setPaying(false),
        onError: (msg) => { setPaying(false); setPayError(msg) },
      })
    } else {
      // No Razorpay key configured → fall back to a direct (unpaid) booking.
      await finalizeBooking()
    }
  }

  return (
    <div className="min-h-screen bg-surface-page">
      <CheckoutHeader />

      <div className="border-b border-line bg-white"><Stepper /></div>

      <div className="mx-auto flex max-w-[1120px] flex-col gap-8 px-5 py-8 sm:px-10 lg:flex-row">
        {/* Left */}
        <div className="flex flex-1 flex-col gap-5">
          {/* Contact */}
          <section className="rounded-lg border border-line bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-ink">Contact details</h2>
              <span className="text-[13px] text-ink-muted">Voucher & updates sent here</span>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input label="Full name" icon="user" defaultValue={fullName} placeholder="Your full name" />
              <Input label="Email address" icon="mail" defaultValue={userEmail} placeholder="you@example.com" />
              <Input label="Mobile number" icon="smartphone" placeholder="+91 ..." />
              <Input label="Country" icon="globe" defaultValue="India" />
            </div>
          </section>

          {/* Travelers */}
          <section className="rounded-lg border border-line bg-white p-6">
            <h2 className="font-heading text-lg font-bold text-ink">Travelers ({pax})</h2>
            <div className="mt-4 flex flex-col gap-3">
              {Array.from({ length: pax }, (_, i) => (
                <div key={i} className="rounded-md border border-line bg-surface-muted p-4">
                  <p className="mb-3 text-sm font-semibold text-ink">{i === 0 ? 'Lead traveler' : `Traveler ${i + 1}`}</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Input placeholder="Full name (as per ID)" defaultValue={i === 0 ? fullName : ''} containerClassName="sm:col-span-2" />
                    <Input placeholder="Age" type="number" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-lg border border-line bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-ink">Payment</h2>
              <span className="flex items-center gap-1.5 text-[13px] font-medium text-success"><Icon name="shield-check" size={15} /> 100% secure</span>
            </div>

            {/* Secure-payment panel */}
            <div className="mt-4 overflow-hidden rounded-lg border border-line">
              <div className="flex items-start gap-3.5 bg-brand-soft p-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white shadow-sm">
                  <Icon name="lock" size={20} className="text-brand" />
                </span>
                <div>
                  <p className="text-[15px] font-semibold text-ink">Secure payment via Razorpay</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-ink-secondary">
                    Confirm your booking and a secure Razorpay window opens to finish paying. Your card details never touch Voyago's servers.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line bg-white px-4 py-3 text-xs font-medium text-ink-secondary">
                <span className="flex items-center gap-1.5"><Icon name="shield-check" size={14} className="text-success" /> PCI-DSS Level 1</span>
                <span className="flex items-center gap-1.5"><Icon name="lock" size={14} className="text-success" /> 256-bit SSL</span>
                <span className="flex items-center gap-1.5"><Icon name="check" size={14} className="text-success" /> Powered by Razorpay</span>
              </div>
            </div>

            {/* GST */}
            <div className="mt-4">
              <button onClick={() => setGstOpen((v) => !v)} className="flex items-center gap-2 text-sm font-medium text-brand">
                <Icon name={gstOpen ? 'minus' : 'plus'} size={15} /> Booking for a business? Add GSTIN for invoice
              </button>
              {gstOpen && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Input label="GSTIN" placeholder="22AAAAA0000A1Z5" />
                  <Input label="Registered business name" placeholder="Company Pvt Ltd" />
                </div>
              )}
            </div>
          </section>

          {/* Confirm */}
          <div className="flex flex-col gap-3">
            {payError && (
              <p className="flex items-center gap-2 rounded-sm bg-danger-soft px-3 py-2.5 text-sm font-medium text-danger">
                <Icon name="circle-alert" size={15} className="shrink-0" /> {payError}
              </p>
            )}
            <button onClick={pay} disabled={paying} className="flex h-[54px] items-center justify-center gap-2.5 rounded-md bg-brand text-base font-semibold text-white shadow-sm transition hover:bg-brand-dark hover:shadow-md disabled:opacity-60">
              <Icon name="lock" size={18} /> {paying ? 'Processing…' : `Pay ${formatINR(total)} securely`}
            </button>
            <p className="text-center text-xs leading-relaxed text-ink-muted">
              By confirming this booking you agree to Voyago's Terms of Service and the operator's cancellation policy.
              You won't be charged until the operator confirms availability.
            </p>
          </div>
        </div>

        {/* Summary */}
        <aside className="w-full lg:w-[380px] lg:shrink-0">
          <div className="overflow-hidden rounded-lg border border-line bg-white lg:sticky lg:top-6">
            <div className="flex gap-3 border-b border-line p-[18px]">
              <img src={trip.image} alt={trip.title} className="h-16 w-20 shrink-0 rounded-md object-cover" />
              <div className="min-w-0">
                <h3 className="line-clamp-2 text-sm font-semibold text-ink">{trip.title}</h3>
                <p className="mt-0.5 text-xs text-ink-secondary">{operator?.name}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 border-b border-line p-[18px]">
              <div className="flex items-center gap-2 text-[13px] text-ink-secondary"><Icon name="calendar-days" size={15} className="text-brand" /> {dep.date}{dep.endDate ? ` → ${dep.endDate}` : ''}</div>
              {option === 'full' ? (
                <div className="flex items-center gap-2 text-[13px] text-ink-secondary"><Icon name={trip.transportIcon} size={15} className="text-brand" /> Round-trip {trip.transport.toLowerCase()} from {from}</div>
              ) : (
                <div className="flex items-center gap-2 text-[13px] text-ink-secondary"><Icon name="info" size={15} className="text-brand" /> Land only — arrange your own travel</div>
              )}
              <div className="flex items-center gap-2 text-[13px] text-ink-secondary"><Icon name="users" size={15} className="text-brand" /> {pax} travelers</div>
              <div className="flex items-center gap-2 text-[13px] text-ink-secondary"><Icon name="map-pin" size={15} className="text-brand" /> {trip.location}</div>
            </div>

            <div className="flex flex-col gap-2.5 border-b border-line p-[18px]">
              <SummaryRow label={`${formatINR(unit)} × ${pax} travelers`} value={formatINR(base)} />
              {savings > 0 && <SummaryRow label="Discount" value={`− ${formatINR(savings)}`} accent />}
              <SummaryRow label="GST (5%)" value={formatINR(gst)} />
              <SummaryRow label="Convenience fee" value="Free" muted />
            </div>

            <div className="flex items-center justify-between p-[18px]">
              <span className="font-heading text-base font-bold text-ink">Total payable</span>
              <span className="font-heading text-xl font-bold text-ink">{formatINR(total)}</span>
            </div>

            {savings > 0 && (
              <div className="mx-[18px] mb-[18px] flex items-center gap-2 rounded-sm bg-success-soft px-3 py-2 text-[13px] font-medium text-success">
                <Icon name="tag" size={15} /> You save {formatINR(savings)} on this booking
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-col gap-2 px-1 text-[13px] text-ink-secondary">
            <span className="flex items-center gap-2"><Icon name="calendar-check" size={15} className="text-brand" /> Free cancellation up to 15 days before</span>
            <span className="flex items-center gap-2"><Icon name="headphones" size={15} className="text-brand" /> 24/7 traveler support</span>
          </div>
        </aside>
      </div>
    </div>
  )
}
