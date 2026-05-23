import { supabase } from '@/lib/supabase'
import type {
  AdminOperator, AdminListing, AdminBooking, AdminUser, OperatorStatus,
} from '@/data/admin'

const initialsOf = (name: string) =>
  name.split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?'

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

// ───────────────────────────── Operators ─────────────────────────────
/** Every operator, with live trip counts + GMV computed from real bookings. */
export async function getOperators(): Promise<AdminOperator[]> {
  if (!supabase) return []
  const [{ data: ops }, { data: trips }, { data: books }] = await Promise.all([
    supabase.from('operators').select('*').order('created_at', { ascending: false }),
    supabase.from('trips').select('operator_id'),
    supabase.from('bookings').select('operator_id, amount, status'),
  ])
  if (!ops) return []

  const tripCount = new Map<string, number>()
  for (const t of (trips as { operator_id: string | null }[] | null) ?? []) {
    if (t.operator_id) tripCount.set(t.operator_id, (tripCount.get(t.operator_id) ?? 0) + 1)
  }
  const gmv = new Map<string, number>()
  for (const b of (books as { operator_id: string | null; amount: number | null; status: string }[] | null) ?? []) {
    if (b.operator_id && b.status !== 'cancelled') gmv.set(b.operator_id, (gmv.get(b.operator_id) ?? 0) + (b.amount ?? 0))
  }

  return (ops as Record<string, unknown>[]).map((o) => {
    const id = o.id as string
    const name = (o.name as string) ?? ''
    return {
      id,
      name,
      initials: (o.initials as string) || initialsOf(name),
      location: (o.location as string) ?? '',
      status: (o.status as OperatorStatus) ?? 'pending',
      trips: tripCount.get(id) ?? 0,
      gmv: gmv.get(id) ?? 0,
      rating: (o.rating as number | null) ?? null,
      joined: o.since ? String(o.since) : fmtDate(o.created_at as string | null),
    }
  })
}

/** Verify / suspend / reinstate an operator. Keeps the `verified` flag in sync. */
export async function setOperatorStatus(id: string, status: OperatorStatus): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Not connected to Supabase.' }
  const { error } = await supabase.from('operators').update({ status, verified: status === 'verified' }).eq('id', id)
  return { error: error?.message }
}

// ───────────────────────────── Listings (trips) ─────────────────────────────
/** Every trip in the catalog, with its operator's name. (No moderation column
 *  exists yet, so all real trips show as 'published'.) */
export async function getListings(): Promise<AdminListing[]> {
  if (!supabase) return []
  const { data } = await supabase
    .from('trips')
    .select('id, title, location, destination, price, created_at, operators(name)')
    .order('created_at', { ascending: false })
  if (!data) return []
  return (data as Record<string, unknown>[]).map((t) => {
    const op = t.operators as { name?: string } | null
    return {
      id: t.id as string,
      title: (t.title as string) ?? '',
      operator: op?.name ?? '—',
      location: (t.location as string) || (t.destination as string) || '',
      price: (t.price as number) ?? 0,
      status: 'published' as const,
      submitted: fmtDate(t.created_at as string | null),
    }
  })
}

/** Permanently delete a trip. Departures + reviews cascade away automatically;
 *  bookings are kept (their trip_id is set to null). Needs the
 *  "admin deletes trips" policy from admin-policies.sql. */
export async function deleteListing(id: string): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Not connected to Supabase.' }
  const { data, error } = await supabase.from('trips').delete().eq('id', id).select('id')
  if (error) return { error: error.message }
  if (!data || data.length === 0) {
    return { error: 'Nothing was deleted — the admin delete policy may be missing. Run supabase/admin-policies.sql in the SQL editor.' }
  }
  return {}
}

// ───────────────────────────── Bookings (platform-wide) ─────────────────────────────
/** Every booking on the platform (needs the "admin reads all bookings" policy). */
export async function getPlatformBookings(): Promise<AdminBooking[]> {
  if (!supabase) return []
  const { data } = await supabase
    .from('bookings')
    .select('*, trips(title), operators(name)')
    .order('created_at', { ascending: false })
  if (!data) return []
  return (data as Record<string, unknown>[]).map((r) => {
    const trip = r.trips as { title?: string } | null
    const op = r.operators as { name?: string } | null
    const amount = (r.amount as number) ?? 0
    return {
      id: r.id as string,
      reference: (r.reference as string) ?? '',
      traveler: (r.traveler_name as string) ?? 'Traveler',
      operator: op?.name ?? '—',
      trip: trip?.title ?? '—',
      amount,
      commission: Math.round(amount * 0.1),
      status: (r.status as AdminBooking['status']) ?? 'confirmed',
      date: fmtDate(r.created_at as string | null),
    }
  })
}

