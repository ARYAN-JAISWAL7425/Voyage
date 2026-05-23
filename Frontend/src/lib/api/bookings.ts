import { supabase } from '@/lib/supabase'
import { bookings as mockBookings } from '@/data/bookings'
import type { Booking } from '@/types'

export interface NewBooking {
  tripId: string
  departureId: string
  operatorId: string
  travelerName: string
  fromCity: string
  option: 'full' | 'land'
  travelers: number
  amount: number
}

function newReference(): string {
  return 'VYG-' + Math.random().toString(36).slice(2, 8).toUpperCase()
}

/** Create a booking for the signed-in user. Returns the reference; saves only when live + signed in. */
export async function createBooking(b: NewBooking): Promise<{ reference: string; error?: string }> {
  const reference = newReference()
  if (!supabase) return { reference }
  const { data: auth } = await supabase.auth.getUser()
  const user = auth.user
  if (!user) return { reference, error: 'Please sign in to save your booking.' }
  const { error } = await supabase.from('bookings').insert({
    reference,
    user_id: user.id,
    trip_id: b.tripId,
    departure_id: b.departureId,
    operator_id: b.operatorId,
    traveler_name: b.travelerName,
    from_city: b.fromCity,
    option: b.option,
    travelers: b.travelers,
    amount: b.amount,
    status: 'confirmed',
  })
  return { reference, error: error?.message }
}

/** Cancel a booking (its buyer, the trip's operator, or an admin). Restores the seats. */
export async function cancelBooking(id: string): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Not connected to Supabase.' }
  const { data, error } = await supabase.rpc('cancel_booking', { p_booking_id: id })
  if (error) return { error: error.message }
  if (data === 'forbidden') return { error: 'You can only cancel your own bookings.' }
  if (data === 'not_found') return { error: 'Booking not found.' }
  return {}
}

function toBooking(r: Record<string, unknown>): Booking {
  const dep = r.departures as { date?: string } | null
  const created = r.created_at ? new Date(r.created_at as string) : null
  return {
    id: r.id as string,
    reference: r.reference as string,
    tripId: r.trip_id as string,
    travelerName: (r.traveler_name as string) ?? '',
    status: (r.status as Booking['status']) ?? 'confirmed',
    departureDate: dep?.date ?? '',
    travelers: (r.travelers as number) ?? 1,
    amount: (r.amount as number) ?? 0,
    bookedOn: created ? created.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
  }
}

/** The signed-in user's bookings (newest first). Mock list only when Supabase is unconfigured. */
export async function getMyBookings(): Promise<Booking[]> {
  if (!supabase) return mockBookings
  const { data: auth } = await supabase.auth.getUser()
  const user = auth.user
  if (!user) return []
  const { data, error } = await supabase
    .from('bookings')
    .select('*, departures(date)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return data.map((r) => toBooking(r as Record<string, unknown>))
}
