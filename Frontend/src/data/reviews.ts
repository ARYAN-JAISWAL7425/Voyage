import type { Review } from '@/types'

export const reviews: Review[] = [
  {
    id: 'rv1', tripId: 'golden-triangle', author: 'Ananya Iyer', initials: 'AI', rating: 5,
    date: '12 Apr 2026', title: 'A flawless first trip to North India',
    body: 'Every transfer was on time, the guide in Agra was incredibly knowledgeable, and we actually spotted a tiger on the very first Ranthambore safari! The bonfire night at the camp was the highlight for our kids.',
    helpful: 24, trip: 'Golden Triangle & Ranthambore Safari',
  },
  {
    id: 'rv2', tripId: 'golden-triangle', author: 'Rohan Mehta', initials: 'RM', rating: 5,
    date: '03 Mar 2026', title: 'Worth every rupee',
    body: 'The 5★ hotels were genuinely 5★, not the usual marketing. Sunrise at the Taj with our small group (no crowds!) is something I will never forget.',
    helpful: 18, trip: 'Golden Triangle & Ranthambore Safari',
  },
  {
    id: 'rv3', tripId: 'goa-beaches', author: 'Priya Nair', initials: 'PN', rating: 5,
    date: '28 Feb 2026', title: 'Perfect mix of beaches & culture',
    body: 'Loved that it wasn’t just party Goa — the Old Goa heritage walk and the spice plantation lunch were beautiful. South Goa stay was so peaceful.',
    helpful: 15, trip: 'Goa Beaches & Heritage Escape',
  },
  {
    id: 'rv4', tripId: 'kerala-backwaters', author: 'Vikram Sharma', initials: 'VS', rating: 4,
    date: '19 Feb 2026', title: 'Houseboat night was magical',
    body: 'Munnar tea gardens and the Alleppey houseboat were dreamy. Took off one star only because one hotel in Thekkady was a bit dated, but the team fixed our concerns quickly.',
    helpful: 11, trip: 'Kerala Backwaters & Munnar Hills',
  },
  {
    id: 'rv5', tripId: 'ladakh-himalayan', author: 'Karan Singh', initials: 'KS', rating: 5,
    date: '05 Sep 2025', title: 'Pangong at sunrise = unreal',
    body: 'Acclimatisation day in Leh made a huge difference — nobody in our group got AMS. Drivers were pros on those passes. Bucket list ticked!',
    helpful: 31, trip: 'Leh-Ladakh Himalayan Adventure',
  },
  {
    id: 'rv6', tripId: 'rajasthan-royal', author: 'Sneha Kulkarni', initials: 'SK', rating: 5,
    date: '21 Dec 2025', title: 'Felt like royalty',
    body: 'The haveli stays were stunning and the desert camp folk night under the stars was unforgettable. Our guide made the history come alive.',
    helpful: 22, trip: 'Rajasthan Royal Heritage Tour',
  },
  {
    id: 'rv7', tripId: 'goa-beaches', author: 'Arjun Pillai', initials: 'AP', rating: 5,
    date: '14 Jan 2026', title: 'Great for a friends’ group',
    body: 'Well organised but still flexible — they let us swap an afternoon for a water-sports session. Sunset cruise was a vibe.',
    helpful: 9, trip: 'Goa Beaches & Heritage Escape',
  },
  {
    id: 'rv8', tripId: 'manali-snow', author: 'Neha Gupta', initials: 'NG', rating: 4,
    date: '08 Jan 2026', title: 'Snow-filled & budget friendly',
    body: 'Solang Valley was full of snow and so much fun. The overnight Volvo is long but the price made it totally worth it.',
    helpful: 17, trip: 'Manali & Solang Snow Adventure',
  },
]

export const reviewsForTrip = (tripId: string) => reviews.filter((r) => r.tripId === tripId)
