import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { formatINR } from '@/lib/format'
import { useDebounce } from '@/hooks/useDebounce'
import { useTrips } from '@/hooks/useTrips'
import { categories } from '@/data/categories'
import { Icon } from '@/components/ui/Icon'
import { Container } from '@/components/ui/Container'
import { TripCard } from '@/components/TripCard'

const durationBuckets = [
  { id: '1-4', label: '1–4 days', test: (d: number) => d <= 4 },
  { id: '5-6', label: '5–6 days', test: (d: number) => d >= 5 && d <= 6 },
  { id: '7-8', label: '7–8 days', test: (d: number) => d >= 7 && d <= 8 },
  { id: '9+', label: '9+ days', test: (d: number) => d >= 9 },
]
const transportOptions = ['Flights', 'Train', 'Volvo coach', 'Land only']
const ratingOptions = [4.8, 4.5, 4.0]
const PRICE_MAX = 250000
const PAGE_SIZE = 6
const TODAY = new Date().toISOString().slice(0, 10)

/** "2026-06-14" → "14 Jun 2026" (falls back to the raw string). */
function prettyDate(iso: string): string {
  const d = new Date(iso)
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** A departure date string ("14 Jun 2026") → "2026-06-14" for comparison, or null if unparseable. */
function depDayISO(dateStr: string): string | null {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function CheckRow({ label, count, checked, onChange }: { label: string; count: number; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between py-1 group">
      <span className="flex items-center gap-2.5">
        <span
          className={cn(
            'grid h-[18px] w-[18px] place-items-center rounded-[5px] border transition',
            checked ? 'border-brand bg-brand text-white' : 'border-line-strong bg-white group-hover:border-brand',
          )}
        >
          {checked && <Icon name="check" size={12} strokeWidth={3} />}
        </span>
        <span className="text-sm text-ink">{label}</span>
      </span>
      <span className="text-xs text-ink-muted">{count}</span>
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
    </label>
  )
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-line p-[18px]">
      <h4 className="mb-3 text-sm font-semibold text-ink">{title}</h4>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  )
}

export default function Search() {
  const [params] = useSearchParams()
  const initialDestination = params.get('destination') ?? ''
  const initialCategory = params.get('category')

  const [origin, setOrigin] = useState(params.get('from') ?? '')
  const [destination, setDestination] = useState(initialDestination)
  const [date, setDate] = useState(params.get('date') ?? '')
  const [travelers, setTravelers] = useState(params.get('travelers') ?? '')
  const [selectedCats, setSelectedCats] = useState<string[]>(initialCategory ? [initialCategory] : [])
  const [selectedDurations, setSelectedDurations] = useState<string[]>([])
  const [selectedTransport, setSelectedTransport] = useState<string[]>([])
  const [minRating, setMinRating] = useState<number | null>(null)
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX)
  const [sort, setSort] = useState('recommended')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const debouncedDestination = useDebounce(destination, 250)

  const { trips, loading } = useTrips()
  const departureCities = useMemo(() => [...new Set(trips.flatMap((t) => t.departureCities))].sort(), [trips])

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
    setPage(1)
  }

  const countBy = useMemo(() => {
    const cat: Record<string, number> = {}
    const trans: Record<string, number> = {}
    const dur: Record<string, number> = {}
    const city: Record<string, number> = {}
    for (const t of trips) {
      cat[t.category] = (cat[t.category] ?? 0) + 1
      trans[t.transport] = (trans[t.transport] ?? 0) + 1
      for (const b of durationBuckets) if (b.test(t.durationDays)) dur[b.id] = (dur[b.id] ?? 0) + 1
      for (const c of t.departureCities) city[c] = (city[c] ?? 0) + 1
    }
    return { cat, trans, dur, city }
  }, [trips])

  const filtered = useMemo(() => {
    const result = trips.filter((t) => {
      if (debouncedDestination) {
        const q = debouncedDestination.toLowerCase()
        const hay = `${t.title} ${t.location} ${t.destination} ${t.region}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (origin && !t.departureCities.includes(origin)) return false
      if (travelers && t.maxGroup > 0 && t.maxGroup < Number(travelers)) return false
      if (date && !t.departures.some((dep) => { const iso = depDayISO(dep.date); return iso === null || iso >= date })) return false
      if (selectedCats.length && !selectedCats.includes(t.category)) return false
      if (selectedTransport.length && !selectedTransport.includes(t.transport)) return false
      if (selectedDurations.length) {
        const match = durationBuckets.some((b) => selectedDurations.includes(b.id) && b.test(t.durationDays))
        if (!match) return false
      }
      if (minRating && t.rating < minRating) return false
      if (t.price > maxPrice) return false
      return true
    })

    switch (sort) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break
      case 'price-desc': result.sort((a, b) => b.price - a.price); break
      case 'rating': result.sort((a, b) => b.rating - a.rating); break
      case 'duration': result.sort((a, b) => a.durationDays - b.durationDays); break
      default: result.sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating)
    }
    return result
  }, [trips, origin, date, travelers, debouncedDestination, selectedCats, selectedTransport, selectedDurations, minRating, maxPrice, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  // Carry From + Travelers onto each trip link so the count prefills detail → checkout.
  const tripQuery = useMemo(() => {
    const p = new URLSearchParams()
    if (origin) p.set('from', origin)
    if (travelers) p.set('travelers', travelers)
    return p.toString()
  }, [origin, travelers])

  const activeChips = [
    ...(origin ? [{ label: `From ${origin}`, clear: () => setOrigin('') }] : []),
    ...(date ? [{ label: `Departing ${prettyDate(date)}`, clear: () => { setDate(''); setPage(1) } }] : []),
    ...(travelers ? [{ label: `${travelers} ${travelers === '1' ? 'traveler' : 'travelers'}`, clear: () => { setTravelers(''); setPage(1) } }] : []),
    ...selectedCats.map((c) => ({ label: c, clear: () => toggle(selectedCats, setSelectedCats, c) })),
    ...selectedTransport.map((c) => ({ label: c, clear: () => toggle(selectedTransport, setSelectedTransport, c) })),
    ...selectedDurations.map((id) => ({
      label: durationBuckets.find((b) => b.id === id)!.label,
      clear: () => toggle(selectedDurations, setSelectedDurations, id),
    })),
    ...(minRating ? [{ label: `${minRating}+ rating`, clear: () => setMinRating(null) }] : []),
    ...(maxPrice < PRICE_MAX ? [{ label: `Under ${formatINR(maxPrice)}`, clear: () => setMaxPrice(PRICE_MAX) }] : []),
  ]

  const clearAll = () => {
    setOrigin(''); setDate(''); setTravelers(''); setSelectedCats([]); setSelectedDurations([]); setSelectedTransport([]); setMinRating(null); setMaxPrice(PRICE_MAX); setPage(1)
  }

  const Filters = (
    <div className="overflow-hidden rounded-lg border border-line bg-white">
      <div className="flex items-center justify-between border-b border-line px-[18px] py-4">
        <span className="flex items-center gap-2 font-semibold text-ink">
          <Icon name="sliders-horizontal" size={16} className="text-brand" />
          Filters
        </span>
        <button onClick={clearAll} className="text-[13px] font-medium text-brand hover:text-brand-dark">Clear all</button>
      </div>

      <FilterSection title="Max price">
        <input
          type="range" min={50000} max={PRICE_MAX} step={5000} value={maxPrice}
          onChange={(e) => { setMaxPrice(Number(e.target.value)); setPage(1) }}
          className="w-full accent-[#0E8C84]"
        />
        <div className="mt-1 flex items-center justify-between text-xs text-ink-secondary">
          <span>₹50,000</span>
          <span className="font-semibold text-ink">{maxPrice >= PRICE_MAX ? 'Any' : formatINR(maxPrice)}</span>
        </div>
      </FilterSection>

      <FilterSection title="Departure city">
        <label className="flex cursor-pointer items-center gap-2.5 py-1">
          <span className={cn('grid h-[18px] w-[18px] place-items-center rounded-full border transition', origin === '' ? 'border-brand' : 'border-line-strong')}>
            {origin === '' && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}
          </span>
          <span className="text-sm text-ink">Any city</span>
          <input type="radio" name="origin" className="sr-only" checked={origin === ''} onChange={() => { setOrigin(''); setPage(1) }} />
        </label>
        {departureCities.map((c) => (
          <label key={c} className="flex cursor-pointer items-center justify-between py-1">
            <span className="flex items-center gap-2.5">
              <span className={cn('grid h-[18px] w-[18px] place-items-center rounded-full border transition', origin === c ? 'border-brand' : 'border-line-strong')}>
                {origin === c && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}
              </span>
              <span className="text-sm text-ink">{c}</span>
            </span>
            <span className="text-xs text-ink-muted">{countBy.city[c] ?? 0}</span>
            <input type="radio" name="origin" className="sr-only" checked={origin === c} onChange={() => { setOrigin(c); setPage(1) }} />
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Trip style">
        {categories.map((c) => (
          <CheckRow key={c.id} label={c.name} count={countBy.cat[c.name] ?? 0}
            checked={selectedCats.includes(c.name)} onChange={() => toggle(selectedCats, setSelectedCats, c.name)} />
        ))}
      </FilterSection>

      <FilterSection title="Duration">
        {durationBuckets.map((b) => (
          <CheckRow key={b.id} label={b.label} count={countBy.dur[b.id] ?? 0}
            checked={selectedDurations.includes(b.id)} onChange={() => toggle(selectedDurations, setSelectedDurations, b.id)} />
        ))}
      </FilterSection>

      <FilterSection title="Transport">
        {transportOptions.map((t) => (
          <CheckRow key={t} label={t} count={countBy.trans[t] ?? 0}
            checked={selectedTransport.includes(t)} onChange={() => toggle(selectedTransport, setSelectedTransport, t)} />
        ))}
      </FilterSection>

      <div className="p-[18px]">
        <h4 className="mb-3 text-sm font-semibold text-ink">Rating</h4>
        <div className="flex flex-col gap-0.5">
          {ratingOptions.map((r) => (
            <label key={r} className="flex cursor-pointer items-center gap-2.5 py-1">
              <span className={cn('grid h-[18px] w-[18px] place-items-center rounded-full border transition',
                minRating === r ? 'border-brand' : 'border-line-strong')}>
                {minRating === r && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}
              </span>
              <span className="flex items-center gap-1 text-sm text-ink">
                <Icon name="star" size={14} className="text-star" fill="currentColor" strokeWidth={1.5} />
                {r.toFixed(1)} & up
              </span>
              <input type="radio" name="rating" className="sr-only" checked={minRating === r}
                onChange={() => { setMinRating(r); setPage(1) }} />
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-surface-page">
      {/* Search strip */}
      <div className="sticky top-[68px] z-40 border-b border-line bg-white">
        <Container className="py-3.5">
          <div className="flex flex-col gap-2 rounded-md border border-line-strong p-1.5 sm:flex-row sm:items-center sm:gap-0">
            <div className="flex items-center gap-2 px-3 sm:border-r sm:border-line">
              <Icon name="plane-takeoff" size={16} className="shrink-0 text-brand" />
              <select
                value={origin}
                onChange={(e) => { setOrigin(e.target.value); setPage(1) }}
                className="h-9 w-full bg-transparent text-sm text-ink outline-none sm:w-40"
              >
                <option value="">From: Any city</option>
                {departureCities.map((c) => <option key={c} value={c}>From: {c}</option>)}
              </select>
            </div>
            <div className="flex flex-1 items-center gap-2 px-3 sm:border-r sm:border-line">
              <Icon name="map-pin" size={16} className="shrink-0 text-brand" />
              <input
                value={destination}
                onChange={(e) => { setDestination(e.target.value); setPage(1) }}
                placeholder="Where to? Search destinations or trips…"
                className="h-9 w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
              />
            </div>
            <div className="flex items-center gap-2 px-3 sm:border-r sm:border-line">
              <Icon name="calendar" size={16} className="shrink-0 text-brand" />
              <input
                type="date"
                value={date}
                min={TODAY}
                onChange={(e) => { setDate(e.target.value); setPage(1) }}
                className="h-9 w-full bg-transparent text-sm text-ink outline-none sm:w-36"
              />
            </div>
            <div className="flex items-center gap-2 px-3">
              <Icon name="users" size={16} className="shrink-0 text-brand" />
              <select
                value={travelers}
                onChange={(e) => { setTravelers(e.target.value); setPage(1) }}
                className="h-9 w-full bg-transparent text-sm text-ink outline-none sm:w-32"
              >
                <option value="">Travelers</option>
                {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} {n === 1 ? 'traveler' : 'travelers'}</option>)}
              </select>
            </div>
            <button className="flex h-[42px] shrink-0 items-center justify-center gap-2 rounded-sm bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark sm:w-[42px] sm:px-0">
              <Icon name="search" size={18} />
              <span className="sm:hidden">Search</span>
            </button>
          </div>
        </Container>
      </div>

      <Container className="py-7">
        <div className="flex flex-col gap-7 lg:flex-row">
          {/* Sidebar */}
          <aside className="hidden w-[280px] shrink-0 lg:block">{Filters}</aside>

          {/* Results */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-heading text-2xl font-bold text-ink">
                  {loading ? 'Finding trips…' : `${filtered.length} trip${filtered.length !== 1 ? 's' : ''} found`}
                </h1>
                <p className="mt-0.5 text-sm text-ink-secondary">
                  {origin
                    ? `Round-trip from ${origin}${destination ? ` · “${destination}”` : ''} · travel included`
                    : destination
                      ? `Results for “${destination}”`
                      : 'Curated packages with round-trip travel from your city'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-sm border border-line-strong bg-white px-3.5 py-2 text-sm font-medium text-ink lg:hidden"
                >
                  <Icon name="sliders-horizontal" size={16} /> Filters
                </button>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="appearance-none rounded-sm border border-line-strong bg-white py-2 pl-3.5 pr-9 text-sm font-medium text-ink outline-none focus:border-brand"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Top rated</option>
                    <option value="duration">Shortest first</option>
                  </select>
                  <Icon name="chevron-down" size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                </div>
              </div>
            </div>

            {showFilters && <div className="mt-4 lg:hidden">{Filters}</div>}

            {activeChips.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-medium text-ink-secondary">Active:</span>
                {activeChips.map((chip, i) => (
                  <button key={i} onClick={chip.clear}
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 text-[13px] font-medium text-brand hover:bg-brand/15">
                    {chip.label}
                    <Icon name="x" size={13} />
                  </button>
                ))}
              </div>
            )}

            {loading ? (
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-[360px] animate-pulse rounded-lg border border-line bg-surface-muted" />
                ))}
              </div>
            ) : pageItems.length > 0 ? (
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {pageItems.map((t) => <TripCard key={t.id} trip={t} query={tripQuery} />)}
              </div>
            ) : (
              <div className="mt-10 flex flex-col items-center gap-3 rounded-lg border border-dashed border-line-strong bg-white py-16 text-center">
                <Icon name="search" size={28} className="text-ink-muted" />
                <p className="font-heading text-lg font-semibold text-ink">No trips match your filters</p>
                <p className="max-w-sm text-sm text-ink-secondary">Try widening your price range or clearing a few filters to see more results.</p>
                <button onClick={clearAll} className="mt-1 text-sm font-semibold text-brand">Clear all filters</button>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  disabled={currentPage === 1} onClick={() => setPage((p) => p - 1)}
                  className="grid h-9 w-9 place-items-center rounded-sm border border-line-strong bg-white text-ink disabled:opacity-40"
                >
                  <Icon name="chevron-left" size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    className={cn('h-9 w-9 rounded-sm border text-sm font-medium',
                      p === currentPage ? 'border-brand bg-brand text-white' : 'border-line-strong bg-white text-ink hover:border-brand')}>
                    {p}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages} onClick={() => setPage((p) => p + 1)}
                  className="grid h-9 w-9 place-items-center rounded-sm border border-line-strong bg-white text-ink disabled:opacity-40"
                >
                  <Icon name="chevron-right" size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  )
}
