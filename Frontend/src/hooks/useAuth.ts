import { createContext, useContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import type { Role } from '@/lib/session'

export interface AuthValue {
  user: User | null
  session: Session | null
  role: Role | null
  operatorId: string | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>
  signIn: (email: string, password: string) => Promise<{ error?: string; role?: Role | null }>
  signInWithGoogle: () => Promise<{ error?: string }>
  /** Email a password-reset link that lands on /reset-password. */
  resetPassword: (email: string) => Promise<{ error?: string }>
  /** Set a new password for the current (recovery) session. */
  updatePassword: (password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  setRole: (role: Role) => Promise<void>
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthValue | null>(null)

/** The current Supabase auth state (user, session, profile role) + auth actions. */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
