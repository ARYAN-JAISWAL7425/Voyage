// Voyago — create-order Edge Function
// Creates a real Razorpay order SERVER-SIDE. The price is recomputed from the
// database (never trusted from the browser). The Razorpay secret stays here.
//
// Required secrets (Supabase → Edge Functions → Secrets):
//   RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
// (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are injected automatically.)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const { tripId, departureId, option, pax } = await req.json()
    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

    const { data: trip } = await db.from('trips').select('travel_fare').eq('id', tripId).maybeSingle()
    const { data: dep } = await db.from('departures').select('price, seats_left').eq('id', departureId).maybeSingle()
    if (!trip || !dep) return json({ error: 'Trip or departure not found' }, 404)

    // Block overbooking: the departure must still have enough seats for this group.
    const wanted = Math.max(1, Number(pax) || 1)
    const seatsLeft = dep.seats_left ?? 0
    if (seatsLeft < wanted) {
      return json({ error: seatsLeft === 0 ? 'Sorry, this departure is sold out.' : `Only ${seatsLeft} seat${seatsLeft === 1 ? '' : 's'} left on this departure.` }, 409)
    }

    const fare = trip.travel_fare ?? 0
    const unit = option === 'land' ? Math.max((dep.price ?? 0) - fare, 0) : (dep.price ?? 0)
    const base = unit * wanted
    const total = base + Math.round(base * 0.05) // + 5% GST

    const keyId = Deno.env.get('RAZORPAY_KEY_ID')!
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')!
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: total * 100, currency: 'INR', receipt: `vyg_${Date.now()}` }),
    })
    const order = await res.json()
    if (!res.ok) return json({ error: order?.error?.description ?? 'Razorpay order failed' }, 400)

    return json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})
