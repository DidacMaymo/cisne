// JSON-LD (schema.org) de cada tipo de página. Lógica pura compartida entre el
// Worker (HTML inicial) y la SPA (`Seo`), para que ambos digan exactamente lo mismo.
import type { ArticleMeta } from './comunidad'
import { articleMeta, authorMeta, canonicalUrl, collectionMeta, firstVerse, poemMeta, SITE_NAME, SITE_URL } from './seo'

export type JsonLd = Record<string, unknown>

const CTX = 'https://schema.org'

export function poemJsonLd(p: {
  id: string
  title: string | null
  content: string
  publishedAt?: string | null
  updatedAt?: string | null
  authorName: string | null
  authorAccountName: string | null
  sensitive: boolean
  tags?: { normalizedName: string }[] | null
}): JsonLd {
  const meta = poemMeta(p)
  const ld: JsonLd = {
    '@context': CTX,
    '@type': 'CreativeWork',
    name: p.title?.trim() || (p.sensitive ? '' : firstVerse(p.content)) || 'Poema',
    genre: 'poesía',
    inLanguage: 'es',
    url: canonicalUrl(meta.path),
  }
  if (p.publishedAt) ld.datePublished = p.publishedAt
  if (p.updatedAt) ld.dateModified = p.updatedAt
  const keywords = (p.tags ?? []).map((t) => t.normalizedName).filter(Boolean)
  if (keywords.length > 0) ld.keywords = keywords.join(', ')
  // Solo con página de autor: un anónimo o un seudónimo no enlazan a ningún perfil, así que no hay autor.
  if (p.authorAccountName && p.authorName) {
    ld.author = {
      '@type': 'Person',
      name: p.authorName,
      url: canonicalUrl(`/autor/${encodeURIComponent(p.authorAccountName)}`),
    }
  }
  return ld
}

export function authorJsonLd(p: {
  accountName: string
  displayName: string
  bio?: string | null
  links?: string[] | null
}): JsonLd {
  const meta = authorMeta(p)
  const ld: JsonLd = { '@context': CTX, '@type': 'Person', name: p.displayName, url: canonicalUrl(meta.path) }
  if (p.bio?.trim()) ld.description = p.bio.trim()
  const links = (p.links ?? []).filter((l) => /^https?:\/\//i.test(l))
  if (links.length > 0) ld.sameAs = links
  return ld
}

export function collectionJsonLd(c: {
  id: string
  title: string
  description?: string | null
  ownerName: string | null
  ownerAccountName: string | null
}): JsonLd {
  const meta = collectionMeta(c)
  const ld: JsonLd = {
    '@context': CTX,
    '@type': 'CollectionPage',
    name: c.title,
    inLanguage: 'es',
    url: canonicalUrl(meta.path),
  }
  if (c.description?.trim()) ld.description = c.description.trim()
  if (c.ownerAccountName && c.ownerName) {
    ld.author = {
      '@type': 'Person',
      name: c.ownerName,
      url: canonicalUrl(`/autor/${encodeURIComponent(c.ownerAccountName)}`),
    }
  }
  return ld
}

export function articleJsonLd(a: ArticleMeta): JsonLd {
  const url = canonicalUrl(articleMeta(a).path)
  const ld: JsonLd = {
    '@context': CTX,
    '@type': 'BlogPosting',
    headline: a.titulo,
    description: a.descripcion,
    datePublished: a.fecha,
    inLanguage: 'es',
    mainEntityOfPage: url,
    url,
    author: { '@type': 'Person', name: a.autor },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  }
  if (a.etiquetas.length > 0) ld.keywords = a.etiquetas.join(', ')
  return ld
}
