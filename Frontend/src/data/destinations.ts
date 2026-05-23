import type { Destination } from '@/types'

const img = (id: string) => `https://images.unsplash.com/${id}?w=600&q=80`

export const destinations: Destination[] = [
  { id: 'goa', name: 'Goa', region: 'West India', image: img('photo-1512343879784-a960bf40e7f2'), tripsCount: 420 },
  { id: 'jaipur', name: 'Jaipur, Rajasthan', region: 'North India', image: img('photo-1477587458883-47145ed94245'), tripsCount: 310 },
  { id: 'kerala', name: 'Kerala', region: 'South India', image: img('photo-1602216056096-3b40cc0c9944'), tripsCount: 385 },
  { id: 'ladakh', name: 'Leh-Ladakh', region: 'North India', image: img('photo-1581791534721-e599df4417f7'), tripsCount: 190 },
  { id: 'agra', name: 'Agra', region: 'North India', image: img('photo-1564507592333-c60657eea523'), tripsCount: 265 },
  { id: 'hampi', name: 'Hampi', region: 'South India', image: img('photo-1605640840605-14ac1855827b'), tripsCount: 210 },
  { id: 'udaipur', name: 'Udaipur', region: 'North India', image: img('photo-1524492412937-b28074a5d7da'), tripsCount: 175 },
  { id: 'andaman', name: 'Andaman', region: 'Islands', image: img('photo-1507525428034-b723cf961d3e'), tripsCount: 140 },
  { id: 'manali', name: 'Manali', region: 'North India', image: img('photo-1581791534721-e599df4417f7'), tripsCount: 230 },
]
