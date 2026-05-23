import type { Operator } from '@/types'

export const operators: Operator[] = [
  {
    id: 'coastal-goa',
    name: 'Coastal Goa Tours',
    verified: true,
    initials: 'CG',
    rating: 4.8,
    reviewCount: 1240,
    tripsCount: 32,
    since: 2016,
    responseTime: 'within 2 hours',
    location: 'Panaji, Goa',
    about:
      'Goa-based specialists in beach, heritage and nightlife experiences. Small groups, local guides and hand-picked sea-facing stays.',
  },
  {
    id: 'kerala-escapes',
    name: 'Kerala Escapes',
    verified: true,
    initials: 'KE',
    rating: 4.9,
    reviewCount: 980,
    tripsCount: 28,
    since: 2014,
    responseTime: 'within 1 hour',
    location: 'Kochi, Kerala',
    about:
      'Backwater cruises, hill-station retreats and Ayurveda journeys across God’s Own Country, run by a team of native Malayali hosts.',
  },
  {
    id: 'heritage-india',
    name: 'Heritage India Tours',
    verified: true,
    initials: 'HI',
    rating: 4.9,
    reviewCount: 2030,
    tripsCount: 54,
    since: 2009,
    responseTime: 'within 3 hours',
    location: 'Jaipur, Rajasthan',
    about:
      'India’s heritage circuit experts since 2009 — palaces, forts, wildlife safaris and the Golden Triangle, with certified historian guides.',
  },
  {
    id: 'himalayan-trails',
    name: 'Himalayan Trails',
    verified: true,
    initials: 'HT',
    rating: 4.7,
    reviewCount: 760,
    tripsCount: 21,
    since: 2015,
    responseTime: 'within 4 hours',
    location: 'Leh, Ladakh',
    about:
      'High-altitude adventure outfit running treks, motorbike expeditions and acclimatised road trips across Ladakh and the greater Himalayas.',
  },
  {
    id: 'deccan-trails',
    name: 'Deccan Trails',
    verified: true,
    initials: 'DT',
    rating: 4.6,
    reviewCount: 410,
    tripsCount: 18,
    since: 2018,
    responseTime: 'within 2 hours',
    location: 'Hospet, Karnataka',
    about:
      'Cultural and ruins-focused journeys through the Deccan — Hampi, Badami and Karnataka’s UNESCO heritage, led by archaeology buffs.',
  },
  {
    id: 'royal-rajasthan',
    name: 'Royal Rajasthan Journeys',
    verified: true,
    initials: 'RR',
    rating: 4.8,
    reviewCount: 1320,
    tripsCount: 39,
    since: 2011,
    responseTime: 'within 2 hours',
    location: 'Udaipur, Rajasthan',
    about:
      'Boutique luxury journeys through Rajasthan’s lake cities and desert — heritage haveli stays, vintage car transfers and private dining.',
  },
  {
    id: 'island-voyages',
    name: 'Island Voyages',
    verified: true,
    initials: 'IV',
    rating: 4.7,
    reviewCount: 530,
    tripsCount: 15,
    since: 2017,
    responseTime: 'within 5 hours',
    location: 'Port Blair, Andaman',
    about:
      'Andaman & Nicobar island specialists — scuba diving, island hopping and secluded beach stays with PADI-certified dive masters.',
  },
]

export const operatorById = (id: string) => operators.find((o) => o.id === id)
