import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { AdminAuthContext, type AdminAuthValue } from '@/hooks/useAdminAuth'

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(Boolean(supabase))

  // Track the session AND resolve the admin role together, so the gate never
  // flashes the login screen before the stored session has been checked.
  useEffect(() => {
    if (!supabase) return
    const client = supabase
    let active = true

    const resolve = async (s: Session | null) => {
      let admin = false
      if (s?.user?.id) {
        const { data } = await client.from('profiles').select('role').eq('id', s.user.id).maybeSingle()
        admin = data?.role === 'admin'
      }
      if (active) {
        setSession(s)
        setIsAdmin(admin)
        setLoading(false)
      }
    }

    client.auth.getSession().then(({ data }) => { void resolve(data.session) })
    const { data: sub } = client.auth.onAuthStateChange((_event, s) => { void resolve(s) })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback<AdminAuthValue['signIn']>(async (email, password) => {
    if (!supabase) return { error: 'Supabase is not configured.' }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message }
  }, [])

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut()
  }, [])

  const value = useMemo<AdminAuthValue>(
    () => ({ email: session?.user?.email ?? null, isAdmin, loading, signIn, signOut }),
    [session, isAdmin, loading, signIn, signOut],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}
