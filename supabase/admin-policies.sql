-- ============================================================================
-- Voyago ADMIN policies  (run in Supabase: Dashboard → SQL Editor → New query)
-- Grants platform-wide READ to admins + lets admins moderate operators.
-- Safe to re-run (idempotent).
-- ============================================================================

-- ── is_admin(): true when the current user's profile role = 'admin'.
--    SECURITY DEFINER so it reads profiles WITHOUT triggering RLS (no recursion).
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ── Admins can read EVERY booking (platform-wide). Added alongside the
--    existing "own bookings read" / "operator reads own bookings" policies (OR'd).
drop policy if exists "admin reads all bookings" on public.bookings;
create policy "admin reads all bookings" on public.bookings
  for select using (public.is_admin());

-- ── Admins can read EVERY profile (the Users page).
drop policy if exists "admin reads all profiles" on public.profiles;
create policy "admin reads all profiles" on public.profiles
  for select using (public.is_admin());

-- ── Admins can moderate operators (verify / suspend / reinstate).
drop policy if exists "admin updates operators" on public.operators;
create policy "admin updates operators" on public.operators
  for update using (public.is_admin()) with check (public.is_admin());

-- ── Admins can delete any trip/listing. Departures + reviews cascade away
--    automatically (FK on delete cascade); bookings are kept (trip_id set null).
drop policy if exists "admin deletes trips" on public.trips;
create policy "admin deletes trips" on public.trips
  for delete using (public.is_admin());

-- ── Store email on profiles so the admin Users page can show it.
--    profiles is 1:1 with auth.users; the trigger below fills it on signup.
alter table public.profiles add column if not exists email text;

-- ── Re-create the signup trigger to ALSO capture email (was: full_name only).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Sync seeded operators: the seed set `verified` but left `status` at its
--    'pending' default, so verified partners would wrongly show as pending.
update public.operators set status = 'verified'
where verified is true and status <> 'verified';

-- ════════════════════════════════════════════════════════════════════════════
-- ONE-TIME — make YOUR account an admin so you can sign into the admin panel.
-- 1) Sign up through the MAIN app first (creates the auth user + profile).
-- 2) Put your email below, uncomment, and run this line:
-- ════════════════════════════════════════════════════════════════════════════
-- update public.profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'aryandivyansh1234@gmail.com');
