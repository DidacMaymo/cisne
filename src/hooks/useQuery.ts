import { useEffect, useState } from 'react'
import { onDataChange } from '../data'

type Result<T> = { key: string; data?: T; error?: Error }

/**
 * Carga datos de un repositorio y se refresca sola cuando los datos cambian.
 * `deps` identifica la consulta; mientras cambia, `loading` es true.
 */
export function useQuery<T>(load: () => Promise<T>, deps: readonly unknown[]) {
  const key = JSON.stringify(deps)
  const [result, setResult] = useState<Result<T> | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => onDataChange(() => setTick((t) => t + 1)), [])

  useEffect(() => {
    let live = true
    load().then(
      (data) => live && setResult({ key, data }),
      (e) => live && setResult({ key, error: e instanceof Error ? e : new Error(String(e)) }),
    )
    return () => {
      live = false
    }
    // `load` cambia en cada render; la consulta se identifica por `key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, tick])

  const fresh = result?.key === key
  return {
    data: fresh ? result.data : undefined,
    error: fresh ? result.error : undefined,
    loading: !fresh,
  }
}
