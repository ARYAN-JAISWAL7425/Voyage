// Platform-wide mock data for the Voyago admin console.
// The admin sees EVERY operator, listing, booking and payment (unlike the
// operator dashboard, which is scoped to one login). Frontend-only — replaced
// by real aggregate API queries when the backend lands.

export const platformStats = {
  gmv: 33700000, // gross merchandise value (₹3.37 Cr)
  bookings: 1284,
  operators: 8, // active verified operators
  travelers: 9420,
  commission: 3370000, // Voyago's 10% cut (₹33.7 L)
}

export const gmvSeries = [
  { m: 'Dec', v: 38 }, { m: 'Jan', v: 44 }, { m: 'Feb', v: 41 },
  { m: 'Mar', v: 53 }, { m: 'Apr', v: 61 }, { m: 'May', v: 72 },
] // ₹ lakh per month

export type OperatorStatus = 'verified' | 'pending' | 'suspended'

export interface AdminOperator {
  id: string
  name: string
  initials: string
  location: string
  status: OperatorStatus
  trips: number
  gmv: number
  rating: number | null
  joined: string
}

export const operators: AdminOperator[] = [
  { id: 'spiti-valley', name: 'Spiti Valley Expeditions', initials: 'SV', location: 'Kaza, Himachal', status: 'pending', trips: 0, gmv: 0, rating: null, joined: '21 May 2026' },
  { id: 'sundarbans-eco', name: 'Sundarbans Eco Tours', initials: 'SE', location: 'Kolkata, WB', status: 'pending', trips: 0, gmv: 0, rating: null, joined: '20 May 2026' },
  { id: 'northeast-trails', name: 'Northeast Trails Co', initials: 'NT', location: 'Guwahati, Assam', status: 'pending', trips: 0, gmv: 0, rating: null, joined: '18 May 2026' },
  { id: 'heritage-india', name: 'Heritage India Tours', initials: 'HI', location: 'Jaipur, Rajasthan', status: 'verified', trips: 12, gmv: 8740000, rating: 4.9, joined: 'Mar 2009' },
  { id: 'kerala-escapes', name: 'Kerala Escapes', initials: 'KE', location: 'Kochi, Kerala', status: 'verified', trips: 9, gmv: 5360000, rating: 4.9, joined: 'Feb 2014' },
  { id: 'royal-rajasthan', name: 'Royal Rajasthan Journeys', initials: 'RR', location: 'Udaipur, Rajasthan', status: 'verified', trips: 10, gmv: 6210000, rating: 4.8, joined: 'Nov 2011' },
  { id: 'coastal-goa', name: 'Coastal Goa Tours', initials: 'CG', location: 'Panaji, Goa', status: 'verified', trips: 8, gmv: 4120000, rating: 4.8, joined: 'Jun 2016' },
  { id: 'himalayan-trails', name: 'Himalayan Trails', initials: 'HT', location: 'Leh, Ladakh', status: 'verified', trips: 7, gmv: 3980000, rating: 4.7, joined: 'Aug 2015' },
  { id: 'island-voyages', name: 'Island Voyages', initials: 'IV', location: 'Port Blair, Andaman', status: 'verified', trips: 6, gmv: 2730000, rating: 4.7, joined: 'May 2017' },
  { id: 'deccan-trails', name: 'Deccan Trails', initials: 'DT', location: 'Hospet, Karnataka', status: 'verified', trips: 5, gmv: 1840000, rating: 4.6, joined: 'Jan 2018' },
  { id: 'quick-cab', name: 'Quick Cab Holidays', initials: 'QC', location: 'Delhi NCR', status: 'suspended', trips: 3, gmv: 290000, rating: 3.4, joined: 'Sep 2023' },
]

export type ListingStatus = 'pending' | 'published' | 'rejected'

export interface AdminListing {
  id: string
  title: string
  operator: string
  location: string
  price: number
  status: ListingStatus
  submitted: string
}

