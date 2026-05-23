import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { formatINR } from '@/lib/format'
import { useTrip, useTrips } from '@/hooks/useTrips'
import { useOperator } from '@/hooks/useOperator'
import { useReviews } from '@/hooks/useReviews'
import { useSavedTrips } from '@/hooks/useSavedTrips'
import type { IconName } from '@/components/ui/Icon'
import { Icon } from '@/components/ui/Icon'
import { IconBox } from '@/components/ui/IconBox'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Rating } from '@/components/ui/Rating'
import { Container } from '@/components/ui/Container'
import { TripCard } from '@/components/TripCard'
import { ReviewModal } from '@/components/ReviewModal'

function Card({ title, icon, children, className }: { title?: string; icon?: IconName; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-lg border border-line bg-white p-6', className)}>
      {title && (
        <h2 className="mb-4 flex items-center gap-2 font-heading text-xl font-bold text-ink">
          {icon && <Icon name={icon} size={20} className="text-brand" />}
          {title}
        </h2>
      )}
      {children}
    </section>
  )
}

export default function TripDetail() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { trip, loading } = useTrip(id)
  const { operator } = useOperator(trip?.operatorId)
  const { reviews } = useReviews(id)
  const { trips: allTrips } = useTrips()

  const [openDay, setOpenDay] = useState(1)
  const [depId, setDepId] = useState(trip?.departures[0]?.id ?? '')
  const [pax, setPax] = useState(Math.max(1, Number(searchParams.get('travelers')) || 2))
  const [showReview, setShowReview] = useState(false)
  const { isSaved, toggleSaved } = useSavedTrips()
  const [fromCity, setFromCity] = useState(searchParams.get('from') ?? trip?.departureCities[0] ?? '')
  const [travelOption, setTravelOption] = useState<'full' | 'land'>('full')

  if (loading) {
    return (
      <Container className="py-16">
        <div className="h-7 w-72 animate-pulse rounded bg-surface-muted" />
        <div className="mt-4 h-[300px] w-full animate-pulse rounded-lg bg-surface-muted sm:h-[430px]" />
        <div className="mt-6 flex flex-col gap-6 lg:flex-row">
          <div className="h-80 flex-1 animate-pulse rounded-lg bg-surface-muted" />
          <div className="h-96 w-full animate-pulse rounded-lg bg-surface-muted lg:w-[362px]" />
        </div>
      </Container>
    )
  }

  if (!trip) {
    return (
      <Container className="py-24 text-center">
        <h1 className="font-heading text-2xl font-bold text-ink">Trip not found</h1>
        <Button to="/search" className="mt-4">Back to search</Button>
      </Container>
    )
  }

  const saved = isSaved(trip.id)
  const selectedDep = trip.departures.find((d) => d.id === depId) ?? trip.departures[0]
  const effectiveFrom = fromCity || trip.departureCities[0] || ''
  const maxPax = Math.min(trip.maxGroup, selectedDep.seatsLeft)
  const offersTravel = trip.travelIncluded !== false
  const travelByOperator = offersTravel && travelOption === 'full'
  const unitPrice = travelByOperator ? selectedDep.price : selectedDep.price - trip.travelFare
  const total = unitPrice * pax

  const facts: { icon: IconName; label: string; value: string }[] = [
    { icon: 'timer', label: 'Duration', value: `${trip.durationDays} days / ${trip.nights} nights` },
    { icon: 'users', label: 'Group size', value: `Max ${trip.maxGroup} travelers` },
    offersTravel
      ? { icon: trip.transportIcon, label: 'Round-trip travel', value: `${trip.transport} included` }
      : { icon: 'luggage', label: 'Package type', value: 'Land only · own travel' },
    { icon: 'route', label: 'Trip style', value: trip.category },
  ]

  const imgs = trip.gallery
  const thumbs = [imgs[1], imgs[2], imgs[3], imgs[1]]
  const related = allTrips.filter((t) => t.id !== trip.id && t.category === trip.category).slice(0, 3)
  const fallbackRelated = allTrips.filter((t) => t.id !== trip.id).slice(0, 3)
  const relatedTrips = related.length >= 3 ? related : fallbackRelated

  const avgRating = trip.rating
  const ratingDist = [70, 20, 7, 2, 1]

  const goCheckout = () => navigate(`/checkout?trip=${trip.id}&dep=${selectedDep.id}&pax=${pax}&from=${encodeURIComponent(effectiveFrom)}&option=${travelByOperator ? 'full' : 'land'}`)

  return (
    <div className="bg-surface-page pb-16">
      {/* Breadcrumb */}
      <Container className="flex flex-wrap items-center gap-2 py-3.5 text-[13px] text-ink-secondary">
        <Link to="/" className="hover:text-brand">Home</Link>
        <Icon name="chevron-right" size={14} className="text-ink-muted" />
        <Link to="/search" className="hover:text-brand">India</Link>
        <Icon name="chevron-right" size={14} className="text-ink-muted" />
        <Link to="/search" className="hover:text-brand">{trip.region}</Link>
        <Icon name="chevron-right" size={14} className="text-ink-muted" />
        <span className="text-ink">{trip.title}</span>
      </Container>

      {/* Title row */}
      <Container className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-[780px]">
          <div className="flex flex-wrap items-center gap-2">
            {trip.badge && <Badge tone={trip.badge.label === 'Featured' ? 'solid-accent' : 'accent'} icon={trip.badge.icon}>{trip.badge.label}</Badge>}
            <Badge tone="brand" icon="badge-check">Verified operator</Badge>
          </div>
          <h1 className="mt-2.5 font-heading text-3xl font-bold leading-tight text-ink">{trip.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-secondary">
            <Rating score={avgRating} count={trip.reviewCount} />
            <span className="inline-flex items-center gap-1.5"><Icon name="map-pin" size={15} className="text-brand" />{trip.location}</span>
            <span className="inline-flex items-center gap-1.5"><Icon name="timer" size={15} className="text-ink-muted" />{trip.durationDays} days</span>
            <span className="inline-flex items-center gap-1.5"><Icon name={trip.transportIcon} size={15} className="text-ink-muted" />{trip.transport}</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" iconLeft="share-2">Share</Button>
          <Button variant="secondary" size="sm" iconLeft="heart" onClick={() => toggleSaved(trip.id)} className={cn(saved && 'border-danger text-danger')}>
            {saved ? 'Saved' : 'Save'}
          </Button>
        </div>
      </Container>

      {/* Gallery */}
      <Container className="mt-4">
        <div className="grid h-[300px] grid-cols-2 gap-2 overflow-hidden rounded-lg sm:h-[430px] lg:grid-cols-4 lg:grid-rows-2">
          <div className="relative col-span-2 row-span-2 hidden lg:block">
            <img src={imgs[0]} alt={trip.title} className="h-full w-full object-cover" />
          </div>
          <img src={imgs[0]} alt="" className="col-span-2 row-span-2 h-full w-full object-cover lg:hidden" />
          {thumbs.map((src, i) => (
            <div key={i} className="relative hidden lg:block">
              <img src={src} alt="" className="h-full w-full object-cover" />
              {i === thumbs.length - 1 && (
                <button className="absolute inset-0 grid place-items-center bg-black/45 text-sm font-semibold text-white backdrop-blur-[1px]">
                  <span className="flex items-center gap-1.5"><Icon name="image" size={16} /> +18 photos</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </Container>

      {/* Body */}
      <Container className="mt-7 flex flex-col gap-8 lg:flex-row">
        {/* Left content */}
        <div className="flex flex-1 flex-col gap-6">
          {/* Quick facts */}
          <div className="grid grid-cols-2 gap-4 rounded-lg border border-line bg-white p-5 sm:grid-cols-4">
            {facts.map((f) => (
              <div key={f.label} className="flex items-center gap-3">
                <IconBox icon={f.icon} tone="brand" size={42} iconSize={20} radius={10} />
                <div className="min-w-0">
                  <p className="text-xs text-ink-muted">{f.label}</p>
                  <p className="truncate text-sm font-semibold text-ink">{f.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Overview */}
          <Card title="Trip overview" icon="compass">
            <p className="text-[15px] leading-relaxed text-ink-secondary">{trip.description}</p>
            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {trip.highlights.map((h) => (
                <div key={h} className="flex items-start gap-2.5">
                  <Icon name="circle-check" size={18} className="mt-0.5 shrink-0 text-brand" />
                  <span className="text-sm text-ink">{h}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Itinerary */}
          <Card title="Day-by-day itinerary" icon="map-pinned">
            <div className="flex flex-col">
              {trip.itinerary.map((day, idx) => {
                const open = openDay === day.day
                return (
                  <div key={day.day} className={cn('border-line', idx !== trip.itinerary.length - 1 && 'border-b')}>
                    <button onClick={() => setOpenDay(open ? -1 : day.day)} className="flex w-full items-center gap-3 py-4 text-left">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-soft font-heading text-sm font-bold text-brand">
                        {day.day}
                      </span>
                      <span className="flex-1 font-semibold text-ink">{day.title}</span>
                      <Icon name={open ? 'chevron-up' : 'chevron-down'} size={18} className="text-ink-muted" />
                    </button>
                    {open && (
                      <div className="pb-5 pl-12 pr-2">
                        <p className="text-sm leading-relaxed text-ink-secondary">{day.description}</p>
                        <div className="mt-3 flex flex-wrap gap-4 text-[13px]">
                          {day.stay && (
                            <span className="inline-flex items-center gap-1.5 text-ink-secondary">
                              <Icon name="bed" size={15} className="text-brand" /> {day.stay}
                            </span>
                          )}
                          {day.meals && day.meals.length > 0 && (
                            <span className="inline-flex items-center gap-1.5 text-ink-secondary">
                              <Icon name="utensils" size={15} className="text-brand" /> {day.meals.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Inclusions */}
          <Card title="What's included" icon="clipboard-list">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="mb-3 text-sm font-semibold text-success">Included</h3>
                <div className="flex flex-col gap-2.5">
                  {trip.included.map((i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm text-ink">
                      <Icon name="circle-check" size={17} className="mt-0.5 shrink-0 text-success" />{i}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-semibold text-danger">Not included</h3>
                <div className="flex flex-col gap-2.5">
                  {trip.excluded.map((i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm text-ink-secondary">
                      <Icon name="circle-x" size={17} className="mt-0.5 shrink-0 text-danger" />{i}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Operator */}
          {operator && (
            <Card title="About the operator" icon="store">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <Avatar initials={operator.initials} size={56} className="text-lg" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading text-lg font-bold text-ink">{operator.name}</h3>
                    {operator.verified && <Badge tone="brand" icon="badge-check">Verified</Badge>}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-secondary">
                    <Rating score={operator.rating} count={operator.reviewCount} />
                    <span className="inline-flex items-center gap-1"><Icon name="luggage" size={14} className="text-ink-muted" />{operator.tripsCount} trips</span>
                    <span className="inline-flex items-center gap-1"><Icon name="calendar" size={14} className="text-ink-muted" />Since {operator.since}</span>
                    <span className="inline-flex items-center gap-1"><Icon name="message-circle" size={14} className="text-ink-muted" />Replies {operator.responseTime}</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink-secondary">{operator.about}</p>
                  <Button to="/messages" variant="secondary" size="sm" iconLeft="message-circle" className="mt-4">Message operator</Button>
                </div>
              </div>
            </Card>
          )}

          {/* Reviews */}
          <Card title={`Reviews (${trip.reviewCount})`} icon="star">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="flex flex-col items-center justify-center rounded-lg bg-surface-muted px-8 py-5">
                <span className="font-heading text-4xl font-bold text-ink">{avgRating.toFixed(1)}</span>
                <div className="mt-1 flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Icon key={i} name="star" size={15} className={i < Math.round(avgRating) ? 'text-star' : 'text-line-strong'} fill="currentColor" strokeWidth={1.5} />
                  ))}
                </div>
                <span className="mt-1 text-xs text-ink-muted">{trip.reviewCount} reviews</span>
              </div>
              <div className="flex-1 space-y-1.5">
                {ratingDist.map((pct, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-ink-secondary">
                    <span className="w-3">{5 - i}</span>
                    <Icon name="star" size={11} className="text-star" fill="currentColor" strokeWidth={1.5} />
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                      <span className="block h-full rounded-full bg-star" style={{ width: `${pct}%` }} />
                    </span>
                    <span className="w-8 text-right">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col divide-y divide-line">
              {reviews.map((r) => (
                <div key={r.id} className="py-5 first:pt-0">
                  <div className="flex items-center gap-3">
                    <Avatar initials={r.initials} size={40} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-ink">{r.author}</p>
                      <p className="text-xs text-ink-muted">{r.date}</p>
                    </div>
                    <div className="flex">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Icon key={i} name="star" size={13} className={i < r.rating ? 'text-star' : 'text-line-strong'} fill="currentColor" strokeWidth={1.5} />
                      ))}
                    </div>
                  </div>
                  <h4 className="mt-3 text-sm font-semibold text-ink">{r.title}</h4>
                  <p className="mt-1 text-sm leading-relaxed text-ink-secondary">{r.body}</p>
                  <button className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-ink-secondary hover:text-brand">
                    <Icon name="thumbs-up" size={14} /> Helpful ({r.helpful})
                  </button>
                </div>
              ))}
            </div>
            <Button variant="secondary" iconLeft="pencil" className="mt-2" onClick={() => setShowReview(true)}>Write a review</Button>
          </Card>
        </div>

        {/* Booking card */}
        <aside className="w-full lg:w-[362px] lg:shrink-0">
          <div className="lg:sticky lg:top-[88px]">
            <div className="overflow-hidden rounded-lg border border-line bg-white shadow-lg">
              <div className="flex flex-col gap-4 p-5">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-xs text-ink-muted">From</span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-heading text-3xl font-bold text-ink">{formatINR(unitPrice)}</span>
                      <span className="text-sm text-ink-secondary">/ person</span>
                    </div>
                    {trip.originalPrice && travelByOperator && <span className="text-sm text-ink-muted line-through">{formatINR(trip.originalPrice)}</span>}
                  </div>
                  <Badge tone={selectedDep.seatsLeft <= 5 ? 'danger' : 'success'} icon="armchair">{selectedDep.seatsLeft} left</Badge>
                </div>

                <div className="h-px bg-line" />

                {/* Travel option (only if operator offers round-trip travel) */}
                {offersTravel && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-ink">Travel option</p>
                  <div className="flex flex-col gap-2">
                    {([
                      { id: 'full', title: 'Full package', desc: `Round-trip ${trip.transport.toLowerCase()} from your city`, price: selectedDep.price },
                      { id: 'land', title: 'Land only — join at destination', desc: 'Arrange your own travel', price: selectedDep.price - trip.travelFare },
                    ] as const).map((o) => {
                      const active = travelOption === o.id
                      return (
                        <button key={o.id} onClick={() => setTravelOption(o.id)}
                          className={cn('flex items-start gap-2.5 rounded-md border p-3 text-left transition',
                            active ? 'border-brand bg-brand-soft' : 'border-line hover:border-line-strong')}>
                          <span className={cn('mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border-[1.5px]', active ? 'border-brand' : 'border-line-strong')}>
                            {active && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}
                          </span>
                          <span className="flex-1">
                            <span className="flex items-center justify-between gap-2">
                              <span className="text-sm font-semibold text-ink">{o.title}</span>
                              <span className="text-sm font-semibold text-ink">{formatINR(o.price)}</span>
                            </span>
                            <span className="block text-xs text-ink-muted">{o.desc}</span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
                )}

                {/* Departure city (only when travel is included) */}
                {travelByOperator ? (
                  <div>
                    <p className="mb-2 text-sm font-semibold text-ink">Departing from</p>
                    <div className="relative">
                      <select
                        value={effectiveFrom}
                        onChange={(e) => setFromCity(e.target.value)}
                        className="h-11 w-full appearance-none rounded-md border border-line-strong bg-white pl-10 pr-9 text-sm font-medium text-ink outline-none focus:border-brand"
                      >
                        {trip.departureCities.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <Icon name="plane-takeoff" size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand" />
                      <Icon name="chevron-down" size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                    </div>
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-secondary">
                      <Icon name="circle-check" size={13} className="shrink-0 text-success" /> Round-trip {trip.transport.toLowerCase()} from {effectiveFrom} included
                    </p>
                  </div>
                ) : (
                  <p className="flex items-start gap-1.5 rounded-md bg-surface-muted p-3 text-xs text-ink-secondary">
                    <Icon name="info" size={14} className="mt-0.5 shrink-0 text-brand" /> You'll arrange your own travel to {trip.destination} and meet the group there on Day 1.
                  </p>
                )}

                {/* Departures */}
                <div>
                  <p className="mb-2 text-sm font-semibold text-ink">Select departure</p>
                  <div className="flex flex-col gap-2">
                    {trip.departures.map((d) => {
                      const active = d.id === selectedDep.id
                      return (
                        <button key={d.id} onClick={() => { setDepId(d.id); setPax((p) => Math.min(p, Math.min(trip.maxGroup, d.seatsLeft))) }}
                          className={cn('flex items-center justify-between rounded-md border p-3 text-left transition',
                            active ? 'border-brand bg-brand-soft' : 'border-line hover:border-line-strong')}>
                          <div>
                            <p className="text-sm font-semibold text-ink">{d.date}</p>
                            <p className="text-xs text-ink-muted">to {d.endDate}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-ink">{formatINR(travelByOperator ? d.price : d.price - trip.travelFare)}</p>
                            <p className={cn('text-xs', d.seatsLeft <= 5 ? 'text-accent' : 'text-success')}>{d.seatsLeft} seats</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Travelers */}
                <div>
                  <p className="mb-2 text-sm font-semibold text-ink">Travelers</p>
                  <div className="flex items-center justify-between rounded-md border border-line p-2">
                    <span className="pl-2 text-sm text-ink-secondary">{pax} {pax === 1 ? 'traveler' : 'travelers'}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setPax((p) => Math.max(1, p - 1))} className="grid h-8 w-8 place-items-center rounded-sm border border-line-strong text-ink disabled:opacity-40" disabled={pax <= 1}>
                        <Icon name="minus" size={15} />
                      </button>
                      <button onClick={() => setPax((p) => Math.min(maxPax, p + 1))} className="grid h-8 w-8 place-items-center rounded-sm border border-line-strong text-ink disabled:opacity-40" disabled={pax >= maxPax}>
                        <Icon name="plus" size={15} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between rounded-md bg-surface-muted px-3.5 py-3">
                  <div className="text-sm text-ink-secondary">
                    {formatINR(unitPrice)} × {pax}
                  </div>
                  <div className="font-heading text-lg font-bold text-ink">{formatINR(total)}</div>
                </div>

                <Button fullWidth iconRight="arrow-right" onClick={goCheckout} disabled={selectedDep.seatsLeft <= 0}>{selectedDep.seatsLeft <= 0 ? 'Sold out' : 'Book now'}</Button>
                <Button fullWidth variant="secondary" iconLeft="heart" onClick={() => toggleSaved(trip.id)}>{saved ? 'Saved' : 'Save trip'}</Button>

                <div className="flex flex-col gap-2 pt-1 text-[13px] text-ink-secondary">
                  <span className="inline-flex items-center gap-2"><Icon name="shield-check" size={15} className="text-brand" /> Secure payment via Razorpay</span>
                  <span className="inline-flex items-center gap-2"><Icon name="calendar-check" size={15} className="text-brand" /> Free cancellation up to 15 days before</span>
                  <span className="inline-flex items-center gap-2"><Icon name="headphones" size={15} className="text-brand" /> 24/7 traveler support</span>
                </div>

                {operator && (
                  <div className="flex items-start gap-2 rounded-md bg-brand-soft/60 p-2.5 text-xs leading-snug text-ink-secondary">
                    <Icon name="badge-check" size={14} className="mt-0.5 shrink-0 text-brand" />
                    <span>{travelByOperator ? 'Travel & trip' : 'Trip'} arranged &amp; operated by <span className="font-semibold text-ink">{operator.name}</span>. Voyago handles secure payment &amp; support.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>
      </Container>

      {/* Related */}
      <Container className="mt-12">
        <h2 className="mb-5 font-heading text-2xl font-bold text-ink">You might also like</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {relatedTrips.map((t) => <TripCard key={t.id} trip={t} />)}
        </div>
      </Container>

      <ReviewModal open={showReview} onClose={() => setShowReview(false)} tripTitle={trip.title} tripImage={trip.image} operatorName={operator?.name} />
    </div>
  )
}
