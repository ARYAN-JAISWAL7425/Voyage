-- ============================================================================
-- Voyago database schema  (run in Supabase: Dashboard → SQL Editor → New query)
-- Safe to re-run. Catalog tables are public-read; bookings/profiles are per-user.
-- Seeding is done with the service_role key, which BYPASSES the RLS below.
-- ============================================================================

-- ───────────────────────────── operators ─────────────────────────────
create table if not exists public.operators (
  id            text primary key,
  name          text not null,
  initials      text,
  verified      boolean not null default false,
  status        text not null default 'pending' check (status in ('pending','verified','suspended')),
  rating        numeric(2,1),
  review_count  int default 0,
  trips_count   int default 0,
  since         int,
  response_time text,
  location      text,
  about         text,
  created_at    timestamptz not null default now()
);

-- ───────────────────────────── trips ─────────────────────────────
create table if not exists public.trips (
  id               text primary key,
  slug             text unique not null,
  title            text not null,
  destination      text,
  location         text,
  region           text,
  operator_id      text references public.operators (id) on delete set null,
  image            text,
  gallery          text[] default '{}',
  departure_cities text[] default '{}',
  price            int not null,
  original_price   int,
  travel_fare      int default 0,
  travel_included  boolean not null default true,
  duration_days    int,
  nights           int,
  max_group        int,
  transport        text,
  transport_icon   text,
  seats_left       int,
  rating           numeric(2,1),
  review_count     int default 0,
  badge            jsonb,
  featured         boolean not null default false,
  category         text,
  pace             text,
  summary          text,
  description      text,
  highlights       text[] default '{}',
  included         text[] default '{}',
  excluded         text[] default '{}',
  itinerary        jsonb default '[]',
  created_at       timestamptz not null default now()
);

-- ───────────────────────────── departures ─────────────────────────────
create table if not exists public.departures (
  id         text primary key,
  trip_id    text not null references public.trips (id) on delete cascade,
  date       text,
  price      int,
  seats_left int
);

-- ───────────────────────────── profiles (1:1 with auth.users) ─────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  role        text check (role in ('traveler','operator','admin')),
  operator_id text references public.operators (id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ───────────────────────────── reviews ─────────────────────────────
create table if not exists public.reviews (
  id         text primary key,
  trip_id    text not null references public.trips (id) on delete cascade,
  user_id    uuid references auth.users (id) on delete set null,
  author     text,
  initials   text,
  rating     int check (rating between 1 and 5),
  date       text,
  title      text,
  body       text,
  helpful    int default 0,
  created_at timestamptz not null default now()
);

-- ───────────────────────────── bookings ─────────────────────────────
create table if not exists public.bookings (
  id            uuid primary key default gen_random_uuid(),
  reference     text unique not null,
  user_id       uuid references auth.users (id) on delete set null,
  trip_id       text references public.trips (id) on delete set null,
  departure_id  text references public.departures (id) on delete set null,
  operator_id   text references public.operators (id) on delete set null,
  traveler_name text,
  from_city     text,
  option        text default 'full' check (option in ('full','land')),
  travelers     int default 1,
  amount        int,
  status        text not null default 'pending' check (status in ('pending','confirmed','completed','cancelled')),
  created_at    timestamptz not null default now()
);

-- ═════════════════════════════ Row-Level Security ═════════════════════════════
alter table public.operators  enable row level security;
alter table public.trips      enable row level security;
alter table public.departures enable row level security;
alter table public.profiles   enable row level security;
alter table public.reviews    enable row level security;
alter table public.bookings   enable row level security;

-- Public catalog: anyone (even logged-out) can read
drop policy if exists "public read operators"  on public.operators;
drop policy if exists "public read trips"       on public.trips;
drop policy if exists "public read departures"  on public.departures;
drop policy if exists "public read reviews"     on public.reviews;
create policy "public read operators"  on public.operators  for select using (true);
create policy "public read trips"       on public.trips      for select using (true);
create policy "public read departures"  on public.departures for select using (true);
create policy "public read reviews"     on public.reviews    for select using (true);

-- Profiles: a user manages only their own row
drop policy if exists "own profile read"   on public.profiles;
drop policy if exists "own profile insert" on public.profiles;
drop policy if exists "own profile update" on public.profiles;
create policy "own profile read"   on public.profiles for select using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);

-- Reviews: a logged-in user can post a review as themselves
drop policy if exists "write own review" on public.reviews;
create policy "write own review" on public.reviews for insert with check (auth.uid() = user_id);

-- Bookings: a traveler sees & creates only their own
-- (operator-sees-their-trips + admin-sees-all policies come when we wire those apps)
drop policy if exists "own bookings read"   on public.bookings;
drop policy if exists "own bookings insert" on public.bookings;
create policy "own bookings read"   on public.bookings for select using (auth.uid() = user_id);
create policy "own bookings insert" on public.bookings for insert with check (auth.uid() = user_id);

-- ═════════════════════════════ Auto-create a profile on signup ═════════════════════════════
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