export const listings: AdminListing[] = [
  { id: 'l1', title: '5-Day Spiti Valley Circuit', operator: 'Spiti Valley Expeditions', location: 'Spiti, Himachal', price: 28999, status: 'pending', submitted: '21 May 2026' },
  { id: 'l2', title: '3-Day Sundarbans Tiger Safari', operator: 'Sundarbans Eco Tours', location: 'Sundarbans, WB', price: 18999, status: 'pending', submitted: '20 May 2026' },
  { id: 'l3', title: '7-Day Meghalaya & Kaziranga Wildlife', operator: 'Northeast Trails Co', location: 'Shillong, Meghalaya', price: 34999, status: 'pending', submitted: '19 May 2026' },
  { id: 'l4', title: '6-Day Goa Beaches & Heritage Escape', operator: 'Coastal Goa Tours', location: 'Goa', price: 26999, status: 'published', submitted: '02 May 2026' },
  { id: 'l5', title: '8-Day Rajasthan Royal Heritage Tour', operator: 'Heritage India Tours', location: 'Jaipur', price: 38999, status: 'published', submitted: '28 Apr 2026' },
  { id: 'l6', title: '2-Day Budget Manali Quick Trip', operator: 'Quick Cab Holidays', location: 'Manali', price: 4999, status: 'rejected', submitted: '14 May 2026' },
]

export type BookingStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled'

export interface AdminBooking {
  id: string
  reference: string
  traveler: string
  operator: string
  trip: string
  amount: number
  commission: number
  status: BookingStatus
  date: string
}

export const platformBookings: AdminBooking[] = [
  { id: 'b1', reference: 'VYG-7F3K9A', traveler: 'Aarav Sharma', operator: 'Heritage India Tours', trip: 'Golden Triangle & Ranthambore Safari', amount: 99998, commission: 10000, status: 'confirmed', date: '21 May 2026' },
  { id: 'b2', reference: 'VYG-2M8QJ1', traveler: 'Priya Nair', operator: 'Coastal Goa Tours', trip: 'Goa Beaches & Heritage Escape', amount: 80997, commission: 8100, status: 'pending', date: '20 May 2026' },
  { id: 'b3', reference: 'VYG-9XB4LP', traveler: 'Rohan Mehta', operator: 'Heritage India Tours', trip: 'Rajasthan Royal Heritage Tour', amount: 77998, commission: 7800, status: 'confirmed', date: '20 May 2026' },
  { id: 'b4', reference: 'VYG-6PL2WD', traveler: 'Vikram Sharma', operator: 'Kerala Escapes', trip: 'Kerala Backwaters & Munnar Hills', amount: 65998, commission: 6600, status: 'confirmed', date: '19 May 2026' },
  { id: 'b5', reference: 'VYG-8TR3MV', traveler: 'Karan Singh', operator: 'Heritage India Tours', trip: 'Golden Triangle & Ranthambore Safari', amount: 149997, commission: 15000, status: 'confirmed', date: '19 May 2026' },
  { id: 'b6', reference: 'VYG-1QN8RX', traveler: 'Arjun Pillai', operator: 'Coastal Goa Tours', trip: 'Goa Beaches & Heritage Escape', amount: 107996, commission: 10800, status: 'completed', date: '18 May 2026' },
  { id: 'b7', reference: 'VYG-5KD0ZR', traveler: 'Neha Gupta', operator: 'Royal Rajasthan Journeys', trip: 'Udaipur Lakes & Palaces Luxury', amount: 109998, commission: 11000, status: 'pending', date: '18 May 2026' },
  { id: 'b8', reference: 'VYG-3HJ7TQ', traveler: 'Sneha Kulkarni', operator: 'Himalayan Trails', trip: 'Leh-Ladakh Himalayan Adventure', amount: 69998, commission: 7000, status: 'cancelled', date: '16 May 2026' },
]

export type DisputeStatus = 'open' | 'resolved' | 'refunded'

export interface Dispute {
  id: string
  reference: string
  traveler: string
  operator: string
  trip: string
  reason: string
  amount: number
  status: DisputeStatus
  opened: string
}

