import { useCallback, useEffect, useState } from 'react'
import {
  getOperators, getListings, getPlatformBookings, getUsers, getPlatformStats, getOperatorPayouts,
  type PlatformStats, type OperatorPayout,
} from '@/lib/api/admin'
import type { AdminOperator, AdminListing, AdminBooking, AdminUser } from '@/data/admin'

/** Operators list + a `reload()` to re-fetch after a verify/suspend action. */
export function useOperators() {
  const [operators, setOperators] = useState<AdminOperator[]>([])
  const [loading, setLoading] = useState(true)
  const [key, setKey] = useState(0)
  useEffect(() => {
    let active = true
    getOperators().then((d) => { if (active) { setOperators(d); setLoading(false) } })
    return () => { active = false }
  }, [key])
  const reload = useCallback(() => setKey((k) => k + 1), [])
  return { operators, loading, reload }
}

export function useListings() {
  const [listings, setListings] = useState<AdminListing[]>([])
  const [loading, setLoading] = useState(true)
  const [key, setKey] = useState(0)
  useEffect(() => {
    let active = true
    getListings().then((d) => { if (active) { setListings(d); setLoading(false) } })
    return () => { active = false }
  }, [key])
  const reload = useCallback(() => setKey((k) => k + 1), [])
  return { listings, loading, reload }
}

export function usePlatformBookings() {
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    getPlatformBookings().then((d) => { if (active) { setBookings(d); setLoading(false) } })
    return () => { active = false }
  }, [])
  return { bookings, loading }
}

export function useUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    getUsers().then((d) => { if (active) { setUsers(d); setLoading(false) } })
    return () => { active = false }
  }, [])
  return { users, loading }
}

export function useOperatorPayouts() {
  const [payouts, setPayouts] = useState<OperatorPayout[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    getOperatorPayouts().then((d) => { if (active) { setPayouts(d); setLoading(false) } })
    return () => { active = false }
  }, [])
  return { payouts, loading }
}

export function usePlatformStats() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  useEffect(() => {
    let active = true
    getPlatformStats().then((d) => { if (active) setStats(d) })
    return () => { active = false }
  }, [])
  return stats
}
