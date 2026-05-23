import { useCallback, useMemo, type ReactNode } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { SavedTripsContext, type SavedTripsContextValue } from '@/hooks/useSavedTrips'

// A few trips pre-saved so the wishlist demos nicely on first load.
const SEED = ['golden-triangle', 'kerala-backwaters', 'udaipur-luxury']

export function SavedTripsProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useLocalStorage<string[]>('voyago:saved-trips', SEED)

  const toggleSaved = useCallback(
    (id: string) => {
      setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
    },
    [setSavedIds],
  )

  const value = useMemo<SavedTripsContextValue>(
    () => ({
      savedIds,
      isSaved: (id: string) => savedIds.includes(id),
      toggleSaved,
      count: savedIds.length,
    }),
    [savedIds, toggleSaved],
  )

  return <SavedTripsContext.Provider value={value}>{children}</SavedTripsContext.Provider>
}
