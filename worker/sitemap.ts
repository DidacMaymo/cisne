// sitemap.xml a partir de filas de las vistas `public_*`. Lógica pura.
import type { ArticleMeta } from '../src/lib/comunidad'
import { canonicalUrl } from '../src/lib/seo'
import { escapeHtml } from './html'

export interface SitemapData {
  poems: { id: string; published_at: string | null; updated_at: string | null; author_account_name: string | null }[]
  collections: { id: string; updated_at: string | null }[]
  tags: { normalized_name: string }[]
}

const STATIC_PATHS = ['/', '/explorar', '/sobre', '/contacto', '/aviso-legal', '/privacidad', '/cookies']

/** `2026-10-28` o `undefined` si la fecha no es válida. */
function day(value: string | null | undefined): string | undefined {
  if (!value) return undefined
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10)
}

function newest(a: string | undefined, b: string | undefined): string | undefined {
  return a && b ? (a > b ? a : b) : (a ?? b)
}

export function buildSitemap(data: SitemapData, articles: ArticleMeta[] = []): string {
  const urls = new Map<string, string | undefined>()
  for (const p of STATIC_PATHS) urls.set(p, undefined)

  // Solo artículos publicados; /comunidad solo si hay alguno.
  const published = articles.filter((a) => !a.borrador)
  if (published.length > 0) {
    urls.set('/comunidad', published.reduce((m, a) => (a.fecha > m ? a.fecha : m), ''))
    for (const a of published) urls.set(`/comunidad/${a.slug}`, a.fecha)
  }

  const authors = new Map<string, string | undefined>()
  for (const p of data.poems) {
    const last = day(p.updated_at) ?? day(p.published_at)
    urls.set(`/poema/${p.id}`, last)
    // Solo autores con página propia: los anónimos y seudónimos no tienen.
    if (p.author_account_name) {
      authors.set(p.author_account_name, newest(authors.get(p.author_account_name), last))
    }
  }
  for (const [name, last] of authors) urls.set(`/autor/${encodeURIComponent(name)}`, last)
  for (const c of data.collections) urls.set(`/coleccion/${c.id}`, day(c.updated_at))
  for (const t of data.tags) urls.set(`/etiqueta/${encodeURIComponent(t.normalized_name)}`, undefined)

  const body = [...urls]
    .map(([path, last]) => {
      const lastmod = last ? `<lastmod>${last}</lastmod>` : ''
      return `  <url><loc>${escapeHtml(canonicalUrl(path))}</loc>${lastmod}</url>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
}
