import { Link } from 'react-router-dom'
import { destinations } from '@/data/destinations'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { DestinationCard } from '@/components/DestinationCard'

const regionOrder = ['North India', 'South India', 'West India', 'Islands']
const totalTrips = destinations.reduce((sum, d) => sum + d.tripsCount, 0)

export default function Destinations() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-surface-page">
        <Container className="flex flex-col items-center gap-4 py-14 text-center">
          <Badge tone="brand" icon="map-pinned">Destinations</Badge>
          <h1 className="max-w-[720px] font-heading text-3xl font-bold leading-tight text-ink sm:text-[40px]">
            Explore India, region by region
          </h1>
          <p className="max-w-[600px] text-[15px] leading-relaxed text-ink-secondary">
            {destinations.length} destinations · {totalTrips.toLocaleString('en-IN')}+ curated trips from verified operators.
            Pick a place and we’ll show every trip there.
          </p>
        </Container>
      </section>

      {/* Region groups */}
      <section className="bg-white py-12">
        <Container className="flex flex-col gap-12">
          {regionOrder.map((region) => {
            const items = destinations.filter((d) => d.region === region)
            if (!items.length) return null
            return (
              <div key={region} className="flex flex-col gap-5">
                <div className="flex items-end justify-between">
                  <h2 className="font-heading text-2xl font-bold text-ink">{region}</h2>
                  <span className="text-sm text-ink-muted">{items.length} destinations</span>
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {items.map((d) => (
                    <DestinationCard key={d.id} destination={d} />
                  ))}
                </div>
              </div>
            )
          })}

          <Link
            to="/search"
            className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-line-strong py-6 text-sm font-semibold text-brand hover:bg-brand-soft/40"
          >
            Browse all trips across India
            <Icon name="arrow-right" size={16} />
          </Link>
        </Container>
      </section>
    </div>
  )
}
