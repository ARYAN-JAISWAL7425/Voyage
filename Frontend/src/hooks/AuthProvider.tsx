import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Role } from '@/lib/session'
import { AuthContext, type AuthValue } from '@/hooks/useAuth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRoleState] = useState<Role | null>(null)
  const [operatorId, setOperatorId] = useState<string | null>(null)
  const [loading, setLoading] = useState(Boolean(supabase))

  // Track the Supabase session
  useEffect(() => {
    if (!supabase) return
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session)
        setLoading(false)
      }
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (active) setSession(s)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  // Load the profile (role + operator link) whenever the session changes
  useEffect(() => {
    let active = true
    const uid = session?.user?.id
    const load = async (): Promise<{ role: Role | null; operatorId: string | null }> => {
      if (!supabase || !uid) return { role: null, operatorId: null }
      const { data } = await supabase.from('profiles').select('role, operator_id').eq('id', uid).maybeSingle()
      return { role: (data?.role as Role) ?? null, operatorId: (data?.operator_id as string) ?? null }
    }
    load().then((p) => {
      if (active) {
        setRoleState(p.role)
        setOperatorId(p.operatorId)
      }
    })
    return () => {
      active = false
    }
  }, [session])

  const signUp = useCallback<AuthValue['signUp']>(async (email, password, fullName) => {
    if (!supabase) return { error: 'Auth is not configured.' }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    return { error: error?.message }
  }, [])

  const signIn = useCallback<AuthValue['signIn']>(async (email, password) => {
    if (!supabase) return { error: 'Auth is not configured.' }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    let r: Role | null = null
    if (data.user) {
      const { data: p } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle()
      r = (p?.role as Role) ?? null
    }
    return { role: r }
  }, [])

  const signInWithGoogle = useCallback<AuthValue['signInWithGoogle']>(async () => {
    if (!supabase) return { error: 'Auth is not configured.' }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/get-started` },
    })
    return { error: error?.message }
  }, [])

  const resetPassword = useCallback<AuthValue['resetPassword']>(async (email) => {
    if (!supabase) return { error: 'Auth is not configured.' }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error: error?.message }
  }, [])

  const updatePassword = useCallback<AuthValue['updatePassword']>(async (password) => {
    if (!supabase) return { error: 'Auth is not configured.' }
    const { error } = await supabase.auth.updateUser({ password })
    return { error: error?.message }
  }, [])

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut()
  }, [])

  const setRole = useCallback<AuthValue['setRole']>(
    async (r) => {
      const uid = session?.user?.id
      if (!supabase || !uid) return
      await supabase.from('profiles').update({ role: r }).eq('id', uid)
      setRoleState(r)
    },
    [session],
  )

  const refreshProfile = useCallback(async () => {
    const uid = session?.user?.id
    if (!supabase || !uid) return
    const { data } = await supabase.from('profiles').select('role, operator_id').eq('id', uid).maybeSingle()
    setRoleState((data?.role as Role) ?? null)
    setOperatorId((data?.operator_id as string) ?? null)
  }, [session])

  const value = useMemo<AuthValue>(
    () => ({ user: session?.user ?? null, session, role, operatorId, loading, signUp, signIn, signInWithGoogle, resetPassword, updatePassword, signOut, setRole, refreshProfile }),
    [session, role, operatorId, loading, signUp, signIn, signInWithGoogle, resetPassword, updatePassword, signOut, setRole, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
