import { useEffect, useState } from 'react'
import type { Trip } from '@/types'
import { getTrips, getTripById } from '@/lib/api/trips'

/** Loads the full trip catalog (Supabase when configured, else mock). */
export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getTrips().then((t) => {
      if (active) {
        setTrips(t)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [])

  return { trips, loading }
}

/** Loads a single trip by id (Supabase when configured, else mock). */
export function useTrip(id: string | undefined) {
  const [trip, setTrip] = useState<Trip | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getTripById(id ?? '').then((t) => {
      if (active) {
        setTrip(t)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [id])

  return { trip, loading }
}
