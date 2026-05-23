import type { IconName } from '@/components/ui/Icon'

export interface Operator {
  id: string
  name: string
  verified: boolean
  initials: string
  rating: number
  reviewCount: number
  tripsCount: number
  since: number
  responseTime: string
  location: string
  about: string
}

export interface ItineraryDay {
  day: number
  title: string
  description: string
  stay?: string
  meals?: string[]
}

export interface Departure {
  id: string
  date: string
  endDate: string
  seatsLeft: number
  price: number
  status: 'available' | 'filling' | 'soldout'
}

export interface Trip {
  id: string
  slug: string
  title: string
  destination: string
  location: string
  region: string
  departureCities: string[]
  operatorId: string
  operatorName?: string
  image: string
  gallery: string[]
  price: number
  originalPrice?: number
  travelFare: number
  travelIncluded?: boolean
  durationDays: number
  nights: number
  maxGroup: number
  transport: string
  transportIcon: IconName
  seatsLeft: number
  rating: number
  reviewCount: number
  badge?: { label: string; icon: IconName }
  featured?: boolean
  category: string
  pace: string
  summary: string
  description: string
  highlights: string[]
  included: string[]
  excluded: string[]
  itinerary: ItineraryDay[]
  departures: Departure[]
}

export interface Review {
  id: string
  tripId: string
  author: string
  initials: string
  avatarColor?: string
  rating: number
  date: string
  title: string
  body: string
  helpful: number
  trip?: string
}

export interface Destination {
  id: string
  name: string
  region: string
  image: string
  tripsCount: number
}

export interface Category {
  id: string
  name: string
  icon: IconName
  tone: 'brand' | 'accent' | 'success' | 'danger' | 'info'
  tripsCount: number
}

export interface Booking {
  id: string
  reference: string
  tripId: string
  travelerName: string
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled'
  departureDate: string
  travelers: number
  amount: number
  bookedOn: string
}
