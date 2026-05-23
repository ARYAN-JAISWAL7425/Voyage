import { createContext, useContext } from 'react'

export interface AdminAuthValue {
  /** The signed-in user's email, or null when logged out. */
  email: string | null
  /** True only when the signed-in user's profile role = 'admin'. */
  isAdmin: boolean
  /** True until the initial session + admin check resolves. */
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

export const AdminAuthContext = createContext<AdminAuthValue | undefined>(undefined)

export function useAdminAuth(): AdminAuthValue {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
