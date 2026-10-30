// Construye el contenido del <head> de cada página a partir de filas de las
// vistas `public_*` de Supabase. Lógica pura: sin APIs de Cloudflare.
import type { ArticleMeta } from '../src/lib/comunidad'
import {
  articleMeta,
  authorMeta,
  canonicalUrl,
  collectionMeta,
  COMMUNITY_META,
  firstVerse,
  OG_IMAGE_URL,
  poemMeta,
  SITE_META,
  SITE_NAME,
  SITE_URL,
  tagMeta,
  type PageMeta,
} from '../src/lib/seo'
import { escapeHtml, jsonLdScript } from './html'

export interface PoemRow {
  id: string
  title: string | null
  content: string
  published_at: string | null
  updated_at: string | null
  author_name: string | null
  author_account_name: string | null
  sensitive: boolean
  tags: { name: string; normalizedName: string }[] | null
}

export interface ProfileRow {
  account_name: string
  display_name: string
  bio: string | null
  links: string[] | null
}

export interface CollectionRow {
  id: string
  title: string
  description: string | null
  owner_name: string | null
  owner_account_name: string | null
  updated_at: string | null
}

export interface HeadInput {
  meta: PageMeta
  ogType: 'website' | 'article'
  jsonLd?: Record<string, unknown>
}

const CTX = 'https://schema.org'

/** Página que no existe o no es pública: título genérico y `noindex`. */
export function notFoundHead(): HeadInput {
  return { meta: { ...SITE_META, noindex: true }, ogType: 'website' }
}

export function poemHead(row: PoemRow | null): HeadInput {
  if (!row) return notFoundHead()
  const meta = poemMeta({
    id: row.id,
    title: row.title,
    content: row.content,
    authorName: row.author_name,
    authorAccountName: row.author_account_name,
    sensitive: row.sensitive,
  })
  const ld: Record<string, unknown> = {
    '@context': CTX,
    '@type': 'CreativeWork',
    name: row.title?.trim() || (row.sensitive ? '' : firstVerse(row.content)) || 'Poema',
    genre: 'poesía',
    inLanguage: 'es',
    url: canonicalUrl(meta.path),
  }
  if (row.published_at) ld.datePublished = row.published_at
  if (row.updated_at) ld.dateModified = row.updated_at
  const keywords = (row.tags ?? []).map((t) => t.normalizedName).filter(Boolean)
  if (keywords.length > 0) ld.keywords = keywords.join(', ')
  // Solo con página de autor: un anónimo o un seudónimo no enlazan a ningún perfil, así que no hay autor.
  if (row.author_account_name && row.author_name) {
    ld.author = {
      '@type': 'Person',
      name: row.author_name,
      url: canonicalUrl(`/autor/${encodeURIComponent(row.author_account_name)}`),
    }
  }
  return { meta, ogType: 'article', jsonLd: ld }
}

export function authorHead(row: ProfileRow | null): HeadInput {
  if (!row) return notFoundHead()
  const meta = authorMeta({ accountName: row.account_name, displayName: row.display_name, bio: row.bio })
  const ld: Record<string, unknown> = {
    '@context': CTX,
    '@type': 'Person',
    name: row.display_name,
    url: canonicalUrl(meta.path),
  }
  if (row.bio?.trim()) ld.description = row.bio.trim()
  const links = (row.links ?? []).filter((l) => /^https?:\/\//i.test(l))
  if (links.length > 0) ld.sameAs = links
  return { meta, ogType: 'website', jsonLd: ld }
}

export function collectionHead(row: CollectionRow | null): HeadInput {
  if (!row) return notFoundHead()
  const meta = collectionMeta({ id: row.id, title: row.title, description: row.description })
  const ld: Record<string, unknown> = {
    '@context': CTX,
    '@type': 'CollectionPage',
    name: row.title,
    inLanguage: 'es',
    url: canonicalUrl(meta.path),
  }
  if (row.description?.trim()) ld.description = row.description.trim()
  if (row.owner_account_name && row.owner_name) {
    ld.author = {
      '@type': 'Person',
      name: row.owner_name,
      url: canonicalUrl(`/autor/${encodeURIComponent(row.owner_account_name)}`),
    }
  }
  return { meta, ogType: 'website', jsonLd: ld }
}

export function communityHead(): HeadInput {
  return { meta: COMMUNITY_META, ogType: 'website' }
}

/** `null` = artículo inexistente o borrador: título genérico y `noindex`. */
export function articleHead(a: ArticleMeta | null): HeadInput {
  if (!a || a.borrador) return notFoundHead()
  const meta = articleMeta(a)
  const url = canonicalUrl(meta.path)
  const ld: Record<string, unknown> = {
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
  return { meta, ogType: 'article', jsonLd: ld }
}

export function tagHead(tag: string, exists: boolean): HeadInput {
  if (!exists) return notFoundHead()
  return { meta: tagMeta(tag), ogType: 'website' }
}

/** Etiquetas del hueco `<!--seo-->`. Todo lo variable va escapado; `noindex` no lleva canónica ni og:url. */
export function renderHead({ meta, ogType, jsonLd }: HeadInput): string {
  const t = escapeHtml(meta.title)
  const d = escapeHtml(meta.description)
  const image = escapeHtml(OG_IMAGE_URL)
  const lines = [`<title data-seo>${t}</title>`, `<meta data-seo name="description" content="${d}" />`]
  if (meta.noindex) {
    lines.push('<meta data-seo name="robots" content="noindex" />')
  } else {
    const url = escapeHtml(canonicalUrl(meta.path))
    lines.push(`<link data-seo rel="canonical" href="${url}" />`, `<meta data-seo property="og:url" content="${url}" />`)
  }
  lines.push(
    `<meta data-seo property="og:type" content="${ogType}" />`,
    `<meta data-seo property="og:title" content="${t}" />`,
    `<meta data-seo property="og:description" content="${d}" />`,
    `<meta data-seo property="og:image" content="${image}" />`,
    `<meta data-seo name="twitter:title" content="${t}" />`,
    `<meta data-seo name="twitter:description" content="${d}" />`,
    `<meta data-seo name="twitter:image" content="${image}" />`,
  )
  if (jsonLd && !meta.noindex) lines.push(jsonLdScript(jsonLd))
  return lines.join('\n    ')
}
