import { repos } from '../data'
import { useQuery } from './useQuery'

/** Sesión actual. `undefined` mientras carga, `null` si nadie ha entrado. */
export function useSession() {
  const { data, loading } = useQuery(() => repos.auth.current(), [])
  return { session: loading ? undefined : (data ?? null), loading }
}
