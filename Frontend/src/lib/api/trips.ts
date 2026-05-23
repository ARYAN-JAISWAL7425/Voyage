import { supabase } from '@/lib/supabase'
import { trips as mockTrips, tripById as mockTripById } from '@/data/trips'
import type { Trip, Departure } from '@/types'

interface DepRow { id: string; trip_id: string; date: string | null; price: number | null; seats_left: number | null }

function toDeparture(d: DepRow): Departure {
  const seatsLeft = d.seats_left ?? 0
  return {
    id: d.id,
    date: d.date ?? '',
    endDate: '',
    seatsLeft,
    price: d.price ?? 0,
    status: seatsLeft === 0 ? 'soldout' : seatsLeft <= 3 ? 'filling' : 'available',
  }
}

// Supabase row (snake_case) → app Trip (camelCase)
function toTrip(r: Record<string, unknown>, deps: DepRow[]): Trip {
  const id = r.id as string
  return {
    id,
    slug: r.slug as string,
    title: r.title as string,
    destination: (r.destination as string) ?? '',
    location: (r.location as string) ?? '',
    region: (r.region as string) ?? '',
    departureCities: (r.departure_cities as string[]) ?? [],
    operatorId: (r.operator_id as string) ?? '',
    operatorName: (r.operators as { name?: string } | null)?.name ?? undefined,
    image: (r.image as string) ?? '',
    gallery: (r.gallery as string[]) ?? [],
    price: r.price as number,
    originalPrice: (r.original_price as number | null) ?? undefined,
    travelFare: (r.travel_fare as number) ?? 0,
    travelIncluded: (r.travel_included as boolean) ?? true,
    durationDays: (r.duration_days as number) ?? 0,
    nights: (r.nights as number) ?? 0,
    maxGroup: (r.max_group as number) ?? 0,
    transport: (r.transport as string) ?? '',
    transportIcon: (r.transport_icon as Trip['transportIcon']) ?? 'luggage',
    seatsLeft: (r.seats_left as number) ?? 0,
    rating: Number(r.rating ?? 0),
    reviewCount: (r.review_count as number) ?? 0,
    badge: (r.badge as Trip['badge']) ?? undefined,
    featured: (r.featured as boolean) ?? false,
    category: (r.category as string) ?? '',
    pace: (r.pace as string) ?? '',
    summary: (r.summary as string) ?? '',
    description: (r.description as string) ?? '',
    highlights: (r.highlights as string[]) ?? [],
    included: (r.included as string[]) ?? [],
    excluded: (r.excluded as string[]) ?? [],
    itinerary: (r.itinerary as Trip['itinerary']) ?? [],
    departures: deps.filter((d) => d.trip_id === id).map(toDeparture),
  }
}

/** All trips — from Supabase when configured, else the mock catalog (also falls back on error/empty). */
export async function getTrips(): Promise<Trip[]> {
  if (!supabase) return mockTrips
  const [{ data: rows, error }, { data: deps }] = await Promise.all([
    supabase.from('trips').select('*, operators(name)'),
    supabase.from('departures').select('*'),
  ])
  if (error || !rows || rows.length === 0) return mockTrips
  return rows.map((r) => toTrip(r as Record<string, unknown>, (deps as DepRow[] | null) ?? []))
}

/** A single trip by id — from Supabase when configured, else mock. */
export async function getTripById(id: string): Promise<Trip | undefined> {
  if (!supabase) return mockTripById(id)
  const { data: row, error } = await supabase.from('trips').select('*, operators(name)').eq('id', id).maybeSingle()
  if (error || !row) return mockTripById(id)
  const { data: deps } = await supabase.from('departures').select('*').eq('trip_id', id)
  return toTrip(row as Record<string, unknown>, (deps as DepRow[] | null) ?? [])
}
