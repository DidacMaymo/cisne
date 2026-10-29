import { describe, expect, it } from 'vitest'
import { authorHead, collectionHead, poemHead, renderHead, tagHead, type PoemRow } from './head'
import { escapeHtml, injectSeo, jsonLdScript } from './html'
import { matchRoute } from './routes'
import { buildSitemap } from './sitemap'
import { supabaseConfig } from './supabase'
import { canonicalUrl, isPrivatePath } from '../src/lib/seo'

const ID = '0b9f7a52-6f1e-4c7c-9d55-2f3b1d6a1e01'

const poem: PoemRow = {
  id: ID,
  title: 'Mar',
  content: 'Dime, **mar**,\nqué guardas\n\nen el fondo',
  published_at: '2026-10-01T10:00:00Z',
  updated_at: '2026-10-02T10:00:00Z',
  author_name: 'Ana Lía',
  author_account_name: 'ana-lia',
  sensitive: false,
  tags: [{ name: 'Mar', normalizedName: 'mar' }],
}

describe('rutas del Worker', () => {
  it('reconoce poema, autor, colección, etiqueta y sitemap', () => {
    expect(matchRoute(`/poema/${ID}`)).toEqual({ kind: 'poem', id: ID })
    expect(matchRoute(`/poema/${ID}/`)).toEqual({ kind: 'poem', id: ID })
    expect(matchRoute('/autor/ana-lia')).toEqual({ kind: 'author', accountName: 'ana-lia' })
    expect(matchRoute(`/coleccion/${ID}`)).toEqual({ kind: 'collection', id: ID })
    expect(matchRoute('/etiqueta/%23Amor')).toEqual({ kind: 'tag', tag: 'amor' })
    expect(matchRoute('/sitemap.xml')).toEqual({ kind: 'sitemap' })
  })
  it('ignora lo demás y los parámetros inválidos (se sirve el HTML normal)', () => {
    expect(matchRoute('/')).toBeNull()
    expect(matchRoute('/explorar')).toBeNull()
    expect(matchRoute('/poema/no-es-un-uuid')).toBeNull()
    expect(matchRoute('/poema/a/b')).toBeNull()
    expect(matchRoute('/autor/%E0%A4%A')).toBeNull()
  })
  it('el manifiesto y los iconos no pasan por el Worker (los sirven los assets)', () => {
    for (const p of ['/manifest.webmanifest', '/apple-touch-icon.png', '/icons/icon-192.png', '/icons/icon-maskable-512.png'])
      expect(matchRoute(p), p).toBeNull()
  })
})

describe('escapado', () => {
  it('escapa < > " & \' en HTML', () => {
    expect(escapeHtml(`<b>"a" & 'b'</b>`)).toBe('&lt;b&gt;&quot;a&quot; &amp; &#39;b&#39;&lt;/b&gt;')
  })
  it('el JSON-LD no puede cerrar el <script>', () => {
    const out = jsonLdScript({ name: '</script><script>alert(1)</script> & "x"' })
    expect(out.match(/<\/script>/g)).toHaveLength(1)
    expect(out).not.toContain('<script>alert')
    expect(out).toContain('\\u003c/script\\u003e')
  })
  it('un título con caracteres peligrosos sale escapado en todo el <head>', () => {
    const head = renderHead(poemHead({ ...poem, title: 'A <b>"x"</b> & y', content: '<img src=x onerror=1>' }))
    expect(head).not.toContain('<b>')
    expect(head).not.toContain('<img')
    expect(head).toContain('A &lt;b&gt;&quot;x&quot;&lt;/b&gt; &amp; y')
  })
})

describe('inyección en index.html', () => {
  const html = '<head><!--seo-->\n<title>viejo</title>\n<!--/seo--><meta x></head>'
  it('sustituye el hueco', () => {
    const out = injectSeo(html, '<title>nuevo</title>')
    expect(out).toContain('<title>nuevo</title>')
    expect(out).not.toContain('viejo')
    expect(out).toContain('<meta x>')
  })
  it('no interpreta $& del contenido', () => {
    expect(injectSeo(html, '<title>$&</title>')).toContain('<title>$&</title>')
  })
  it('sin hueco devuelve el HTML tal cual', () => {
    expect(injectSeo('<head></head>', '<title>x</title>')).toBe('<head></head>')
  })
})

describe('poema', () => {
  it('título, descripción con los primeros versos, canónica absoluta sin query y og:image', () => {
    const head = renderHead(poemHead(poem))
    expect(head).toContain('<title data-seo>Mar — Ana Lía · CISNE</title>')
    expect(head).toContain('content="Dime, mar, / qué guardas / en el fondo"')
    expect(head).toContain(`<link data-seo rel="canonical" href="https://cisneverso.es/poema/${ID}" />`)
    expect(head).toContain('property="og:image" content="https://cisneverso.es/og.png"')
    expect(head).not.toContain('?')
    expect(head).toContain('"@type":"CreativeWork"')
    expect(head).toContain('"genre":"poesía"')
    expect(head).toContain('"inLanguage":"es"')
    expect(head).toContain('"author":{"@type":"Person","name":"Ana Lía"')
    expect(head).not.toContain('noindex')
  })
  it('un anónimo o un seudónimo (sin cuenta) no sacan autor ni en título ni en JSON-LD', () => {
    for (const author_name of ['Anónimo', 'Luna Gris']) {
      const head = renderHead(poemHead({ ...poem, author_name, author_account_name: null }))
      expect(head).toContain('<title data-seo>Mar · CISNE</title>')
      expect(head).not.toContain(author_name)
      expect(head).not.toContain('"author"')
      expect(head).not.toContain('/autor/')
    }
  })
  it('un poema sensible no enseña versos en la descripción', () => {
    const head = renderHead(poemHead({ ...poem, sensitive: true }))
    expect(head).not.toContain('qué guardas')
  })
  it('un poema sensible sin título no filtra ningún verso en el head', () => {
    const head = renderHead(poemHead({ ...poem, title: null, sensitive: true }))
    expect(head).not.toContain('Dime')
    expect(head).toContain('<title data-seo>Poema — Ana Lía · CISNE</title>')
  })
  it('un poema inexistente es noindex, sin canónica ni JSON-LD', () => {
    const head = renderHead(poemHead(null))
    expect(head).toContain('<meta data-seo name="robots" content="noindex" />')
    expect(head).not.toContain('canonical')
    expect(head).not.toContain('ld+json')
  })
  it('sin título usa el primer verso', () => {
    expect(renderHead(poemHead({ ...poem, title: null }))).toContain('<title data-seo>Dime, mar, — Ana Lía · CISNE</title>')
  })
})

