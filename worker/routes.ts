// Qué rutas atiende el Worker y con qué parámetros. Lógica pura.
import { normalizeTag } from '../src/data/normalize'

export type Route =
  | { kind: 'poem'; id: string }
  | { kind: 'author'; accountName: string }
  | { kind: 'collection'; id: string }
  | { kind: 'tag'; tag: string }
  | { kind: 'sitemap' }
  | { kind: 'community' }
  | { kind: 'article'; slug: string }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** `null` = no es una ruta del Worker (o el parámetro no es válido): se sirve el HTML normal. */
export function matchRoute(pathname: string): Route | null {
  if (pathname === '/sitemap.xml') return { kind: 'sitemap' }
  if (/^\/comunidad\/?$/.test(pathname)) return { kind: 'community' }
  const art = /^\/comunidad\/([a-z0-9-]{1,100})\/?$/.exec(pathname)
  if (art) return { kind: 'article', slug: art[1] }
  const m = /^\/(poema|autor|coleccion|etiqueta)\/([^/]+)\/?$/.exec(pathname)
  if (!m) return null
  let value: string
  try {
    value = decodeURIComponent(m[2])
  } catch {
    return null
  }
  switch (m[1]) {
    case 'poema':
      return UUID.test(value) ? { kind: 'poem', id: value.toLowerCase() } : null
    case 'coleccion':
      return UUID.test(value) ? { kind: 'collection', id: value.toLowerCase() } : null
    case 'autor':
      return value.length <= 60 ? { kind: 'author', accountName: value } : null
    default: {
      const tag = normalizeTag(value)
      return tag ? { kind: 'tag', tag } : null
    }
  }
}
