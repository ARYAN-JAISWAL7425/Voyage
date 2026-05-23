import { Link } from 'react-router-dom'
import type { Destination } from '@/types'

export function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <Link
      to={`/search?destination=${encodeURIComponent(destination.name)}`}
      className="group relative flex h-[200px] flex-col justify-end overflow-hidden rounded-lg p-4"
    >
      <img
        src={destination.image}
        alt={destination.name}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
      <div className="relative">
        <h3 className="font-heading text-[17px] font-bold text-white">{destination.name}</h3>
        <p className="text-[13px] text-white/85">{destination.tripsCount} trips</p>
      </div>
    </Link>
  )
}