describe('autor, colección y etiqueta', () => {
  it('autor: nombre, bio, Person y enlaces http(s)', () => {
    const head = renderHead(
      authorHead({ account_name: 'ana-lia', display_name: 'Ana Lía', bio: 'Escribo.', links: ['https://a.es', 'javascript:x'] }),
    )
    expect(head).toContain('<title data-seo>Ana Lía — poemas en CISNE</title>')
    expect(head).toContain('href="https://cisneverso.es/autor/ana-lia"')
    expect(head).toContain('"@type":"Person"')
    expect(head).toContain('"sameAs":["https://a.es"]')
  })
  it('autor inexistente: noindex', () => {
    expect(renderHead(authorHead(null))).toContain('noindex')
  })
  it('colección: CollectionPage; el dueño solo si tiene página', () => {
    const row = { id: ID, title: 'Orillas', description: null, owner_name: 'Ana', owner_account_name: null, updated_at: null }
    const anon = renderHead(collectionHead(row))
    expect(anon).toContain('"@type":"CollectionPage"')
    expect(anon).not.toContain('"author"')
    expect(renderHead(collectionHead({ ...row, owner_account_name: 'ana' }))).toContain('"author"')
    expect(renderHead(collectionHead(null))).toContain('noindex')
  })
  it('etiqueta: título; si no se usa, noindex', () => {
    expect(renderHead(tagHead('amor', true))).toContain('<title data-seo>Poemas de #amor · CISNE</title>')
    expect(renderHead(tagHead('nada', false))).toContain('noindex')
  })
})

describe('sitemap', () => {
  const xml = buildSitemap({
    poems: [
      { id: ID, published_at: '2026-10-01T10:00:00Z', updated_at: '2026-10-05T10:00:00Z', author_account_name: 'ana-lia' },
      { id: 'b', published_at: null, updated_at: null, author_account_name: null },
      { id: 'c', published_at: '2026-10-03T00:00:00Z', updated_at: null, author_account_name: 'ana-lia' },
    ],
    collections: [{ id: 'col', updated_at: '2026-10-04T00:00:00Z' }],
    tags: [{ normalized_name: 'amor' }, { normalized_name: 'a&b' }],
  })
  it('lista estáticas, poemas, autores, colecciones y etiquetas con lastmod', () => {
    expect(xml).toContain('<loc>https://cisneverso.es/</loc>')
    expect(xml).toContain('<loc>https://cisneverso.es/aviso-legal</loc>')
    expect(xml).toContain('<loc>https://cisneverso.es/sobre</loc>')
    expect(xml).toContain('<loc>https://cisneverso.es/contacto</loc>')
    expect(xml).toContain(`<loc>https://cisneverso.es/poema/${ID}</loc><lastmod>2026-10-05</lastmod>`)
    expect(xml).toContain('<loc>https://cisneverso.es/poema/b</loc></url>')
    expect(xml).toContain('<loc>https://cisneverso.es/autor/ana-lia</loc><lastmod>2026-10-05</lastmod>')
    expect(xml).toContain('<loc>https://cisneverso.es/coleccion/col</loc><lastmod>2026-10-04</lastmod>')
    expect(xml).toContain('<loc>https://cisneverso.es/etiqueta/amor</loc>')
  })
  it('un autor aparece una sola vez y los anónimos no tienen página', () => {
    expect(xml.match(/\/autor\//g)).toHaveLength(1)
  })
  it('las URLs van codificadas y escapadas', () => {
    expect(xml).toContain('/etiqueta/a%26b')
    expect(xml).not.toContain('a&b')
  })
})

describe('utilidades compartidas', () => {
  it('la canónica es absoluta y sin query ni fragmento', () => {
    expect(canonicalUrl('/autor/ana?ver=publica#x')).toBe('https://cisneverso.es/autor/ana')
  })
  it('rutas privadas', () => {
    for (const p of ['/escribir', '/escribir/1', '/mis/poemas', '/mi-pagina', '/colecciones', '/ajustes/perfil', '/entrar', '/registro', '/recuperar', '/nueva-contrasena'])
      expect(isPrivatePath(p), p).toBe(true)
    for (const p of ['/', '/explorar', `/poema/${ID}`, `/coleccion/${ID}`, '/autor/ana', '/cookies'])
      expect(isPrivatePath(p), p).toBe(false)
  })
  it('sin variables de Supabase no hay configuración', () => {
    expect(supabaseConfig({})).toBeNull()
    expect(supabaseConfig({ SUPABASE_URL: 'https://x.supabase.co/', SUPABASE_PUBLISHABLE_KEY: 'k' })).toEqual({
      url: 'https://x.supabase.co',
      key: 'k',
    })
  })
})
