/**
 * Razorpay payments — SECURE flow via Supabase Edge Functions.
 *
 *   1. create-order  (server) → makes a real Razorpay order, price computed from the DB
 *   2. Razorpay modal (browser) → user pays, returns a signature
 *   3. verify-payment (server) → verifies the signature with the secret key, then
 *      creates the booking. The browser never sees the secret and can't forge a paid booking.
 *
 * The browser only holds the public Key ID (VITE_RAZORPAY_KEY_ID); the secret lives
 * in the Edge Function secrets.
 */
import { supabase } from '@/lib/supabase'

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  order_id?: string
  name: string
  description?: string
  prefill?: { name?: string; email?: string; contact?: string }
  notes?: Record<string, string>
  theme?: { color?: string }
  handler?: (response: { razorpay_payment_id: string; razorpay_order_id?: string; razorpay_signature?: string }) => void
  modal?: { ondismiss?: () => void }
}

interface RazorpayInstance {
  open: () => void
  on: (event: string, handler: (response: unknown) => void) => void
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}

/** True when a Razorpay Key ID is set in .env.local. When false, Checkout falls back to a direct (unpaid) booking. */
export const isRazorpayConfigured = Boolean(import.meta.env.VITE_RAZORPAY_KEY_ID)

let scriptPromise: Promise<boolean> | null = null

/** Lazy-load the Razorpay checkout script once. */
function loadRazorpay(): Promise<boolean> {
  if (typeof window !== 'undefined' && window.Razorpay) return Promise.resolve(true)
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve) => {
      const s = document.createElement('script')
      s.src = 'https://checkout.razorpay.com/v1/checkout.js'
      s.onload = () => resolve(true)
      s.onerror = () => resolve(false)
      document.body.appendChild(s)
    })
  }
  return scriptPromise
}

export interface BookingDraft {
  tripId: string
  departureId: string
  option: 'full' | 'land'
  pax: number
  fromCity: string
  travelerName: string
}

export interface PaymentArgs {
  draft: BookingDraft
  description: string
  prefill: { name?: string; email?: string }
  /** Called with the booking reference after the payment is verified server-side. */
  onSuccess: (reference: string) => void
  onDismiss: () => void
  onError: (message: string) => void
}

/**
 * supabase.functions.invoke only surfaces a generic "non-2xx status code"
 * message. The Edge Function's real { error: "..." } is in the response body —
 * dig it out so the user (and we) can see what actually went wrong.
 */
async function functionErrorMessage(err: unknown, fallback: string): Promise<string> {
  const ctx = (err as { context?: unknown } | null)?.context
  if (ctx instanceof Response) {
    try {
      const body = await ctx.clone().json()
      if (body && typeof body.error === 'string') return body.error
    } catch { /* body wasn't JSON */ }
  }
  return (err as { message?: string } | null)?.message || fallback
}

/** Run the full secure payment + booking flow. */
export async function startRazorpayPayment(args: PaymentArgs): Promise<void> {
  if (!supabase) {
    args.onError('Not connected to Supabase.')
    return
  }

  // 1. Create the order server-side (price is recomputed from the DB there).
  const { data: order, error: orderErr } = await supabase.functions.invoke<{
    orderId: string; amount: number; currency: string; keyId: string
  }>('create-order', {
    body: { tripId: args.draft.tripId, departureId: args.draft.departureId, option: args.draft.option, pax: args.draft.pax },
  })
  if (orderErr || !order?.orderId) {
    args.onError(await functionErrorMessage(orderErr, 'Could not start payment. Make sure the create-order function is deployed.'))
    return
  }

  // 2. Load Razorpay + open the modal bound to that order.
  const ok = await loadRazorpay()
  if (!ok) {
    args.onError('Could not load Razorpay. Check your connection and try again.')
    return
  }

  const rzp = new window.Razorpay({
    key: order.keyId || (import.meta.env.VITE_RAZORPAY_KEY_ID as string),
    amount: order.amount,
    currency: order.currency,
    order_id: order.orderId,
    name: 'Voyago',
    description: args.description,
    prefill: args.prefill,
    theme: { color: '#0E8C84' },
    handler: (response) => { void verifyAndFinish(response, args) },
    modal: { ondismiss: args.onDismiss },
  })
  rzp.on('payment.failed', () => args.onError('Payment failed or was cancelled. Please try again.'))
  rzp.open()
}

/** Step 3: send the payment signature to the server to verify + create the booking. */
async function verifyAndFinish(
  response: { razorpay_payment_id: string; razorpay_order_id?: string; razorpay_signature?: string },
  args: PaymentArgs,
): Promise<void> {
  if (!supabase) {
    args.onError('Not connected to Supabase.')
    return
  }
  const { data, error } = await supabase.functions.invoke<{ reference: string }>('verify-payment', {
    body: {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      tripId: args.draft.tripId,
      departureId: args.draft.departureId,
      option: args.draft.option,
      pax: args.draft.pax,
      fromCity: args.draft.fromCity,
      travelerName: args.draft.travelerName,
    },
  })
  if (error || !data?.reference) {
    args.onError(await functionErrorMessage(error, 'Payment captured but could not be verified. Please contact support with your payment id.'))
    return
  }
  args.onSuccess(data.reference)
}
