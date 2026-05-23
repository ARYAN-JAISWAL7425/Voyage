/**
 * Seeds Supabase with our existing mock catalog (operators, trips, departures, reviews).
 * Reuses the app's mock data directly — no retyping. Run AFTER schema.sql.
 *
 *   1. Create Frontend/.env.seed (see .env.seed.example) with your Project URL + service_role key
 *   2. npm run seed
 *
 * Check the mapping without touching the DB:  npm run seed:dry
 * NOTE: the service_role key bypasses RLS — keep .env.seed private; it is never bundled
 * into the browser app (only VITE_-prefixed vars are).
 */
import { createClient } from '@supabase/supabase-js'
import { operators } from '../src/data/operators.ts'
import { trips } from '../src/data/trips.ts'
import { reviews } from '../src/data/reviews.ts'

const dry = process.argv.includes('--dry')

const operatorRows = operators.map((o) => ({
  id: o.id,
  name: o.name,
  initials: o.initials,
  verified: o.verified,
  status: o.verified ? 'verified' : 'pending',
  rating: o.rating,
  review_count: o.reviewCount,
  trips_count: o.tripsCount,
  since: o.since,
  response_time: o.responseTime,
  location: o.location,
  about: o.about,
}))

const tripRows = trips.map((t) => ({
  id: t.id,
  slug: t.slug,
  title: t.title,
  destination: t.destination,
  location: t.location,
  region: t.region,
  operator_id: t.operatorId,
  image: t.image,
  gallery: t.gallery,
  departure_cities: t.departureCities,
  price: t.price,
  original_price: t.originalPrice ?? null,
  travel_fare: t.travelFare,
  travel_included: t.travelIncluded ?? true,
  duration_days: t.durationDays,
  nights: t.nights,
  max_group: t.maxGroup,
  transport: t.transport,
  transport_icon: t.transportIcon,
  seats_left: t.seatsLeft,
  rating: t.rating,
  review_count: t.reviewCount,
  badge: t.badge ?? null,
  featured: t.featured ?? false,
  category: t.category,
  pace: t.pace,
  summary: t.summary,
  description: t.description,
  highlights: t.highlights,
  included: t.included,
  excluded: t.excluded,
  itinerary: t.itinerary,
}))

const departureRows = trips.flatMap((t) =>
  t.departures.map((d) => ({ id: d.id, trip_id: t.id, date: d.date, price: d.price, seats_left: d.seatsLeft })),
)

const reviewRows = reviews.map((r) => ({
  id: r.id,
  trip_id: r.tripId,
  author: r.author,
  initials: r.initials,
  rating: r.rating,
  date: r.date,
  title: r.title,
  body: r.body,
  helpful: r.helpful,
}))

const tables = [
  ['operators', operatorRows],
  ['trips', tripRows],
  ['departures', departureRows],
  ['reviews', reviewRows],
]

if (dry) {
  for (const [name, rows] of tables) console.log(`• ${name}: ${rows.length} rows ready`)
  console.log('Dry run OK — mock data maps cleanly. Add .env.seed and run `npm run seed`.')
  process.exit(0)
}

const url = process.env.SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE
if (!url || !serviceRole) {
  console.error('Missing env. Create Frontend/.env.seed with SUPABASE_URL and SUPABASE_SERVICE_ROLE, then run `npm run seed`.')
  process.exit(1)
}

const db = createClient(url, serviceRole, { auth: { persistSession: false } })

async function run() {
  for (const [name, rows] of tables) {
    const { error } = await db.from(name).upsert(rows, { onConflict: 'id' })
    if (error) {
      console.error(`✗ ${name}: ${error.message}`)
      process.exit(1)
    }
    console.log(`✓ ${name}: ${rows.length} rows`)
  }
  console.log('✅ Seed complete — your Supabase now has the full catalog.')
}
run()
