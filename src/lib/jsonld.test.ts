import { describe, expect, it } from 'vitest'
import { authorJsonLd, collectionJsonLd, poemJsonLd } from './jsonld'
import { applyJsonLd, type HeadDoc } from './jsonld-dom'
import { poemHead } from '../../worker/head'

const poem = {
  id: 'p1',
  title: 'Mar',
  content: 'Verso uno\nVerso dos',
  publishedAt: '2026-01-01',
  updatedAt: '2026-01-02',
  authorName: 'Ana Real',
  authorAccountName: 'ana',
  sensitive: false,
  tags: [{ normalizedName: 'mar' }],
}

describe('JSON-LD compartido', () => {
  it('poema con autor enlaza a su página', () => {
    const ld = poemJsonLd(poem) as { author: { url: string }; keywords: string }
    expect(ld.author.url).toContain('/autor/ana')
    expect(ld.keywords).toBe('mar')
  })

  it('anónimo o seudónimo: sin autor', () => {
    const ld = poemJsonLd({ ...poem, authorAccountName: null, authorName: 'Seudónimo' })
    expect(ld).not.toHaveProperty('author')
    expect(JSON.stringify(ld)).not.toContain('Ana Real')
  })

  it('el Worker y la SPA generan lo mismo', () => {
    const head = poemHead({
      id: 'p1',
      title: 'Mar',
      content: poem.content,
      published_at: '2026-01-01',
      updated_at: '2026-01-02',
      author_name: 'Ana Real',
      author_account_name: 'ana',
      sensitive: false,
      tags: [{ name: 'Mar', normalizedName: 'mar' }],
    })
    expect(head.jsonLd).toEqual(poemJsonLd(poem))
  })

  it('autor y colección', () => {
    expect(authorJsonLd({ accountName: 'ana', displayName: 'Ana', links: ['https://a.es', 'x'] })).toMatchObject({
      '@type': 'Person',
      sameAs: ['https://a.es'],
    })
    const c = collectionJsonLd({ id: 'c1', title: 'T', ownerName: 'Ana', ownerAccountName: null })
    expect(c).toMatchObject({ '@type': 'CollectionPage' })
    expect(c).not.toHaveProperty('author')
  })
})

type Node = { remove(): void; attrs: Record<string, string>; type?: string; textContent: string | null }

function fakeDoc(initial: { seo?: boolean; jsonld?: boolean }[]) {
  const nodes: Node[] = []
  const make = (): Node => {
    const n: Node = {
      attrs: {},
      textContent: null,
      remove: () => void nodes.splice(nodes.indexOf(n), 1),
    }
    return n
  }
  for (const i of initial) {
    const n = make()
    if (i.seo) n.attrs['data-seo'] = ''
    if (i.jsonld) n.attrs['data-jsonld'] = ''
    nodes.push(n)
  }
  const doc = {
    head: {
      querySelectorAll: (sel: string) =>
        nodes.filter((n) => (sel.includes('data-seo') && 'data-seo' in n.attrs) || (sel.includes('data-jsonld') && 'data-jsonld' in n.attrs)),
      appendChild: (n: unknown) => nodes.push(n as Node),
    },
    createElement: () => {
      const n = make()
      return Object.assign(n, { setAttribute: (k: string, v: string) => void (n.attrs[k] = v) })
    },
  }
  return { doc: doc as unknown as HeadDoc, nodes }
}

describe('applyJsonLd', () => {
  it('sustituye el del Worker y el de la página anterior, sin tocar el Organization', () => {
    // 1 Organization (sin marcas), 1 del Worker, 1 de una página anterior
    const { doc, nodes } = fakeDoc([{}, { seo: true }, { jsonld: true }])
    applyJsonLd(doc, { '@type': 'CreativeWork' })
    expect(nodes).toHaveLength(2)
    expect(nodes.filter((n) => 'data-jsonld' in n.attrs)).toHaveLength(1)
  })

  it('al desmontar quita el suyo; sin datos no deja ninguno', () => {
    const { doc, nodes } = fakeDoc([{}])
    const clear = applyJsonLd(doc, { a: 1 })
    expect(nodes).toHaveLength(2)
    clear()
    expect(nodes).toHaveLength(1)
    applyJsonLd(doc, undefined)
    expect(nodes).toHaveLength(1)
  })

  it('escapa < > & para no cerrar el script', () => {
    const { doc, nodes } = fakeDoc([])
    applyJsonLd(doc, { a: '</script>&' })
    expect(nodes[0].textContent).not.toMatch(/[<>&]/)
  })
})
