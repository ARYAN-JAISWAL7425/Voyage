import { cn } from '@/lib/cn'
import { useAuth } from '@/hooks/useAuth'
import { useOperatorTrips } from '@/hooks/useOperatorData'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon, type IconName } from '@/components/ui/Icon'

const packages: { icon: IconName; name: string; desc: string; price: string; perks: string[]; featured?: boolean }[] = [
  { icon: 'sparkles', name: 'Homepage feature', desc: 'Showcase your trip on the Voyago homepage', price: '₹4,999/wk', perks: ['Front-page placement', 'Up to 3× more views', '“Featured” badge'], featured: true },
  { icon: 'trending-up', name: 'Top of search', desc: 'Rank above other trips in search results', price: '₹2,999/wk', perks: ['Priority in search', 'Highlighted card', 'Performance report'] },
  { icon: 'percent', name: 'Deal spotlight', desc: 'Appear on the Deals page with a discount badge', price: '₹1,999/wk', perks: ['Listed in Deals', '“% OFF” badge', 'Email feature'] },
]

export default function BusinessPromote() {
  const { operatorId } = useAuth()
  const { trips } = useOperatorTrips(operatorId)
  const featured = trips.filter((t) => t.featured)

  return (
    <DashboardLayout variant="business" title="Promote" active="Promote">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Your trips" value={String(trips.length)} icon="map" tone="brand" />
          <StatCard label="Featured" value={String(featured.length)} icon="sparkles" tone="accent" />
          <StatCard label="Impressions (30d)" value="—" icon="eye" tone="info" />
          <StatCard label="Clicks (30d)" value="—" icon="trending-up" tone="success" />
        </div>

        <div>
          <h3 className="mb-1 font-heading text-lg font-bold text-ink">Promotion packages</h3>
          <p className="mb-4 text-sm text-ink-secondary">Boost visibility and get more bookings.</p>
          <div className="grid gap-4 md:grid-cols-3">
            {packages.map((p) => (
              <div key={p.name} className={cn('flex flex-col gap-3 rounded-lg border bg-white p-5', p.featured ? 'border-brand ring-1 ring-brand' : 'border-line')}>
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-md bg-brand-soft text-brand"><Icon name={p.icon} size={22} /></span>
                  {p.featured && <Badge tone="brand">Popular</Badge>}
                </div>
                <div><h4 className="font-heading text-base font-bold text-ink">{p.name}</h4><p className="mt-0.5 text-sm text-ink-secondary">{p.desc}</p></div>
                <p className="font-heading text-xl font-bold text-ink">{p.price}</p>
                <ul className="flex flex-col gap-1.5">{p.perks.map((perk) => <li key={perk} className="flex items-center gap-2 text-sm text-ink-secondary"><Icon name="circle-check" size={15} className="text-success" /> {perk}</li>)}</ul>
                <Button fullWidth variant={p.featured ? 'primary' : 'secondary'} className="mt-1">Start promotion</Button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-line bg-white p-5">
          <h3 className="mb-3 font-heading text-base font-bold text-ink">Promote a trip</h3>
          {trips.length === 0 ? (
            <p className="text-sm text-ink-muted">{operatorId ? 'No trips to promote yet.' : 'Complete operator setup first.'}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {trips.map((t) => (
                <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line bg-surface-muted p-3.5">
                  <div className="flex items-center gap-3">
                    <img src={t.image} alt="" className="h-11 w-14 rounded-md object-cover" />
                    <div><p className="font-medium text-ink">{t.title}</p><p className="text-xs text-ink-muted">{t.featured ? 'Currently featured' : 'Not promoted'}</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.featured && <Badge tone="success" icon="sparkles">Live</Badge>}
                    <Button size="sm" variant="secondary">Promote</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
