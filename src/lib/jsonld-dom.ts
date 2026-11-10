// Mantiene en el <head> un único JSON-LD de la página (además del `Organization` de index.html).
import type { JsonLd } from './jsonld'

/** Lo mínimo de `document` que necesitamos (permite probarlo sin navegador). */
export interface HeadDoc {
  head: {
    querySelectorAll(sel: string): ArrayLike<{ remove(): void }>
    appendChild(n: unknown): unknown
  }
  createElement(tag: string): { type: string; textContent: string | null; setAttribute(k: string, v: string): void }
}

/** Mismo escape que el Worker: `<`, `>` y `&` como \uXXXX para que el JSON no cierre el script. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
}

/**
 * Retira el JSON-LD que escribió el Worker (`data-seo`) y el de la página anterior (`data-jsonld`),
 * y pone el nuevo. Devuelve la función que lo quita. No toca el `Organization` (sin marcas).
 */
export function applyJsonLd(doc: HeadDoc, data: JsonLd | undefined): () => void {
  const stale = 'script[type="application/ld+json"][data-seo], script[type="application/ld+json"][data-jsonld]'
  const clear = () => Array.from(doc.head.querySelectorAll(stale)).forEach((n) => n.remove())
  clear()
  if (!data) return clear
  const el = doc.createElement('script')
  el.type = 'application/ld+json'
  el.setAttribute('data-jsonld', '')
  el.textContent = serializeJsonLd(data)
  doc.head.appendChild(el)
  return clear
}
