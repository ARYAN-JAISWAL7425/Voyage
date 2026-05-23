-- ============================================================================
-- Operator write access — run AFTER schema.sql + operator-policies.sql.
-- Lets operators self-onboard (become_operator) and publish their own trips.
-- ============================================================================

-- 1) Self-onboard: create an operators row + link it to the caller's profile.
--    SECURITY DEFINER so it can insert/link atomically without broad RLS grants.
create or replace function public.become_operator(
  business_name text,
  business_location text default null,
  business_about text default null
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id text;
  new_initials text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  new_id := lower(left(regexp_replace(coalesce(nullif(business_name, ''), 'operator'), '[^a-zA-Z0-9]+', '-', 'g'), 36))
            || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);
  new_initials := upper(left(regexp_replace(coalesce(business_name, 'OP'), '[^a-zA-Z]', '', 'g'), 2));

  insert into public.operators (id, name, initials, verified, status, location, about, since)
  values (new_id,
          coalesce(nullif(business_name, ''), 'My Travel Co'),
          coalesce(nullif(new_initials, ''), 'OP'),
          false, 'pending', business_location, business_about,
          extract(year from now())::int);

  update public.profiles set role = 'operator', operator_id = new_id where id = auth.uid();
  return new_id;
end;
$$;

-- 2) Operators manage their own trips + departures.
drop policy if exists "operator inserts own trips" on public.trips;
create policy "operator inserts own trips" on public.trips
  for insert to authenticated
  with check (operator_id = (select operator_id from public.profiles where id = auth.uid()));

drop policy if exists "operator updates own trips" on public.trips;
create policy "operator updates own trips" on public.trips
  for update to authenticated
  using (operator_id = (select operator_id from public.profiles where id = auth.uid()));

drop policy if exists "operator inserts own departures" on public.departures;
create policy "operator inserts own departures" on public.departures
  for insert to authenticated
  with check (trip_id in (select id from public.trips where operator_id = (select operator_id from public.profiles where id = auth.uid())));

-- 3) Operators can edit their own business profile (Settings page).
drop policy if exists "operator updates own operator" on public.operators;
create policy "operator updates own operator" on public.operators
  for update to authenticated
  using (id = (select operator_id from public.profiles where id = auth.uid()));
