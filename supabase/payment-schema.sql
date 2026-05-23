-- ============================================================================
-- Voyago payment columns  (run in Supabase: Dashboard → SQL Editor → New query)
-- Lets the verify-payment Edge Function record which Razorpay payment/order
-- created each booking. Safe to re-run (idempotent).
-- ============================================================================
alter table public.bookings add column if not exists payment_id text;
alter table public.bookings add column if not exists order_id  text;
