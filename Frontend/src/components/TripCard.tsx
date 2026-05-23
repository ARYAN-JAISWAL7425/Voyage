import { Link } from 'react-router-dom'
import type { MouseEvent } from 'react'
import type { Trip } from '@/types'
import { cn } from '@/lib/cn'
import { formatINR } from '@/lib/format'
import { operatorById } from '@/data/operators'
import { useSavedTrips } from '@/hooks/useSavedTrips'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Rating } from '@/components/ui/Rating'

interface TripCardProps {
  trip: Trip
  className?: string
  /** Optional query string (e.g. "travelers=4&from=Delhi") appended to the trip link. */
  query?: string
}

export function TripCard({ trip, className, query }: TripCardProps) {
  const { isSaved, toggleSaved } = useSavedTrips()
  const saved = isSaved(trip.id)
  const operatorName = trip.operatorName ?? operatorById(trip.operatorId)?.name
  const urgent = trip.seatsLeft <= 5

  const toggleSave = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleSaved(trip.id)
  }

  return (
    <Link
      to={query ? `/trip/${trip.id}?${query}` : `/trip/${trip.id}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-lg border border-line bg-white shadow-sm transition hover:shadow-md hover:-translate-y-0.5',
        className,
      )}
    >
      {/* Image */}
      <div className="relative h-[182px] w-full overflow-hidden">
        <img
          src={trip.image}
          alt={trip.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="relative flex items-start justify-between p-3">
          {trip.badge ? (
            <Badge tone={trip.badge.label === 'Featured' ? 'solid-accent' : 'accent'} icon={trip.badge.icon}>
              {trip.badge.label}
            </Badge>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={toggleSave}
            aria-label="Save trip"
            className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-ink shadow-sm transition hover:bg-white"
          >
            <Icon name="heart" size={16} className={cn(saved && 'text-danger')} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2.5 p-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-[13px] text-ink-secondary">
            <Icon name="map-pin" size={14} className="text-brand" />
            {trip.location}
          </span>
          <Rating score={trip.rating} count={trip.reviewCount} />
        </div>

        <h3 className="font-heading text-base font-semibold leading-tight text-ink line-clamp-2">{trip.title}</h3>

        {operatorName && (
          <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-secondary">
            <Icon name="badge-check" size={14} className="text-brand" />
            {operatorName}
          </span>
        )}

        <div className="flex items-center gap-3.5 text-xs text-ink-secondary">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="timer" size={14} className="text-ink-muted" />
            {trip.durationDays} days
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="users" size={14} className="text-ink-muted" />
            Max {trip.maxGroup}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name={trip.transportIcon} size={14} className="text-ink-muted" />
            {trip.transport}
          </span>
        </div>

        {trip.travelIncluded !== false ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-ink-secondary">
            <Icon name="plane-takeoff" size={13} className="text-brand" />
            Round-trip available from {trip.departureCities.slice(0, 2).join(', ')}
            {trip.departureCities.length > 2 ? ` +${trip.departureCities.length - 2}` : ''}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-ink-secondary">
            <Icon name="luggage" size={13} className="text-brand" />
            Land only · join at {trip.destination}
          </span>
        )}

        <div className="mt-auto h-px w-full bg-line" />

        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-ink-muted">From</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-xl font-bold text-ink">{formatINR(trip.price)}</span>
              {trip.originalPrice && (
                <span className="text-xs text-ink-muted line-through">{formatINR(trip.originalPrice)}</span>
              )}
            </div>
          </div>
          <span className={cn('inline-flex items-center gap-1 text-xs font-medium', urgent ? 'text-accent' : 'text-success')}>
            <Icon name="armchair" size={14} />
            {trip.seatsLeft} seats left
          </span>
        </div>
      </div>
    </Link>
  )
}
