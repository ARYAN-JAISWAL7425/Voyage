-- ============================================================================
-- Voyago — cancel_booking RPC  (run in Supabase: Dashboard → SQL Editor → New query)
-- Lets the booking's BUYER, the trip's OPERATOR, or an ADMIN cancel a booking.
-- Cancelling restores the seats to the departure so the trip can be re-booked.
-- SECURITY DEFINER so it can update departures (which travelers can't via RLS),
-- but it checks the caller's identity internally. Safe to re-run.
-- Requires is_admin() from admin-policies.sql.
-- ============================================================================
create or replace function public.cancel_booking(p_booking_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  b public.bookings;
begin
  select * into b from public.bookings where id = p_booking_id;
  if not found then
    return 'not_found';
  end if;

  -- Only the buyer, the trip's operator, or an admin may cancel.
  if not (
    b.user_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.operator_id = b.operator_id
    )
  ) then
    return 'forbidden';
  end if;

  if b.status = 'cancelled' then
    return 'already_cancelled';
  end if;

  update public.bookings set status = 'cancelled' where id = p_booking_id;

  -- Return the seats to the departure.
  update public.departures
    set seats_left = coalesce(seats_left, 0) + coalesce(b.travelers, 1)
    where id = b.departure_id;

  return 'cancelled';
end;
$$;

grant execute on function public.cancel_booking(uuid) to authenticated;
