import { createContext, useContext } from 'react'

export interface SavedTripsContextValue {
  savedIds: string[]
  isSaved: (id: string) => boolean
  toggleSaved: (id: string) => void
  count: number
}

export const SavedTripsContext = createContext<SavedTripsContextValue | null>(null)

/** Shared wishlist of saved trip IDs (persisted to localStorage). Provided by SavedTripsProvider. */
export function useSavedTrips() {
  const ctx = useContext(SavedTripsContext)
  if (!ctx) throw new Error('useSavedTrips must be used within a SavedTripsProvider')
  return ctx
}
