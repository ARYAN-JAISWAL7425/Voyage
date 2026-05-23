import { supabase } from '@/lib/supabase'
import { reviewsForTrip as mockReviewsForTrip } from '@/data/reviews'
import type { Review } from '@/types'

function toReview(r: Record<string, unknown>): Review {
  return {
    id: r.id as string,
    tripId: r.trip_id as string,
    author: (r.author as string) ?? '',
    initials: (r.initials as string) ?? '',
    rating: (r.rating as number) ?? 5,
    date: (r.date as string) ?? '',
    title: (r.title as string) ?? '',
    body: (r.body as string) ?? '',
    helpful: (r.helpful as number) ?? 0,
  }
}

/** Reviews for a trip — Supabase when configured, else mock. */
export async function getReviewsForTrip(tripId: string): Promise<Review[]> {
  if (!supabase) return mockReviewsForTrip(tripId)
  const { data, error } = await supabase.from('reviews').select('*').eq('trip_id', tripId)
  if (error || !data) return mockReviewsForTrip(tripId)
  return data.map((r) => toReview(r as Record<string, unknown>))
}
