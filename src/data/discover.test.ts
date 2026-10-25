import { describe, expect, it } from 'vitest'
import { shuffleDiverse } from './discover'

const items = Array.from({ length: 30 }, (_, i) => ({ id: i, author: `a${i % 6}` }))
const key = (x: { author: string }) => x.author

describe('shuffleDiverse', () => {
  it('la misma semilla da el mismo orden', () => {
    expect(shuffleDiverse(items, key, 7)).toEqual(shuffleDiverse(items, key, 7))
  })
  it('otra semilla cambia el orden', () => {
    expect(shuffleDiverse(items, key, 1)).not.toEqual(shuffleDiverse(items, key, 2))
  })
  it('no pierde ni duplica poemas y no muta la entrada', () => {
    const copy = [...items]
    const out = shuffleDiverse(items, key, 3)
    expect(items).toEqual(copy)
    expect(out.map((x) => x.id).sort((a, b) => a - b)).toEqual(items.map((x) => x.id))
  })
  it('no pone dos poemas seguidos de la misma voz mientras haya alternativa', () => {
    // Solo el final puede repetir voz: ahí ya no queda nadie más.
    for (const seed of [1, 2, 3, 4, 5]) {
      const out = shuffleDiverse(items, key, seed).slice(0, 20)
      out.slice(1).forEach((x, i) => expect(x.author).not.toBe(out[i].author))
    }
  })
  it('con una sola voz devuelve todos los poemas', () => {
    const one = items.map((x) => ({ ...x, author: 'a' }))
    expect(shuffleDiverse(one, key, 1)).toHaveLength(30)
  })
})
