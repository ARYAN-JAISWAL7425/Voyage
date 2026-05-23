import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Reads keys from .env.local — same Supabase project as the main app + Frontend.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** True when both env vars are set. */
export const isSupabaseConfigured = Boolean(url && anonKey)

/**
 * The Supabase client, or `null` when env isn't configured.
 * The admin panel requires it (login + platform-wide reads), so when this is
 * null the panel shows a "not configured" notice rather than mock data.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null
