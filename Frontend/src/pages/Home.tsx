import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon, type IconName } from '@/components/ui/Icon'
import { IconBox } from '@/components/ui/IconBox'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { TripCard } from '@/components/TripCard'
import { DestinationCard } from '@/components/DestinationCard'
import { CategoryCard } from '@/components/CategoryCard'
import { destinations } from '@/data/destinations'
import { categories } from '@/data/categories'
import { useTrips } from '@/hooks/useTrips'
import type { Trip } from '@/types'

const heroImg = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80'
const partnerImg = 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=900&q=80'

const FEATURED_IDS = ['goa-beaches', 'kerala-backwaters', 'rajasthan-royal', 'ladakh-himalayan']

const trustStats: { icon: IconName; value: string; label: string }[] = [
  { icon: 'luggage', value: '12,000+', label: 'Curated trips' },
  { icon: 'badge-check', value: '850+', label: 'Verified operators' },
  { icon: 'globe', value: '190', label: 'Destinations covered' },
  { icon: 'star', value: '4.9 / 5', label: 'Avg traveler rating' },
]

const trending = ['Goa', 'Kerala', 'Jaipur', 'Ladakh', 'Manali']

const TODAY = new Date().toISOString().slice(0, 10)

const steps: { icon: IconName; step: string; title: string; body: string }[] = [
  { icon: 'search', step: 'Step 1', title: 'Search & compare', body: 'Filter thousands of verified trips by destination, budget, duration and dates to find your perfect match.' },
  { icon: 'shield-check', step: 'Step 2', title: 'Book securely', body: 'Reserve your seats and pay safely online with buyer protection and instant booking confirmation.' },
  { icon: 'plane-takeoff', step: 'Step 3', title: 'Travel with confidence', body: 'Get your e-tickets and 24/7 support, then share reviews to help fellow travelers after your trip.' },
]

const partnerPoints = [
  'No listing fees — pay only a small commission per booking',
  'Verified operator badge builds instant traveler trust',
  'Powerful dashboard, seat management & weekly payouts',
]

