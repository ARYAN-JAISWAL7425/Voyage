import { supabase } from '@/lib/supabase'
import { operatorById as mockOperatorById } from '@/data/operators'
import type { Operator } from '@/types'

function toOperator(r: Record<string, unknown>): Operator {
  return {
    id: r.id as string,
    name: r.name as string,
    verified: (r.verified as boolean) ?? false,
    initials: (r.initials as string) ?? '',
    rating: Number(r.rating ?? 0),
    reviewCount: (r.review_count as number) ?? 0,
    tripsCount: (r.trips_count as number) ?? 0,
    since: (r.since as number) ?? 0,
    responseTime: (r.response_time as string) ?? '',
    location: (r.location as string) ?? '',
    about: (r.about as string) ?? '',
  }
}

/** A single operator by id — Supabase when configured, else mock. */
export async function getOperatorById(id: string): Promise<Operator | undefined> {
  if (!supabase) return mockOperatorById(id)
  const { data, error } = await supabase.from('operators').select('*').eq('id', id).maybeSingle()
  if (error || !data) return mockOperatorById(id)
  return toOperator(data as Record<string, unknown>)
}
