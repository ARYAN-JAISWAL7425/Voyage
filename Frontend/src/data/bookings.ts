import type { Booking } from '@/types'

export const bookings: Booking[] = [
  {
    id: 'bk1', reference: 'VYG-7F3K9A', tripId: 'golden-triangle', travelerName: 'Aarav Sharma',
    status: 'confirmed', departureDate: '12 Sep 2026', travelers: 2, amount: 99998, bookedOn: '02 May 2026',
  },
  {
    id: 'bk2', reference: 'VYG-2M8QJ1', tripId: 'goa-beaches', travelerName: 'Aarav Sharma',
    status: 'pending', departureDate: '05 Jul 2026', travelers: 3, amount: 80997, bookedOn: '18 May 2026',
  },
  {
    id: 'bk3', reference: 'VYG-9XB4LP', tripId: 'kerala-backwaters', travelerName: 'Aarav Sharma',
    status: 'completed', departureDate: '11 Jan 2026', travelers: 2, amount: 65998, bookedOn: '20 Nov 2025',
  },
  {
    id: 'bk4', reference: 'VYG-5KD0ZR', tripId: 'ladakh-himalayan', travelerName: 'Aarav Sharma',
    status: 'cancelled', departureDate: '18 Jul 2025', travelers: 1, amount: 34999, bookedOn: '01 May 2025',
  },
]

export const bookingById = (id: string) => bookings.find((b) => b.id === id)
