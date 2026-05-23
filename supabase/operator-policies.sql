-- ============================================================================
-- Operator access — run AFTER schema.sql (Supabase → SQL Editor → New query)
-- Lets a logged-in operator read the bookings travelers made for THEIR trips.
-- ============================================================================

drop policy if exists "operator reads own bookings" on public.bookings;
create policy "operator reads own bookings" on public.bookings
  for select to authenticated
  using (operator_id = (select operator_id from public.profiles where id = auth.uid()));

-- ----------------------------------------------------------------------------
-- OPTIONAL (demo): link your logged-in operator account to a seeded operator
-- so My trips / Bookings show populated data. Replace the email with yours.
-- (A brand-new operator with no operator_id sees an empty dashboard — correct,
--  but this lets you see real Heritage India Tours trips + their bookings.)
-- ----------------------------------------------------------------------------
-- update public.profiles
--   set role = 'operator', operator_id = 'heritage-india'
--   where id = (select id from auth.users where email = 'YOUR_EMAIL@example.com');
