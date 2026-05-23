import { Link, useSearchParams } from 'react-router-dom'
import { formatINR } from '@/lib/format'
import { useTrip } from '@/hooks/useTrips'
import { useOperator } from '@/hooks/useOperator'
import { useAuth } from '@/hooks/useAuth'
import { Icon, type IconName } from '@/components/ui/Icon'
import { IconBox } from '@/components/ui/IconBox'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { QRCode } from '@/components/ui/QRCode'

function Section({ title, icon, children }: { title: string; icon: IconName; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-white p-6">
      <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold text-ink">
        <Icon name={icon} size={19} className="text-brand" />
        {title}
      </h2>
      {children}
    </section>
  )
}

const facilities: { icon: IconName; label: string }[] = [
  { icon: 'utensils', label: 'Daily breakfast & select meals' },
  { icon: 'car', label: 'Private AC transport' },
  { icon: 'wifi', label: 'Wi-Fi at all stays' },
  { icon: 'badge-check', label: 'Licensed expert guide' },
  { icon: 'life-buoy', label: 'On-trip first-aid & support' },
  { icon: 'ticket', label: 'All permits & entry fees' },
]

const experiences: { icon: IconName; title: string; desc: string }[] = [
  { icon: 'flame', title: 'Bonfire night', desc: 'Evening bonfire with music under the stars' },
  { icon: 'music', title: 'Folk performance', desc: 'Local cultural folk music & dance' },
  { icon: 'gamepad-2', title: 'Group games', desc: 'Ice-breakers & fun group activities' },
  { icon: 'camera', title: 'Photo stops', desc: 'Curated scenic photography points' },
]

const knowBeforeYouGo = [
  'Carry a government-issued photo ID (Aadhaar / passport) for all travelers.',
  'Pack comfortable walking shoes and weather-appropriate clothing.',
  'Reach the meeting point at least 15 minutes before the start time.',
  'Keep this e-voucher handy — show the QR at check-in.',
]

function parseStay(stay: string) {
  const stars = (stay.match(/(\d)\s*★/) || [])[1]
  const isCamp = /camp|tent/i.test(stay)
  const name = stay.replace(/\s*\(.*?\)\s*/g, '').trim()
  return { name, stars: stars ? Number(stars) : isCamp ? 0 : 4, isCamp }
}

