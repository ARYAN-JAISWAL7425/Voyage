import { useEffect, useState } from 'react'
import type { Operator } from '@/types'
import { getOperatorById } from '@/lib/api/operators'

/** Loads a single operator by id (Supabase when configured, else mock). */
export function useOperator(id: string | undefined) {
  const [operator, setOperator] = useState<Operator | undefined>(undefined)

  useEffect(() => {
    if (!id) return
    let active = true
    getOperatorById(id).then((o) => {
      if (active) setOperator(o)
    })
    return () => {
      active = false
    }
  }, [id])

  return { operator }
}
