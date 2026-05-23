import { supabase } from '@/lib/supabase'
import type { Trip } from '@/types'
import { getTrips } from '@/lib/api/trips'

export type OpBookingStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled'

export interface OperatorBookingRow {
  id: string
  reference: string
  tripId: string
  tripTitle: string
  traveler: string
  initials: string
  fromCity: string
  option: 'full' | 'land'
  departureDate: string
  travelers: number
  amount: number
  status: OpBookingStatus
}

export interface OperatorReviewRow {
  id: string
  tripId: string
  tripTitle: string
  author: string
  initials: string
  rating: number
  date: string
  title: string
  body: string
  helpful: number
}

const initialsOf = (name: string) =>
  name.split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?'

/** The operator's own trips (the real catalog filtered to their operator_id). */
export async function getOperatorTrips(operatorId: string): Promise<Trip[]> {
  const all = await getTrips()
  return all.filter((t) => t.operatorId === operatorId)
}

/** Bookings travelers made for this operator's trips (newest first). Needs the operator RLS policy. */
export async function getOperatorBookings(operatorId: string): Promise<OperatorBookingRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('bookings')
    .select('*, departures(date), trips(title)')
    .eq('operator_id', operatorId)
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return data.map((row) => {
    const r = row as Record<string, unknown>
    const dep = r.departures as { date?: string } | null
    const trip = r.trips as { title?: string } | null
    const name = (r.traveler_name as string) ?? 'Traveler'
    return {
      id: r.id as string,
      reference: r.reference as string,
      tripId: r.trip_id as string,
      tripTitle: trip?.title ?? '',
      traveler: name,
      initials: initialsOf(name),
      fromCity: (r.from_city as string) ?? '',
      option: r.option === 'land' ? 'land' : 'full',
      departureDate: dep?.date ?? '',
      travelers: (r.travelers as number) ?? 1,
      amount: (r.amount as number) ?? 0,
      status: (r.status as OpBookingStatus) ?? 'confirmed',
    }
  })
}

/** Reviews left on this operator's trips (newest first). Reviews are public-read. */
export async function getOperatorReviews(operatorId: string): Promise<OperatorReviewRow[]> {
  if (!supabase) return []
  const trips = await getOperatorTrips(operatorId)
  const ids = trips.map((t) => t.id)
  if (ids.length === 0) return []
  const { data, error } = await supabase
    .from('reviews')
    .select('*, trips(title)')
    .in('trip_id', ids)
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return data.map((row) => {
    const r = row as Record<string, unknown>
    const trip = r.trips as { title?: string } | null
    return {
      id: r.id as string,
      tripId: r.trip_id as string,
      tripTitle: trip?.title ?? '',
      author: (r.author as string) ?? 'Traveler',
      initials: (r.initials as string) ?? '?',
      rating: (r.rating as number) ?? 5,
      date: (r.date as string) ?? '',
      title: (r.title as string) ?? '',
      body: (r.body as string) ?? '',
      helpful: (r.helpful as number) ?? 0,
    }
  })
}

/** Self-onboard the signed-in user as an operator (creates operators row + links profile). */
export async function becomeOperator(name: string, location: string, about: string): Promise<{ id?: string; error?: string }> {
  if (!supabase) return { error: 'Not connected to Supabase.' }
  const { data, error } = await supabase.rpc('become_operator', {
    business_name: name,
    business_location: location || null,
    business_about: about || null,
  })
  if (error) return { error: error.message }
  return { id: (data as string) ?? undefined }
}

/** Update the operator's own profile fields (name/location/about/response time). */
export async function updateOperator(
  operatorId: string,
  fields: { name?: string; location?: string; about?: string; response_time?: string },
): Promise<{ error?: string }> {
  if (!supabase) return {}
  const { error } = await supabase.from('operators').update(fields).eq('id', operatorId)
  return { error: error?.message }
}

export interface NewTripInput {
  title: string
  destination: string
  category: string
  summary: string
  price: number
  durationDays: number
  travelIncluded: boolean
  transport: string
  departureCities: string[]
  travelFare: number
  description?: string
  originalPrice?: number
  maxGroup?: number
  image?: string
  gallery?: string[]
  itinerary: { day: number; title: string; description: string }[]
  departures: { date: string; seats: number }[]
}

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80'

/** Insert a new trip (+ its departures) for the operator. Requires the operator write policies. */
export async function createTrip(operatorId: string, t: NewTripInput): Promise<{ id?: string; error?: string }> {
  if (!supabase) return { error: 'Not connected to Supabase.' }
  const base = t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40) || 'trip'
  const id = `${base}-${Math.random().toString(36).slice(2, 7)}`
  const transport = t.travelIncluded ? t.transport : 'Land only'
  const transportIcon =
    transport === 'Flights' ? 'plane-takeoff' : transport === 'Train' ? 'train-front' : transport === 'Volvo coach' ? 'bus' : 'luggage'
  const cover = t.image || PLACEHOLDER_IMG
  const gallery = t.gallery && t.gallery.length ? t.gallery : [cover]
  const group = t.maxGroup && t.maxGroup > 0 ? t.maxGroup : 14

  const { error } = await supabase.from('trips').insert({
    id,
    slug: id,
    title: t.title,
    destination: t.destination,
    location: t.destination,
    region: 'India',
    operator_id: operatorId,
    image: cover,
    gallery,
    departure_cities: t.travelIncluded ? t.departureCities : [],
    price: t.price,
    original_price: t.originalPrice && t.originalPrice > 0 ? t.originalPrice : null,
    travel_fare: t.travelIncluded ? t.travelFare : 0,
    travel_included: t.travelIncluded,
    duration_days: t.durationDays,
    nights: Math.max(0, t.durationDays - 1),
    max_group: group,
    transport,
    transport_icon: transportIcon,
    seats_left: group,
    rating: 0,
    review_count: 0,
    featured: false,
    category: t.category,
    pace: 'Balanced',
    summary: t.summary,
    description: t.description && t.description.trim() ? t.description : t.summary,
    highlights: [],
    included: [],
    excluded: ['5% GST (added at checkout)'],
    itinerary: t.itinerary,
  })
  if (error) return { error: error.message }

  const deps = t.departures
    .filter((d) => d.date)
    .map((d, i) => ({ id: `${id}-d${i + 1}`, trip_id: id, date: d.date, price: t.price, seats_left: d.seats || 14 }))
  if (deps.length) {
    const { error: depErr } = await supabase.from('departures').insert(deps)
    if (depErr) return { error: depErr.message }
  }
  return { id }
}

/** Upload a trip photo to Supabase Storage (the `trip-photos` bucket) and return its public URL. */
export async function uploadTripPhoto(operatorId: string, file: File): Promise<{ url?: string; error?: string }> {
  if (!supabase) return { error: 'Not connected to Supabase.' }
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const path = `${operatorId}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`
  const { error } = await supabase.storage.from('trip-photos').upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) return { error: error.message }
  const { data } = supabase.storage.from('trip-photos').getPublicUrl(path)
  return { url: data.publicUrl }
}
