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
 * Baraja con una semilla (Fisher–Yates) y separa, en lo posible, dos poemas
 * seguidos de la misma voz. Nunca mira favoritos ni popularidad.
 */
export function shuffleDiverse<T>(items: T[], keyOf: (item: T) => string, seed: number): T[] {
  const rand = rng(seed)
  const pool = [...items]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  const out: T[] = []
  while (pool.length > 0) {
    const last = out.length > 0 ? keyOf(out[out.length - 1]) : null
    const i = pool.findIndex((x) => keyOf(x) !== last)
    out.push(pool.splice(i === -1 ? 0 : i, 1)[0])
  }
  return out
}
