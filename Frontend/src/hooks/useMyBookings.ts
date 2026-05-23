import { useCallback, useEffect, useState } from 'react'
import type { Booking } from '@/types'
import { getMyBookings } from '@/lib/api/bookings'

/** Loads the signed-in user's bookings from Supabase (empty when signed out). */
export function useMyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [key, setKey] = useState(0)

  useEffect(() => {
    let active = true
    getMyBookings().then((b) => {
      if (active) {
        setBookings(b)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [key])

  const reload = useCallback(() => setKey((k) => k + 1), [])
  return { bookings, loading, reload }
}