export default function BookingVoucher() {
  const [params] = useSearchParams()
  const { user } = useAuth()
  const { trip, loading } = useTrip(params.get('trip') ?? '')
  const { operator } = useOperator(trip?.operatorId)
  const pax = Math.max(1, Number(params.get('pax')) || 2)

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface-page">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-brand" />
      </div>
    )
  }
  if (!trip || trip.departures.length === 0) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface-page px-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <h1 className="font-heading text-xl font-bold text-ink">Booking not found</h1>
          <p className="text-sm text-ink-secondary">We couldn't load this booking's trip details.</p>
          <Link to="/dashboard" className="font-semibold text-brand">Go to your dashboard</Link>
        </div>
      </div>
    )
  }

  const dep = trip.departures.find((d) => d.id === params.get('dep')) ?? trip.departures[0]
  // Use the real booking reference passed from checkout; only fall back to a derived one.
  const reference = params.get('ref') || 'VYG-' + trip.id.slice(0, 3).toUpperCase() + dep.id.toUpperCase() + pax
  const from = params.get('from') || trip.departureCities[0] || ''
  const option = params.get('option') === 'land' ? 'land' : 'full'
  const unit = option === 'land' ? dep.price - trip.travelFare : dep.price
  const base = unit * pax
  const gst = Math.round(base * 0.05)
  const total = base + gst
  const boardTitle = option === 'land' ? 'Where to meet' : 'Where to board'
  const boardIcon: IconName = option === 'land' ? 'map-pinned' : 'plane-takeoff'
  const boardPoint =
    option === 'land' ? `${trip.destination} — arrival meeting point`
    : trip.transport === 'Flights' ? `${from} Airport — Departures`
    : trip.transport === 'Train' ? `${from} Railway Station`
    : `${from} — Volvo coach boarding point`
  const boardDesc =
    option === 'land'
      ? `Make your own way to ${trip.destination}; your Voyago host receives the group there on Day 1.`
      : `Your trip host meets the group at the ${from} departure point with a Voyago sign board, then travels with you to ${trip.destination} and back.`

  const stays = [...new Set(trip.itinerary.map((d) => d.stay).filter(Boolean))] as string[]
  const leadName = (user?.user_metadata?.full_name as string | undefined) || 'Lead traveler'
  const travelers = [`${leadName} (Lead)`, ...Array.from({ length: pax - 1 }, (_, i) => `Guest traveler ${i + 1}`)]

  return (
    <div className="min-h-screen bg-surface-page">
      {/* Top bar */}
      <header className="flex h-16 items-center justify-between border-b border-line bg-white px-5 sm:px-10">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-[30px] w-[30px] place-items-center rounded-sm bg-brand"><Icon name="compass" size={19} className="text-white" /></span>
            <span className="font-heading text-xl font-bold text-ink">Voyago</span>
          </Link>
          <span className="text-ink-muted">·</span>
          <span className="hidden font-heading text-lg font-bold text-ink sm:block">Booking details</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" iconLeft="download" className="hidden sm:inline-flex">Download</Button>
          <Button variant="secondary" size="sm" iconLeft="share-2" className="hidden sm:inline-flex">Share</Button>
          <Button to="/dashboard" size="sm" iconLeft="layout-dashboard">Dashboard</Button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1180px] flex-col gap-5 px-5 py-7 sm:px-10">
        {/* Confirmation banner */}
        <div className="flex flex-col items-start gap-4 rounded-lg border border-[#BCE7CF] bg-success-soft p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-success text-white"><Icon name="check" size={22} /></span>
            <div>
              <p className="font-heading text-lg font-bold text-ink">Booking confirmed!</p>
              <p className="text-sm text-ink-secondary">Your trip is booked. Save or download this voucher and show the QR at check-in.</p>
            </div>
          </div>
          <div className="rounded-md border border-[#BCE7CF] bg-white px-4 py-2 text-center">
            <p className="text-[11px] uppercase tracking-wide text-ink-muted">Booking ref</p>
            <p className="font-mono text-sm font-bold text-ink">{reference}</p>
          </div>
        </div>

        {/* Trip summary */}
        <div className="flex flex-col overflow-hidden rounded-lg border border-line bg-white sm:flex-row">
          <img src={trip.image} alt={trip.title} className="h-44 w-full object-cover sm:h-auto sm:w-[300px]" />
          <div className="flex flex-1 flex-col gap-3 p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="success" icon="circle-check">Confirmed</Badge>
              <Badge tone="brand" icon="badge-check">{operator?.name}</Badge>
            </div>
            <h1 className="font-heading text-2xl font-bold text-ink">{trip.title}</h1>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-secondary">
              <span className="inline-flex items-center gap-1.5"><Icon name="calendar-days" size={15} className="text-brand" /> {dep.date} → {dep.endDate}</span>
              {option === 'full' ? (
                <span className="inline-flex items-center gap-1.5"><Icon name={trip.transportIcon} size={15} className="text-brand" /> Round-trip {trip.transport.toLowerCase()} from {from}</span>
              ) : (
                <span className="inline-flex items-center gap-1.5"><Icon name="info" size={15} className="text-brand" /> Land only — own travel</span>
              )}
              <span className="inline-flex items-center gap-1.5"><Icon name="timer" size={15} className="text-brand" /> {trip.durationDays} days / {trip.nights} nights</span>
              <span className="inline-flex items-center gap-1.5"><Icon name="users" size={15} className="text-brand" /> {pax} travelers</span>
              <span className="inline-flex items-center gap-1.5"><Icon name="map-pin" size={15} className="text-brand" /> {trip.location}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 lg:flex-row">
          {/* Left */}
          <div className="flex flex-1 flex-col gap-5">
            {/* Meeting point */}
            <Section title={boardTitle} icon={boardIcon}>
              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-start gap-2.5">
                    <Icon name="navigation" size={16} className="mt-0.5 text-brand" />
                    <div>
                      <p className="text-sm font-semibold text-ink">{boardPoint}</p>
                      <p className="text-sm text-ink-secondary">{boardDesc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-ink-secondary">
                    <Icon name="timer" size={16} className="text-brand" /> Reporting time shared 24h before · Day 1 ({dep.date})
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-ink-secondary">
                    <Icon name="phone" size={16} className="text-brand" /> Trip host: +91 99887 76655
                  </div>
                </div>
                <div className="relative grid h-32 w-full place-items-center overflow-hidden rounded-md border border-line bg-brand-soft sm:w-48">
                  <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(#0e8c8433 1px,transparent 1px),linear-gradient(90deg,#0e8c8433 1px,transparent 1px)', backgroundSize: '18px 18px' }} />
                  <Icon name="map-pin" size={30} className="relative text-brand" />
                </div>
              </div>
            </Section>

            {/* Day by day */}
            <Section title="Your day-by-day plan" icon="route">
              <div className="flex flex-col">
                {trip.itinerary.map((day, idx) => (
                  <div key={day.day} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-soft font-heading text-sm font-bold text-brand">{day.day}</span>
                      {idx !== trip.itinerary.length - 1 && <span className="my-1 w-px flex-1 bg-line" />}
                    </div>
                    <div className="pb-6">
                      <p className="text-sm font-semibold text-ink">{day.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-ink-secondary">{day.description}</p>
                      <div className="mt-2 flex flex-wrap gap-4 text-[13px] text-ink-secondary">
                        {day.stay && <span className="inline-flex items-center gap-1.5"><Icon name="bed" size={14} className="text-brand" /> {day.stay}</span>}
                        {day.meals && day.meals.length > 0 && <span className="inline-flex items-center gap-1.5"><Icon name="utensils" size={14} className="text-brand" /> {day.meals.join(', ')}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Accommodation */}
            <Section title="Where you'll stay" icon="hotel">
              <div className="grid gap-3 sm:grid-cols-2">
                {stays.map((stay) => {
                  const { name, stars, isCamp } = parseStay(stay)
                  return (
                    <div key={stay} className="flex gap-3 rounded-md border border-line p-4">
                      <IconBox icon={isCamp ? 'tent' : 'hotel'} tone={isCamp ? 'accent' : 'brand'} size={40} iconSize={20} radius={10} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink">{name}</p>
                        <div className="mt-0.5 flex items-center gap-0.5">
                          {isCamp ? (
                            <span className="text-xs font-medium text-accent">Luxury tented camp</span>
                          ) : (
                            Array.from({ length: stars }, (_, i) => <Icon key={i} name="star" size={12} className="text-star" fill="currentColor" strokeWidth={1.5} />)
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {(isCamp ? ['Bonfire', 'Meals', 'Tents'] : ['Wi-Fi', 'Breakfast', 'AC']).map((a) => (
                            <span key={a} className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] text-ink-secondary">{a}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Section>

            {/* Facilities */}
            <Section title="Facilities provided" icon="sparkles">
              <div className="grid gap-3 sm:grid-cols-2">
                {facilities.map((f) => (
                  <div key={f.label} className="flex items-center gap-2.5 text-sm text-ink">
                    <Icon name={f.icon} size={17} className="shrink-0 text-brand" /> {f.label}
                  </div>
                ))}
              </div>
            </Section>

            {/* Experiences */}
            <Section title="Experiences included" icon="party-popper">
              <div className="grid gap-3 sm:grid-cols-2">
                {experiences.map((e) => (
                  <div key={e.title} className="flex gap-3 rounded-md border border-line bg-surface-muted p-4">
                    <IconBox icon={e.icon} tone="accent" size={40} iconSize={20} radius={10} />
                    <div>
                      <p className="text-sm font-semibold text-ink">{e.title}</p>
                      <p className="text-xs text-ink-secondary">{e.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Know before you go */}
            <Section title="Know before you go" icon="circle-alert">
              <div className="flex flex-col gap-2.5">
                {knowBeforeYouGo.map((k) => (
                  <div key={k} className="flex items-start gap-2.5 text-sm text-ink-secondary">
                    <Icon name="circle-check" size={16} className="mt-0.5 shrink-0 text-brand" /> {k}
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* Right rail */}
          <aside className="flex w-full flex-col gap-5 lg:w-[360px] lg:shrink-0">
            {/* E-ticket */}
            <div className="overflow-hidden rounded-lg border border-line bg-white">
              <div className="flex items-center justify-between bg-surface-inverse px-5 py-3.5">
                <span className="flex items-center gap-2 text-sm font-semibold text-white"><Icon name="ticket" size={16} /> Mobile e-ticket</span>
                <Icon name="qr-code" size={18} className="text-white/70" />
              </div>
              <div className="flex flex-col items-center gap-3 p-6">
                <div className="rounded-md border border-line p-2.5"><QRCode value={reference} size={140} /></div>
                <p className="font-mono text-sm font-bold text-ink">{reference}</p>
                <p className="text-center text-xs text-ink-muted">Show this QR code at the meeting point for check-in</p>
              </div>
            </div>

            {/* Payment summary */}
            <div className="rounded-lg border border-line bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-heading text-base font-bold text-ink">Payment summary</h3>
                <Badge tone="success" icon="circle-check">Paid</Badge>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between text-ink-secondary"><span>{formatINR(unit)} × {pax}</span><span className="text-ink">{formatINR(base)}</span></div>
                <div className="flex justify-between text-ink-secondary"><span>GST (5%)</span><span className="text-ink">{formatINR(gst)}</span></div>
                <div className="my-1 h-px bg-line" />
                <div className="flex justify-between font-semibold text-ink"><span>Total paid</span><span className="font-heading">{formatINR(total)}</span></div>
                <div className="mt-1 flex items-center gap-2 text-xs text-ink-muted"><Icon name="smartphone" size={13} /> Paid via UPI · Razorpay · {dep.date}</div>
              </div>
            </div>

            {/* Travelers */}
            <div className="rounded-lg border border-line bg-white p-5">
              <h3 className="mb-3 font-heading text-base font-bold text-ink">Travelers ({pax})</h3>
              <div className="flex flex-col gap-2.5">
                {travelers.map((t, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <Avatar initials={t.split(' ').map((w) => w[0]).slice(0, 2).join('')} size={32} />
                    <span className="text-sm text-ink">{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Organizer */}
            {operator && (
              <div className="rounded-lg border border-line bg-white p-5">
                <h3 className="mb-3 font-heading text-base font-bold text-ink">Your organizer</h3>
                <div className="flex items-center gap-3">
                  <Avatar initials={operator.initials} size={44} />
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">{operator.name} <Icon name="badge-check" size={14} className="text-brand" /></p>
                    <p className="text-xs text-ink-muted">Replies {operator.responseTime}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-col gap-2 text-sm text-ink-secondary">
                  <span className="flex items-center gap-2"><Icon name="phone" size={14} className="text-brand" /> +91 99887 76655</span>
                  <span className="flex items-center gap-2"><Icon name="mail" size={14} className="text-brand" /> hello@{operator.id}.in</span>
                </div>
                <Button to="/messages" variant="secondary" size="sm" fullWidth iconLeft="message-circle" className="mt-3">Message organizer</Button>
                <p className="mt-3 flex items-start gap-1.5 text-xs leading-snug text-ink-muted">
                  <Icon name="badge-check" size={13} className="mt-0.5 shrink-0 text-brand" />
                  {option === 'land' ? 'Your on-ground trip is' : 'Your round-trip travel & trip are'} operated by {operator.name}. Voyago handles payment & support.
                </p>
              </div>
            )}

            {/* Cancellation */}
            <div className="rounded-lg border border-line bg-white p-5">
              <h3 className="mb-2 font-heading text-base font-bold text-ink">Cancellation policy</h3>
              <div className="flex flex-col gap-1.5 text-[13px] text-ink-secondary">
                <span>• Free cancellation up to 15 days before departure</span>
                <span>• 50% refund up to 7 days before</span>
                <span>• No refund within 7 days of departure</span>
              </div>
              <Button variant="ghost" size="sm" className="mt-2 px-0 text-danger hover:bg-transparent">Cancel booking</Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
