// Lectura de las vistas públicas de Supabase por REST. Solo `public_*` y solo con la
// clave publicable (la misma que usa el navegador): nunca nada privado.
import type { CollectionRow, PoemRow, ProfileRow } from './head'
import type { SitemapData } from './sitemap'

export interface SupabaseConfig {
  url: string
  key: string
}

interface EnvVars {
  SUPABASE_URL?: string
  SUPABASE_PUBLISHABLE_KEY?: string
}

/** `null` si faltan las variables del Worker: entonces solo se sirve el HTML por defecto. */
export function supabaseConfig(env: EnvVars): SupabaseConfig | null {
  const url = env.SUPABASE_URL?.trim().replace(/\/+$/, '')
  const key = env.SUPABASE_PUBLISHABLE_KEY?.trim()
  return url && key ? { url, key } : null
}

async function rest<T>(cfg: SupabaseConfig, view: string, query: Record<string, string>): Promise<T[]> {
  const res = await fetch(`${cfg.url}/rest/v1/${view}?${new URLSearchParams(query)}`, {
    headers: { apikey: cfg.key, Accept: 'application/json' },
    signal: AbortSignal.timeout(4000),
  })
  if (!res.ok) throw new Error(`Supabase ${view}: ${res.status}`)
  return (await res.json()) as T[]
}

async function one<T>(cfg: SupabaseConfig, view: string, query: Record<string, string>): Promise<T | null> {
  return (await rest<T>(cfg, view, { ...query, limit: '1' }))[0] ?? null
}

export const getPoem = (cfg: SupabaseConfig, id: string) =>
  one<PoemRow>(cfg, 'public_poems', {
    select: 'id,title,content,published_at,updated_at,author_name,author_account_name,sensitive,tags',
    id: `eq.${id}`,
  })

export const getProfile = (cfg: SupabaseConfig, accountName: string) =>
  one<ProfileRow>(cfg, 'public_profiles', {
    select: 'account_name,display_name,bio,links',
    account_name: `eq.${accountName}`,
  })

export const getCollection = (cfg: SupabaseConfig, id: string) =>
  one<CollectionRow>(cfg, 'public_collections', {
    select: 'id,title,description,owner_name,owner_account_name,updated_at',
    id: `eq.${id}`,
  })

export async function tagExists(cfg: SupabaseConfig, normalizedName: string): Promise<boolean> {
  return !!(await one<{ id: string }>(cfg, 'public_tags', { select: 'id', normalized_name: `eq.${normalizedName}` }))
}

const PAGE = 1000
// Cada página es una petición y un Worker tiene un máximo de 50 por visita: 4 listas × 10 páginas.
const MAX_PAGES = 10

async function all<T>(cfg: SupabaseConfig, view: string, query: Record<string, string>): Promise<T[]> {
  const rows: T[] = []
  for (let page = 0; page < MAX_PAGES; page++) {
    const chunk = await rest<T>(cfg, view, { ...query, limit: String(PAGE), offset: String(page * PAGE) })
    rows.push(...chunk)
    if (chunk.length < PAGE) break
  }
  return rows
}

export async function getSitemapData(cfg: SupabaseConfig): Promise<SitemapData> {
  const [poems, collections, tags] = await Promise.all([
    all<SitemapData['poems'][number]>(cfg, 'public_poems', {
      select: 'id,published_at,updated_at,author_account_name',
      order: 'published_at.desc,id.asc',
    }),
    all<SitemapData['collections'][number]>(cfg, 'public_collections', {
      select: 'id,updated_at',
      poem_count: 'gt.0',
      order: 'created_at.desc,id.asc',
    }),
    all<SitemapData['tags'][number]>(cfg, 'public_tags', { select: 'normalized_name', order: 'normalized_name.asc' }),
  ])
  return { poems, collections, tags }
}