export const disputes: Dispute[] = [
  { id: 'd1', reference: 'VYG-2M8QJ1', traveler: 'Priya Nair', operator: 'Coastal Goa Tours', trip: 'Goa Beaches & Heritage Escape', reason: 'Hotel downgraded without notice', amount: 80997, status: 'open', opened: '21 May 2026' },
  { id: 'd2', reference: 'VYG-0XK4WP', traveler: 'Manish Verma', operator: 'Quick Cab Holidays', trip: 'Budget Manali Quick Trip', reason: 'Trip cancelled by operator, no refund', amount: 14998, status: 'open', opened: '20 May 2026' },
  { id: 'd3', reference: 'VYG-7HB2LM', traveler: 'Divya Rao', operator: 'Himalayan Trails', trip: 'Leh-Ladakh Himalayan Adventure', reason: 'Itinerary changed mid-trip', amount: 69998, status: 'resolved', opened: '08 May 2026' },
  { id: 'd4', reference: 'VYG-4ZC5KB', traveler: 'Imran Khan', operator: 'Quick Cab Holidays', trip: 'Budget Manali Quick Trip', reason: 'Guide never showed up', amount: 9998, status: 'refunded', opened: '02 May 2026' },
  { id: 'd5', reference: 'VYG-9PT1RD', traveler: 'Lakshmi Menon', operator: 'Deccan Trails', trip: 'Hampi Heritage Ruins Trail', reason: 'Overcharged for add-ons', amount: 16999, status: 'resolved', opened: '28 Apr 2026' },
]

export type PayoutStatus = 'Due' | 'Processing' | 'Paid'

export interface AdminPayout {
  id: string
  operator: string
  initials: string
  amount: number
  bookings: number
  status: PayoutStatus
  scheduled: string
}

export const payouts: AdminPayout[] = [
  { id: 'po1', operator: 'Heritage India Tours', initials: 'HI', amount: 284500, bookings: 12, status: 'Due', scheduled: '28 May 2026' },
  { id: 'po2', operator: 'Kerala Escapes', initials: 'KE', amount: 198400, bookings: 9, status: 'Due', scheduled: '28 May 2026' },
  { id: 'po3', operator: 'Royal Rajasthan Journeys', initials: 'RR', amount: 231900, bookings: 8, status: 'Processing', scheduled: '24 May 2026' },
  { id: 'po4', operator: 'Coastal Goa Tours', initials: 'CG', amount: 156700, bookings: 7, status: 'Paid', scheduled: '21 Apr 2026' },
  { id: 'po5', operator: 'Himalayan Trails', initials: 'HT', amount: 142300, bookings: 6, status: 'Paid', scheduled: '21 Apr 2026' },
]

export type UserStatus = 'active' | 'suspended'

export interface AdminUser {
  id: string
  name: string
  initials: string
  email: string
  role: 'Traveler' | 'Operator'
  joined: string
  bookings: number
  status: UserStatus
}

export const users: AdminUser[] = [
  { id: 'u1', name: 'Aarav Sharma', initials: 'AS', email: 'aarav.sharma@email.com', role: 'Traveler', joined: 'Jan 2024', bookings: 4, status: 'active' },
  { id: 'u2', name: 'Priya Nair', initials: 'PN', email: 'priya.nair@email.com', role: 'Traveler', joined: 'Mar 2024', bookings: 6, status: 'active' },
  { id: 'u3', name: 'Rohan Mehta', initials: 'RM', email: 'rohan.mehta@email.com', role: 'Traveler', joined: 'Aug 2024', bookings: 2, status: 'active' },
  { id: 'u4', name: 'Heritage India Tours', initials: 'HI', email: 'partner@heritageindia.in', role: 'Operator', joined: 'Mar 2009', bookings: 142, status: 'active' },
  { id: 'u5', name: 'Sneha Kulkarni', initials: 'SK', email: 'sneha.k@email.com', role: 'Traveler', joined: 'Nov 2025', bookings: 1, status: 'active' },
  { id: 'u6', name: 'Manish Verma', initials: 'MV', email: 'manish.verma@email.com', role: 'Traveler', joined: 'Feb 2025', bookings: 3, status: 'suspended' },
  { id: 'u7', name: 'Quick Cab Holidays', initials: 'QC', email: 'ops@quickcab.in', role: 'Operator', joined: 'Sep 2023', bookings: 3, status: 'suspended' },
]