// ───────────────────────────── Users (profiles) ─────────────────────────────
/** Every registered user (needs the "admin reads all profiles" policy). */
export async function getUsers(): Promise<AdminUser[]> {
  if (!supabase) return []
  const [{ data: profs }, { data: books }] = await Promise.all([
    supabase.from('profiles').select('id, full_name, email, role, created_at').order('created_at', { ascending: false }),
    supabase.from('bookings').select('user_id'),
  ])
  if (!profs) return []

  const bookingCount = new Map<string, number>()
  for (const b of (books as { user_id: string | null }[] | null) ?? []) {
    if (b.user_id) bookingCount.set(b.user_id, (bookingCount.get(b.user_id) ?? 0) + 1)
  }

  return (profs as Record<string, unknown>[]).map((p) => {
    const id = p.id as string
    const name = (p.full_name as string) || (p.email as string) || 'User'
    return {
      id,
      name,
      initials: initialsOf(name),
      email: (p.email as string) ?? '—',
      role: p.role === 'operator' ? 'Operator' : 'Traveler',
      joined: fmtDate(p.created_at as string | null),
      bookings: bookingCount.get(id) ?? 0,
      status: 'active' as const,
    }
  })
}

// ───────────────────────────── Payments (operator payouts) ─────────────────────────────
export interface OperatorPayout {
  id: string
  operator: string
  initials: string
  bookings: number
  gross: number
  commission: number
  payout: number
}

/** Net payout owed to each operator: non-cancelled booking revenue minus the 10% platform commission. */
export async function getOperatorPayouts(): Promise<OperatorPayout[]> {
  if (!supabase) return []
  const [{ data: ops }, { data: books }] = await Promise.all([
    supabase.from('operators').select('id, name, initials'),
    supabase.from('bookings').select('operator_id, amount, status'),
  ])
  if (!ops) return []

  const agg = new Map<string, { bookings: number; gross: number }>()
  for (const b of (books as { operator_id: string | null; amount: number | null; status: string }[] | null) ?? []) {
    if (!b.operator_id || b.status === 'cancelled') continue
    const cur = agg.get(b.operator_id) ?? { bookings: 0, gross: 0 }
    cur.bookings += 1
    cur.gross += b.amount ?? 0
    agg.set(b.operator_id, cur)
  }

  return (ops as { id: string; name: string; initials: string | null }[])
    .map((o) => {
      const a = agg.get(o.id) ?? { bookings: 0, gross: 0 }
      const commission = Math.round(a.gross * 0.1)
      return { id: o.id, operator: o.name, initials: o.initials || initialsOf(o.name), bookings: a.bookings, gross: a.gross, commission, payout: a.gross - commission }
    })
    .filter((r) => r.bookings > 0)
    .sort((a, b) => b.payout - a.payout)
}

// ───────────────────────────── Platform stats (Overview) ─────────────────────────────
export interface PlatformStats {
  gmv: number
  bookings: number
  operators: number
  travelers: number
  commission: number
}

/** Aggregate platform metrics for the Overview cards. */
export async function getPlatformStats(): Promise<PlatformStats> {
  const empty: PlatformStats = { gmv: 0, bookings: 0, operators: 0, travelers: 0, commission: 0 }
  if (!supabase) return empty
  const [{ data: books }, { count: opCount }, { count: travCount }] = await Promise.all([
    supabase.from('bookings').select('amount, status'),
    supabase.from('operators').select('id', { count: 'exact', head: true }).eq('status', 'verified'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'traveler'),
  ])
  const rows = (books as { amount: number | null; status: string }[] | null) ?? []
  const gmv = rows.filter((b) => b.status !== 'cancelled').reduce((s, b) => s + (b.amount ?? 0), 0)
  return {
    gmv,
    bookings: rows.length,
    operators: opCount ?? 0,
    travelers: travCount ?? 0,
    commission: Math.round(gmv * 0.1),
  }
}
