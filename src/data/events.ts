// Aviso común «los datos cambiaron»: lo emiten los repositorios (local o
// Supabase) y lo escucha useQuery para recargar.
const listeners = new Set<() => void>()

export function emitDataChange(): void {
  listeners.forEach((l) => l())
}

export function onDataChange(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
