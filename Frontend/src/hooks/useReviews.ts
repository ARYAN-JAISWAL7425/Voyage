import { useEffect, useState } from 'react'
import type { Review } from '@/types'
import { getReviewsForTrip } from '@/lib/api/reviews'

/** Loads reviews for a trip (Supabase when configured, else mock). */
export function useReviews(tripId: string | undefined) {
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    if (!tripId) return
    let active = true
    getReviewsForTrip(tripId).then((r) => {
      if (active) setReviews(r)
    })
    return () => {
      active = false
    }
  }, [tripId])

  return { reviews }
}
