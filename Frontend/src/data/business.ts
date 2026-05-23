import { trips } from '@/data/trips'

// Mock data for the operator (business) dashboard.
// Frontend-only; replaced by real per-operator API data when the backend lands.

export type TripStatus = 'Active' | 'Draft' | 'Paused'

export interface BusinessTripRow {
  tripId: string
  status: TripStatus
  bookings: number
  revenue: number
}

// --- The operator currently logged into the business dashboard ---
// No auth yet — in production this comes from the session. EVERY business page
// scopes its data to this operator, so a login only ever sees its OWN trips,
// bookings, reviews and earnings. Change this id to "log in" as another operator.
export const currentOperatorId = 'heritage-india'

const ownsTrip = (tripId: string) =>
  trips.find((t) => t.id === tripId)?.operatorId === currentOperatorId

export const tripStatusTone: Record<TripStatus, 'success' | 'neutral' | 'accent'> = {
  Active: 'success',
  Draft: 'neutral',
  Paused: 'accent',
}

// Per-trip stats keyed by trip id (server-computed in production). Listed for all
// trips so switching currentOperatorId automatically yields that operator's portfolio.
const tripStats: Record<string, { status: TripStatus; bookings: number; revenue: number }> = {
  'golden-triangle': { status: 'Active', bookings: 142, revenue: 2342985 },
  'rajasthan-royal': { status: 'Active', bookings: 98, revenue: 1754000 },
  'goa-beaches': { status: 'Active', bookings: 76, revenue: 820792 },
  'kerala-backwaters': { status: 'Paused', bookings: 41, revenue: 561700 },
  'ladakh-himalayan': { status: 'Active', bookings: 54, revenue: 1889946 },
  'manali-snow': { status: 'Draft', bookings: 0, revenue: 0 },
  'hampi-heritage': { status: 'Active', bookings: 33, revenue: 560967 },
  'udaipur-luxury': { status: 'Active', bookings: 47, revenue: 2584953 },
  'andaman-islands': { status: 'Paused', bookings: 29, revenue: 1130971 },
}

// Only the logged-in operator's trips.
export const myTrips: BusinessTripRow[] = trips
  .filter((t) => t.operatorId === currentOperatorId)
  .map((t) => ({ tripId: t.id, ...(tripStats[t.id] ?? { status: 'Draft' as TripStatus, bookings: 0, revenue: 0 }) }))

export type BookingStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled'

// Bookings received from travelers (the operator's "who booked my plan" view).
export interface OperatorBooking {
  id: string
  reference: string
  tripId: string
  traveler: string
  initials: string
  fromCity: string
  option: 'full' | 'land'
  departureDate: string
  travelers: number
  amount: number
  status: BookingStatus
  bookedOn: string
}

const allOperatorBookings: OperatorBooking[] = [
  { id: 'ob1', reference: 'VYG-7F3K9A', tripId: 'golden-triangle', traveler: 'Aarav Sharma', initials: 'AS', fromCity: 'Mumbai', option: 'full', departureDate: '12 Sep 2026', travelers: 2, amount: 99998, status: 'confirmed', bookedOn: '02 May 2026' },
  { id: 'ob2', reference: 'VYG-2M8QJ1', tripId: 'goa-beaches', traveler: 'Priya Nair', initials: 'PN', fromCity: 'Delhi', option: 'full', departureDate: '05 Jul 2026', travelers: 3, amount: 80997, status: 'pending', bookedOn: '18 May 2026' },
  { id: 'ob3', reference: 'VYG-9XB4LP', tripId: 'rajasthan-royal', traveler: 'Rohan Mehta', initials: 'RM', fromCity: 'Ahmedabad', option: 'full', departureDate: '20 Aug 2026', travelers: 2, amount: 77998, status: 'confirmed', bookedOn: '15 May 2026' },
  { id: 'ob4', reference: 'VYG-3HJ7TQ', tripId: 'golden-triangle', traveler: 'Sneha Kulkarni', initials: 'SK', fromCity: 'Bengaluru', option: 'land', departureDate: '12 Sep 2026', travelers: 1, amount: 43999, status: 'pending', bookedOn: '20 May 2026' },
  { id: 'ob5', reference: 'VYG-6PL2WD', tripId: 'kerala-backwaters', traveler: 'Vikram Sharma', initials: 'VS', fromCity: 'Chennai', option: 'full', departureDate: '11 Jun 2026', travelers: 2, amount: 65998, status: 'confirmed', bookedOn: '08 May 2026' },
  { id: 'ob6', reference: 'VYG-1QN8RX', tripId: 'goa-beaches', traveler: 'Arjun Pillai', initials: 'AP', fromCity: 'Pune', option: 'full', departureDate: '05 Jul 2026', travelers: 4, amount: 107996, status: 'completed', bookedOn: '02 Apr 2026' },
  { id: 'ob7', reference: 'VYG-4ZC5KB', tripId: 'rajasthan-royal', traveler: 'Neha Gupta', initials: 'NG', fromCity: 'Delhi', option: 'full', departureDate: '20 Aug 2026', travelers: 2, amount: 77998, status: 'cancelled', bookedOn: '28 Apr 2026' },
  { id: 'ob8', reference: 'VYG-8TR3MV', tripId: 'golden-triangle', traveler: 'Karan Singh', initials: 'KS', fromCity: 'Kolkata', option: 'full', departureDate: '14 Oct 2026', travelers: 3, amount: 149997, status: 'confirmed', bookedOn: '21 May 2026' },
]

// Only bookings for the logged-in operator's trips.
export const operatorBookings: OperatorBooking[] = allOperatorBookings.filter((b) => ownsTrip(b.tripId))

export interface Payout {
  id: string
  date: string
  amount: number
  bookings: number
  status: 'Paid' | 'Scheduled' | 'Processing'
}

export const payouts: Payout[] = [
  { id: 'p1', date: '28 May 2026', amount: 284500, bookings: 12, status: 'Scheduled' },
  { id: 'p2', date: '28 Apr 2026', amount: 412300, bookings: 18, status: 'Paid' },
  { id: 'p3', date: '28 Mar 2026', amount: 338700, bookings: 15, status: 'Paid' },
  { id: 'p4', date: '28 Feb 2026', amount: 261900, bookings: 11, status: 'Paid' },
  { id: 'p5', date: '28 Jan 2026', amount: 298400, bookings: 13, status: 'Paid' },
]

export const revenueSeries = [
  { m: 'Dec', v: 5.2 }, { m: 'Jan', v: 6.1 }, { m: 'Feb', v: 5.8 },
  { m: 'Mar', v: 7.4 }, { m: 'Apr', v: 8.9 }, { m: 'May', v: 10.2 },
]
