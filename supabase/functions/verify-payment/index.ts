// Voyago — verify-payment Edge Function
// Verifies Razorpay's signature with the secret (proves the payment is real),
// then creates the booking SERVER-SIDE (so a paid booking can't be forged).
// The amount + operator are recomputed from the DB, not trusted from the client.
//
// Required secrets: RAZORPAY_KEY_SECRET
// (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY are injected.)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

async function hmacHex(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const body = await req.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tripId, departureId, option, pax, fromCity, travelerName } = body

    // 1. Verify the signature — the cryptographic proof the payment is genuine.
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')!
    const expected = await hmacHex(`${razorpay_order_id}|${razorpay_payment_id}`, keySecret)
    if (expected !== razorpay_signature) return json({ error: 'Invalid payment signature' }, 400)

    // 2. Identify the buyer from their JWT (forwarded by the browser).
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } },
    )
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return json({ error: 'Not signed in' }, 401)

    // 3. Recompute price + operator from the DB (don't trust the client's numbers).
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { data: trip } = await admin.from('trips').select('operator_id, travel_fare').eq('id', tripId).maybeSingle()
    const { data: dep } = await admin.from('departures').select('price, seats_left').eq('id', departureId).maybeSingle()
    if (!trip || !dep) return json({ error: 'Trip or departure not found' }, 404)

    // Re-check seats at confirmation time (one may have gone since the order was created).
    const wanted = Math.max(1, Number(pax) || 1)
    const seatsLeft = dep.seats_left ?? 0
    if (seatsLeft < wanted) {
      return json({ error: 'This departure sold out before your payment completed — you have not been seated. Please contact support for a refund.' }, 409)
    }

    const fare = trip.travel_fare ?? 0
    const unit = option === 'land' ? Math.max((dep.price ?? 0) - fare, 0) : (dep.price ?? 0)
    const base = unit * wanted
    const total = base + Math.round(base * 0.05)

    // 4. Create the booking (service role — bypasses RLS, but user_id is the verified user).
    const reference = 'VYG-' + Math.random().toString(36).slice(2, 8).toUpperCase()
    const { error } = await admin.from('bookings').insert({
      reference,
      user_id: user.id,
      trip_id: tripId,
      departure_id: departureId,
      operator_id: trip.operator_id,
      traveler_name: travelerName ?? null,
      from_city: fromCity ?? null,
      option: option === 'land' ? 'land' : 'full',
      travelers: wanted,
      amount: total,
      status: 'confirmed',
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
    })
    if (error) return json({ error: error.message }, 400)

    // 5. Decrease the departure's remaining seats now that the booking exists.
    await admin.from('departures').update({ seats_left: seatsLeft - wanted }).eq('id', departureId)

    return json({ reference })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})
