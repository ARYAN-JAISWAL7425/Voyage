import { useCallback, useEffect, useState } from 'react'
import type { Trip } from '@/types'
import {
  getOperatorTrips,
  getOperatorBookings,
  getOperatorReviews,
  type OperatorBookingRow,
  type OperatorReviewRow,
} from '@/lib/api/operator'

/** The signed-in operator's own trips. */
export function useOperatorTrips(operatorId: string | null) {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => (operatorId ? getOperatorTrips(operatorId) : [])
    load().then((t) => {
      if (active) {
        setTrips(t)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [operatorId])

  return { trips, loading }
}

/** Bookings travelers made for the signed-in operator's trips. */
export function useOperatorBookings(operatorId: string | null) {
  const [bookings, setBookings] = useState<OperatorBookingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [key, setKey] = useState(0)

  useEffect(() => {
    let active = true
    const load = async () => (operatorId ? getOperatorBookings(operatorId) : [])
    load().then((b) => {
      if (active) {
        setBookings(b)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [operatorId, key])

  const reload = useCallback(() => setKey((k) => k + 1), [])
  return { bookings, loading, reload }
}

/** Reviews left on the signed-in operator's trips. */
export function useOperatorReviews(operatorId: string | null) {
  const [reviews, setReviews] = useState<OperatorReviewRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => (operatorId ? getOperatorReviews(operatorId) : [])
    load().then((r) => {
      if (active) {
        setReviews(r)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [operatorId])

  return { reviews, loading }
}
