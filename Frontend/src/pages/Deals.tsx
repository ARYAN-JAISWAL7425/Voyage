import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTrips } from '@/hooks/useTrips'
import { useOperator } from '@/hooks/useOperator'
import type { Trip } from '@/types'
import { formatINR } from '@/lib/format'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Rating } from '@/components/ui/Rating'
import { TripCard } from '@/components/TripCard'

const save = (t: Trip) => (t.originalPrice ?? t.price) - t.price
const pct = (t: Trip) => Math.round((save(t) / (t.originalPrice ?? t.price)) * 100)

export default function Deals() {
  const { trips } = useTrips()
  const deals = useMemo(() => trips.filter((t) => t.originalPrice).sort((a, b) => save(b) - save(a)), [trips])
  const featured = deals[0]
  const rest = deals.slice(1)
  const { operator } = useOperator(featured?.operatorId)

  return (
    <div>
      {/* Hero */}
      <section className="bg-surface-inverse">
        <Container className="flex flex-col items-center gap-4 py-14 text-center">
          <Badge tone="solid-accent" icon="percent">Deals & offers</Badge>
          <h1 className="max-w-[700px] font-heading text-3xl font-bold leading-tight text-white sm:text-[40px]">
            Limited-time trip deals
          </h1>
          <p className="max-w-[580px] text-[15px] leading-relaxed text-[#C7D2D9]">
            Hand-picked discounts on verified trips across India. Book before the seats — and the prices — run out.
          </p>
        </Container>
      </section>

      <Container className="flex flex-col gap-10 py-12">
        {/* Featured deal */}
        {featured && (
          <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
            <div className="flex flex-col lg:flex-row">
              <div className="relative lg:w-[46%]">
                <img src={featured.image} alt={featured.title} className="h-56 w-full object-cover lg:h-full" />
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-white shadow">
                  <Icon name="percent" size={13} /> {pct(featured)}% OFF · Deal of the week
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="brand" icon="badge-check">{operator?.name}</Badge>
                  <Rating score={featured.rating} count={featured.reviewCount} />
                </div>
                <h2 className="font-heading text-2xl font-bold text-ink">{featured.title}</h2>
                <p className="text-sm leading-relaxed text-ink-secondary">{featured.summary}</p>
                <div className="mt-1 flex items-end gap-3">
                  <span className="font-heading text-3xl font-bold text-ink">{formatINR(featured.price)}</span>
                  {featured.originalPrice && <span className="text-base text-ink-muted line-through">{formatINR(featured.originalPrice)}</span>}
                  <span className="mb-1 text-sm font-semibold text-success">Save {formatINR(save(featured))}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-3">
                  <Button to={`/trip/${featured.id}`} iconRight="arrow-right">View deal</Button>
                  <Button to={`/trip/${featured.id}`} variant="secondary">See itinerary</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All deals */}
        <div className="flex flex-col gap-5">
          <div className="flex items-end justify-between">
            <h2 className="font-heading text-2xl font-bold text-ink">All deals</h2>
            <span className="text-sm text-ink-muted">{deals.length} on offer</span>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((t) => (
              <div key={t.id} className="relative">
                <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-white shadow">
                  {pct(t)}% OFF
                </span>
                <TripCard trip={t} />
              </div>
            ))}
          </div>
        </div>

        <Link
          to="/search"
          className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-line-strong py-6 text-sm font-semibold text-brand hover:bg-brand-soft/40"
        >
          Browse all trips
          <Icon name="arrow-right" size={16} />
        </Link>
      </Container>
    </div>
  )
}
