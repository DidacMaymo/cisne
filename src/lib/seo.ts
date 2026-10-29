// Lógica pura de SEO compartida por la SPA (`src/components/Seo.tsx`) y el Worker
// (`worker/`). No usa DOM ni APIs de Cloudflare.

/** Dominio canónico de CISNE. Único sitio donde cambiarlo. */
export const SITE_URL = 'https://cisneverso.es'
export const SITE_NAME = 'CISNE'
export const SITE_TAGLINE = 'poesía en español'
export const SITE_DESCRIPTION = 'CISNE — un lugar para la poesía en español.'
export const OG_IMAGE_URL = `${SITE_URL}/og.png`

/** URL canónica absoluta: sin query ni fragmento. */
export function canonicalUrl(path: string): string {
  const clean = path.split(/[?#]/)[0] ?? ''
  return SITE_URL + (clean.startsWith('/') ? clean : `/${clean}`)
}

/** Quita las marcas de formato del poema (**negrita**, *cursiva*, __subrayado__, ~~tachado~~). */
export function plainText(content: string): string {
  return content
    .replace(/\\([*_~\\])/g, '$1')
    .replace(/\*{1,3}|__|~~/g, '')
    .replace(//g, '')
}

/** Corta en `max` caracteres, sin partir palabras, añadiendo «…» si recorta. */
export function clip(text: string, max: number): string {
  const t = text.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  const cut = t.slice(0, max - 1)
  const space = cut.lastIndexOf(' ')
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:.\-–—]+$/, '')}…`
}

/** Primer verso sin marcas: título de respaldo de un poema sin título. */
export function firstVerse(content: string): string {
  return plainText(content.split('\n').find((l) => l.trim() !== '')?.trim() ?? '')
}

/** Primeros versos separados por « / », para la descripción de un poema. */
export function versesExcerpt(content: string, max = 155): string {
  const lines = plainText(content)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  return clip(lines.join(' / '), max)
}

export interface PageMeta {
  title: string
  description: string
  /** Ruta canónica, p. ej. `/poema/<id>`. */
  path: string
  noindex?: boolean
}

export const SITE_META: PageMeta = {
  title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
  path: '/',
}

/** Título y descripción de un poema. Sin autor si no tiene página de autor (anónimo o seudónimo). */
export function poemMeta(p: {
  id: string
  title: string | null
  content: string
  authorName?: string | null
  authorAccountName?: string | null
  sensitive?: boolean
}): PageMeta {
  const name = p.title?.trim() || (p.sensitive ? '' : firstVerse(p.content)) || 'Poema'
  const author = p.authorAccountName ? p.authorName?.trim() : ''
  return {
    title: `${name}${author ? ` — ${author}` : ''} · ${SITE_NAME}`,
    description: p.sensitive
      ? `Un poema en ${SITE_NAME}. Contiene temas delicados.`
      : versesExcerpt(p.content) || SITE_DESCRIPTION,
    path: `/poema/${p.id}`,
  }
}

export function authorMeta(a: { accountName: string; displayName: string; bio?: string | null }): PageMeta {
  return {
    title: `${a.displayName} — poemas en ${SITE_NAME}`,
    description: clip(a.bio?.trim() || `Poemas de ${a.displayName} en ${SITE_NAME}.`, 155),
    path: `/autor/${encodeURIComponent(a.accountName)}`,
  }
}

export function collectionMeta(c: { id: string; title: string; description?: string | null }): PageMeta {
  return {
    title: `${c.title} — colección · ${SITE_NAME}`,
    description: clip(c.description?.trim() || `Colección de poemas «${c.title}» en ${SITE_NAME}.`, 155),
    path: `/coleccion/${c.id}`,
  }
}

export function tagMeta(tag: string): PageMeta {
  return {
    title: `Poemas de #${tag} · ${SITE_NAME}`,
    description: `Poemas en español con la etiqueta #${tag}, en ${SITE_NAME}.`,
    path: `/etiqueta/${encodeURIComponent(tag)}`,
  }
}

/** Rutas privadas o sin valor para un buscador: `noindex` y `Disallow` en robots.txt. */
export const PRIVATE_PREFIXES = [
  '/escribir',
  '/mis/',
  '/mi-pagina',
  '/colecciones',
  '/ajustes/',
  '/entrar',
  '/registro',
  '/recuperar',
  '/nueva-contrasena',
] as const

export function isPrivatePath(pathname: string): boolean {
  return PRIVATE_PREFIXES.some((p) => (p.endsWith('/') ? pathname.startsWith(p) : pathname === p || pathname.startsWith(`${p}/`)))
}