export default function Home() {
  const { trips } = useTrips()
  const homeFeatured = useMemo(
    () => FEATURED_IDS.map((id) => trips.find((t) => t.id === id)).filter(Boolean) as Trip[],
    [trips],
  )

  const navigate = useNavigate()
  const departureCities = useMemo(() => [...new Set(trips.flatMap((t) => t.departureCities))].sort(), [trips])
  const [from, setFrom] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState('')
  const [travelers, setTravelers] = useState('2')

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const p = new URLSearchParams()
    if (from) p.set('from', from)
    if (destination.trim()) p.set('destination', destination.trim())
    if (date) p.set('date', date)
    if (travelers) p.set('travelers', travelers)
    const qs = p.toString()
    navigate(qs ? `/search?${qs}` : '/search')
  }

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative flex min-h-[560px] items-center justify-center overflow-hidden px-5 py-16 sm:px-10">
        <img src={heroImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[#082330]/70" />
        <div className="relative flex w-full max-w-[960px] flex-col items-center gap-7 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-[13px] font-medium text-white backdrop-blur">
            <Icon name="shield-check" size={15} />
            All operators verified · 100% secure booking
          </span>
          <div className="flex flex-col items-center gap-3.5">
            <h1 className="font-heading text-4xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-[52px]">
              Find and book extraordinary trips, worldwide
            </h1>
            <p className="max-w-[600px] text-base leading-relaxed text-white/90 sm:text-[17px]">
              Compare thousands of curated trip packages from verified operators and book securely in minutes.
            </p>
          </div>

          {/* Search bar */}
          <form onSubmit={onSearch} className="w-full max-w-[920px] rounded-lg bg-white p-2 shadow-2xl">
            <div className="flex flex-col items-stretch gap-1 md:flex-row md:items-center">
              {/* From */}
              <label className="flex flex-1 flex-col gap-1 px-4 py-2 text-left">
                <span className="text-xs font-semibold text-ink">From</span>
                <span className="flex items-center gap-2">
                  <Icon name="plane-takeoff" size={15} className="shrink-0 text-brand" />
                  <select value={from} onChange={(e) => setFrom(e.target.value)} className="w-full cursor-pointer bg-transparent text-sm text-ink outline-none">
                    <option value="">Your city</option>
                    {departureCities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </span>
              </label>
              <span className="hidden h-9 w-px bg-line md:block" />
              {/* Destination */}
              <label className="flex flex-1 flex-col gap-1 px-4 py-2 text-left">
                <span className="text-xs font-semibold text-ink">Destination</span>
                <span className="flex items-center gap-2">
                  <Icon name="map-pin" size={15} className="shrink-0 text-brand" />
                  <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Where to?" className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-secondary" />
                </span>
              </label>
              <span className="hidden h-9 w-px bg-line md:block" />
              {/* Travel dates */}
              <label className="flex flex-1 flex-col gap-1 px-4 py-2 text-left">
                <span className="text-xs font-semibold text-ink">Travel dates</span>
                <span className="flex items-center gap-2">
                  <Icon name="calendar" size={15} className="shrink-0 text-brand" />
                  <input type="date" value={date} min={TODAY} onChange={(e) => setDate(e.target.value)} className="w-full bg-transparent text-sm text-ink outline-none" />
                </span>
              </label>
              <span className="hidden h-9 w-px bg-line md:block" />
              {/* Travelers */}
              <label className="flex flex-1 flex-col gap-1 px-4 py-2 text-left">
                <span className="text-xs font-semibold text-ink">Travelers</span>
                <span className="flex items-center gap-2">
                  <Icon name="users" size={15} className="shrink-0 text-brand" />
                  <select value={travelers} onChange={(e) => setTravelers(e.target.value)} className="w-full cursor-pointer bg-transparent text-sm text-ink outline-none">
                    {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} {n === 1 ? 'adult' : 'adults'}</option>)}
                  </select>
                </span>
              </label>
              <Button type="submit" size="lg" iconLeft="search" className="h-[54px] shrink-0 md:w-auto">
                Search
              </Button>
            </div>
          </form>

          {/* Trending */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <span className="text-[13px] font-medium text-white/85">Trending:</span>
            {trending.map((t) => (
              <Link
                key={t}
                to={`/search?destination=${t}`}
                className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[13px] font-medium text-white transition hover:bg-white/20"
              >
                {t}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- Trust strip */}
      <section className="border-b border-line bg-white">
        <Container className="grid grid-cols-2 gap-y-6 py-6 lg:grid-cols-4">
          {trustStats.map((s, i) => (
            <div
              key={s.label}
              className={`flex items-center justify-center gap-3.5 ${i > 0 ? 'lg:border-l lg:border-line' : ''}`}
            >
              <IconBox icon={s.icon} tone="brand" size={46} iconSize={22} />
              <div className="flex flex-col">
                <span className="font-heading text-[22px] font-bold leading-tight text-ink">{s.value}</span>
                <span className="text-[13px] text-ink-secondary">{s.label}</span>
              </div>
            </div>
          ))}
        </Container>
      </section>

      {/* ----------------------------------------------- Popular destinations */}
      <section className="bg-surface-page py-14">
        <Container className="flex flex-col gap-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-3xl font-bold text-ink">Popular destinations</h2>
              <p className="mt-1.5 text-[15px] text-ink-secondary">
                Explore the most-booked places loved by Voyago travelers
              </p>
            </div>
            <Link to="/destinations" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark">
              View all destinations
              <Icon name="arrow-right" size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {destinations.slice(0, 6).map((d) => (
              <DestinationCard key={d.id} destination={d} />
            ))}
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------- Featured trips */}
      <section className="bg-white py-14">
        <Container className="flex flex-col gap-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col gap-2">
              <Badge tone="accent" icon="sparkles" className="w-fit">
                Promoted listings
              </Badge>
              <h2 className="font-heading text-3xl font-bold text-ink">Featured trips</h2>
              <p className="text-[15px] text-ink-secondary">Hand-picked packages from top-rated, verified operators</p>
            </div>
            <Link to="/search" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark">
              Browse all trips
              <Icon name="arrow-right" size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {homeFeatured.map((t) => t && <TripCard key={t.id} trip={t} />)}
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------- Categories */}
      <section className="bg-surface-page py-14">
        <Container className="flex flex-col gap-7">
          <div>
            <h2 className="font-heading text-3xl font-bold text-ink">Browse by travel style</h2>
            <p className="mt-1.5 text-[15px] text-ink-secondary">
              Whatever your pace, find a trip that matches how you love to travel
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {categories.map((c) => (
              <CategoryCard key={c.id} category={c} />
            ))}
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------ How it works */}
      <section id="how-it-works" className="bg-white py-16">
        <Container className="flex flex-col items-center gap-9">
          <div className="max-w-[640px] text-center">
            <h2 className="font-heading text-3xl font-bold text-ink">How Voyago works</h2>
            <p className="mt-2 text-[15px] text-ink-secondary">From discovery to departure in three simple steps</p>
          </div>
          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.step} className="flex flex-col gap-3.5 rounded-lg border border-line bg-surface-muted p-7">
                <div className="flex items-center gap-3.5">
                  <IconBox icon={s.icon} tone="inverse" size={52} iconSize={25} />
                  <span className="font-mono text-[13px] font-semibold text-brand">{s.step}</span>
                </div>
                <h3 className="font-heading text-[19px] font-semibold text-ink">{s.title}</h3>
                <p className="text-sm leading-relaxed text-ink-secondary">{s.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------ Partner CTA */}
      <section className="bg-surface-page py-14">
        <Container>
          <div className="flex flex-col items-center justify-between gap-12 overflow-hidden rounded-xl bg-surface-inverse p-8 sm:p-12 lg:flex-row">
            <div className="flex max-w-[560px] flex-col gap-5">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
                <Icon name="store" size={14} className="text-brand" />
                For travel businesses
              </span>
              <h2 className="font-heading text-3xl font-bold leading-tight text-white sm:text-[34px]">
                Grow your travel business with Voyago
              </h2>
              <p className="text-[15px] leading-relaxed text-[#C7D2D9]">
                Get verified, list your trip packages and reach thousands of travelers searching for their next adventure.
              </p>
              <div className="flex flex-col gap-3">
                {partnerPoints.map((p) => (
                  <div key={p} className="flex items-center gap-2.5">
                    <Icon name="circle-check" size={18} className="shrink-0 text-brand" />
                    <span className="text-sm text-[#E2E8EC]">{p}</span>
                  </div>
                ))}
              </div>
              <div className="mt-1 flex flex-wrap gap-3">
                <Button to="/business/register">List your trips free</Button>
                <Button to="/business/register" variant="outline-inverse">
                  How verification works
                </Button>
              </div>
            </div>
            <img
              src={partnerImg}
              alt="Travel operator"
              className="h-[260px] w-full rounded-lg object-cover lg:h-[300px] lg:w-[440px]"
            />
          </div>
        </Container>
      </section>
    </>
  )
}
