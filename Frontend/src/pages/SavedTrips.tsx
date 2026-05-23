import type { Trip } from '@/types'
import { tripById } from '@/data/trips'
import { useSavedTrips } from '@/hooks/useSavedTrips'
import { useTrips } from '@/hooks/useTrips'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { TripCard } from '@/components/TripCard'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

export default function SavedTrips() {
  const { savedIds } = useSavedTrips()
  const { trips } = useTrips()
  const saved = savedIds.map((id) => trips.find((t) => t.id === id) ?? tripById(id)).filter((t): t is Trip => Boolean(t))

  return (
    <DashboardLayout variant="traveler" title="Saved trips" active="Saved trips">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-xl font-bold text-ink">Your wishlist</h2>
            <p className="text-sm text-ink-secondary">
              {saved.length} {saved.length === 1 ? 'trip' : 'trips'} saved · book before they sell out
            </p>
          </div>
          {saved.length > 0 && (
            <div className="relative">
              <select className="h-9 appearance-none rounded-sm border border-line-strong bg-white py-2 pl-3.5 pr-9 text-sm font-medium text-ink outline-none focus:border-brand">
                <option>Recently saved</option>
                <option>Price: Low to High</option>
                <option>Top rated</option>
              </select>
              <Icon name="chevron-down" size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            </div>
          )}
        </div>

        {saved.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {saved.map((t) => <TripCard key={t.id} trip={t} />)}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-line-strong bg-white py-20 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-soft"><Icon name="heart" size={26} className="text-brand" /></span>
            <p className="font-heading text-lg font-semibold text-ink">No saved trips yet</p>
            <p className="max-w-sm text-sm text-ink-secondary">Tap the heart on any trip to save it here for later.</p>
            <Button to="/search" className="mt-1">Explore trips</Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
