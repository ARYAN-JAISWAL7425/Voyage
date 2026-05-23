// Mock auth session — a lightweight stand-in until Supabase Auth is wired.
// `role` here maps directly to profiles.role once the backend lands; swap these
// helpers for a Supabase session + profile lookup at that point.
export type Role = 'traveler' | 'operator'

const ROLE_KEY = 'voyago:role'

/** The signed-in user's role, or null if they haven't chosen one yet. */
export function getRole(): Role | null {
  const v = typeof localStorage !== 'undefined' ? localStorage.getItem(ROLE_KEY) : null
  return v === 'traveler' || v === 'operator' ? v : null
}

export function setRole(role: Role): void {
  localStorage.setItem(ROLE_KEY, role)
}

export function clearRole(): void {
  localStorage.removeItem(ROLE_KEY)
}

/** Where each role lands after authentication. */
export function dashboardFor(role: Role): string {
  return role === 'operator' ? '/business/dashboard' : '/dashboard'
}
