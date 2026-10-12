// PRNG pequeño y determinista (mulberry32): la misma semilla da el mismo orden.
function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Mezcla los elementos con una semilla y limita cuántos puede aportar cada
 * clave (autor). Nunca mira favoritos ni popularidad.
 */
export function pickDiverse<T>(items: T[], keyOf: (item: T) => string, seed: number, perKey = 2): T[] {
  const rand = rng(seed)
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  const counts = new Map<string, number>()
  return shuffled.filter((item) => {
    const k = keyOf(item)
    const n = counts.get(k) ?? 0
    if (n >= perKey) return false
    counts.set(k, n + 1)
    return true
  })
}
