// Worker de CISNE. Solo intercepta /poema/*, /autor/*, /coleccion/*, /etiqueta/* y
// /sitemap.xml (ver `run_worker_first` en wrangler.jsonc); el resto lo sirven los assets.
// Ante cualquier fallo devuelve el index.html normal: la SPA sigue funcionando sola.
import { authorHead, collectionHead, poemHead, renderHead, tagHead, type HeadInput } from './head'
import { injectSeo } from './html'
import { matchRoute, type Route } from './routes'
import { buildSitemap } from './sitemap'
import {
  getCollection,
  getPoem,
  getProfile,
  getSitemapData,
  supabaseConfig,
  tagExists,
  type SupabaseConfig,
} from './supabase'

interface Env {
  ASSETS: Fetcher
  SUPABASE_URL?: string
  SUPABASE_PUBLISHABLE_KEY?: string
}

async function headFor(route: Exclude<Route, { kind: 'sitemap' }>, cfg: SupabaseConfig): Promise<HeadInput> {
  switch (route.kind) {
    case 'poem':
      return poemHead(await getPoem(cfg, route.id))
    case 'author':
      return authorHead(await getProfile(cfg, route.accountName))
    case 'collection':
      return collectionHead(await getCollection(cfg, route.id))
    case 'tag':
      return tagHead(route.tag, await tagExists(cfg, route.tag))
  }
}

async function sitemap(cfg: SupabaseConfig | null): Promise<Response> {
  try {
    if (!cfg) throw new Error('Sin configuración de Supabase')
    return new Response(buildSitemap(await getSitemapData(cfg)), {
      headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
    })
  } catch {
    // Un sitemap incompleto o un index.html no sirven: mejor decir «vuelve más tarde».
    return new Response('Sitemap no disponible', { status: 503, headers: { 'Retry-After': '300' } })
  }
}

async function page(request: Request, env: Env, route: Exclude<Route, { kind: 'sitemap' }>): Promise<Response> {
  // Petición limpia (sin If-None-Match…) para recibir siempre el HTML completo.
  const base = await env.ASSETS.fetch(new Request(request.url))
  if (!base.ok || !(base.headers.get('content-type') ?? '').includes('text/html')) return base

  const html = await base.text()
  const headers = new Headers(base.headers)
  for (const h of ['content-length', 'content-encoding', 'etag']) headers.delete(h)
  const reply = (body: string) => new Response(body, { status: base.status, headers })

  const cfg = supabaseConfig(env)
  if (!cfg) return reply(html)
  try {
    return reply(injectSeo(html, renderHead(await headFor(route, cfg))))
  } catch {
    return reply(html)
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const route = request.method === 'GET' ? matchRoute(new URL(request.url).pathname) : null
      if (!route) return await env.ASSETS.fetch(request)
      if (route.kind === 'sitemap') return await sitemap(supabaseConfig(env))
      return await page(request, env, route)
    } catch {
      return env.ASSETS.fetch(request)
    }
  },
} satisfies ExportedHandler<Env>
