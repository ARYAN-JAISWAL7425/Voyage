-- ============================================================================
-- Voyago trip-photo storage  (run in Supabase: Dashboard → SQL Editor → New query)
-- Creates a public bucket for trip images + lets signed-in operators upload.
-- Safe to re-run (idempotent).
-- ============================================================================

-- Public bucket so trip images can be served by URL (like the seeded Unsplash ones).
insert into storage.buckets (id, name, public)
values ('trip-photos', 'trip-photos', true)
on conflict (id) do nothing;

-- Anyone can READ trip photos (the bucket is public).
drop policy if exists "public read trip photos" on storage.objects;
create policy "public read trip photos" on storage.objects
  for select using (bucket_id = 'trip-photos');

-- Any signed-in user (operator) can UPLOAD into the bucket.
drop policy if exists "operators upload trip photos" on storage.objects;
create policy "operators upload trip photos" on storage.objects
  for insert to authenticated with check (bucket_id = 'trip-photos');

-- Uploaders can update / delete their own files.
drop policy if exists "operators update own trip photos" on storage.objects;
create policy "operators update own trip photos" on storage.objects
  for update to authenticated using (bucket_id = 'trip-photos' and owner = auth.uid());

drop policy if exists "operators delete own trip photos" on storage.objects;
create policy "operators delete own trip photos" on storage.objects
  for delete to authenticated using (bucket_id = 'trip-photos' and owner = auth.uid());
