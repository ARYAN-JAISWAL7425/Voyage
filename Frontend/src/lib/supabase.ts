import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Reads keys from .env.local — Dashboard → Project Settings → API.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** True when both env vars are set. When false, the app falls back to mock data. */
export const isSupabaseConfigured = Boolean(url && anonKey)

/**
 * The Supabase client, or `null` when env isn't configured.
 * Callers should treat `null` as "use mock data" so the app runs offline.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null
