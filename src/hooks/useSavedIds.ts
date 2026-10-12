import { useMemo } from 'react'
import { repos } from '../data'
import { useQuery } from './useQuery'

/** Ids de los poemas que el usuario ha guardado en su biblioteca. */
export function useSavedIds(): Set<string> {
  const { data } = useQuery(() => repos.favorites.listIds(), [])
  return useMemo(() => new Set(data ?? []), [data])
}
