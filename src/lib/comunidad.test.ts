import { describe, expect, it } from 'vitest'
import {
  formatArticleDate,
  isPublished,
  loadArticles,
  madridToday,
  parseArticle,
  parseFrontmatter,
  toMeta,
  visibleArticles,
} from './comunidad'
import { isSafeHref, parseInline, parseMarkdown } from './markdown'

const fm = (over: Record<string, string | null> = {}, body = 'Texto.') => {
  const base: Record<string, string> = {
    titulo: 'Un título',
    descripcion: 'Una descripción',
    fecha: '2026-03-04',
    autor: 'Ana',
    etiquetas: '[a, b]',
  }
  const lines = Object.entries({ ...base, ...over })
    .filter(([, v]) => v !== null)
    .map(([k, v]) => `${k}: ${v}`)
  return `---\n${lines.join('\n')}\n---\n\n${body}\n`
}

describe('frontmatter', () => {
  it('lee claves, ignora comentarios y soporta CRLF', () => {
    const { data, body } = parseFrontmatter('---\r\n# nota\r\ntitulo: "Hola: mundo"\r\n---\r\nCuerpo')
    expect(data.titulo).toBe('"Hola: mundo"')
    expect(body).toBe('Cuerpo')
  })
  it('sin frontmatter lanza error', () => {
    expect(() => parseFrontmatter('Solo texto')).toThrow()
  })
})

describe('parseArticle', () => {
  it('lee todos los campos', () => {
    const a = parseArticle('mi-slug', fm({ titulo: '"Con: dos puntos"', etiquetas: '[uno, "dos"]', borrador: 'true' }))
    expect(a).toMatchObject({
      slug: 'mi-slug',
      titulo: 'Con: dos puntos',
      fecha: '2026-03-04',
      autor: 'Ana',
      etiquetas: ['uno', 'dos'],
      borrador: true,
      cuerpo: 'Texto.',
    })
    expect(toMeta(a)).not.toHaveProperty('cuerpo')
  })
  it('etiquetas vacías y borrador por defecto', () => {
    const a = parseArticle('x', fm({ etiquetas: '[]' }))
    expect(a.etiquetas).toEqual([])
    expect(a.borrador).toBe(false)
  })
  it.each([
    ['sin título', { titulo: null }],
    ['sin descripción', { descripcion: null }],
    ['descripción de más de 160', { descripcion: 'a'.repeat(161) }],
    ['sin autor', { autor: null }],
    ['sin fecha', { fecha: null }],
    ['fecha con otro formato', { fecha: '4/3/2026' }],
    ['fecha inexistente', { fecha: '2026-02-30' }],
    ['sin etiquetas', { etiquetas: null }],
    ['borrador raro', { borrador: 'quizá' }],
  ])('rechaza %s', (_n, over) => {
    expect(() => parseArticle('x', fm(over))).toThrow()
  })
  it('rechaza slugs con mayúsculas o espacios', () => {
    expect(() => parseArticle('Mi Slug', fm())).toThrow()
  })
  it('acepta 160 caracteres exactos', () => {
    expect(parseArticle('x', fm({ descripcion: 'a'.repeat(160) })).descripcion).toHaveLength(160)
  })
})

describe('loadArticles', () => {
  const files = {
    '/content/comunidad/viejo.md': fm({ fecha: '2026-01-01' }),
    '/content/comunidad/nuevo.md': fm({ fecha: '2026-06-01' }),
    '/content/comunidad/medio.md': fm({ fecha: '2026-03-01' }),
    '/content/comunidad/oculto.md': fm({ fecha: '2026-09-01', borrador: 'true' }),
    '/content/comunidad/_plantilla.md': fm(),
    '/content/comunidad/roto.md': '---\ntitulo: solo\n---\nx',
    '/content/comunidad/notas.txt': 'nada',
  }
  it('ordena por fecha descendente, sin borradores ni plantillas, y avisa de los inválidos', () => {
    const { articles, errors } = loadArticles(files, false)
    expect(articles.map((a) => a.slug)).toEqual(['nuevo', 'medio', 'viejo'])
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('roto.md')
  })
  it('con borradores (modo desarrollo) los incluye', () => {
    expect(loadArticles(files, true).articles.map((a) => a.slug)).toEqual(['oculto', 'nuevo', 'medio', 'viejo'])
  })
  it('misma fecha: orden estable por slug', () => {
    const r = loadArticles({ 'b.md': fm(), 'a.md': fm() }, false)
    expect(r.articles.map((a) => a.slug)).toEqual(['a', 'b'])
  })
})

describe('programación por fecha (Europe/Madrid)', () => {
  const art = (fecha: string, borrador = false) => ({ fecha, borrador })
  it('madridToday usa la fecha civil de Madrid, no la de UTC', () => {
    expect(madridToday(new Date('2026-11-04T22:30:00Z'))).toBe('2026-11-04') // 23:30 en Madrid (CET)
    expect(madridToday(new Date('2026-11-04T23:30:00Z'))).toBe('2026-11-05') // 00:30 en Madrid
    expect(madridToday(new Date('2026-07-04T22:30:00Z'))).toBe('2026-07-05') // verano (CEST): 00:30
  })
  it('víspera: programado; mismo día: publicado; después: publicado', () => {
    const a = art('2026-11-05')
    expect(isPublished(a, new Date('2026-11-04T12:00:00Z'))).toBe(false)
    expect(isPublished(a, new Date('2026-11-05T08:00:00Z'))).toBe(true)
    expect(isPublished(a, new Date('2026-12-01T08:00:00Z'))).toBe(true)
  })
  it('cambio de día: a las 23:30 UTC ya es mañana en Madrid', () => {
    expect(isPublished(art('2026-11-05'), new Date('2026-11-04T23:30:00Z'))).toBe(true)
  })
  it('un borrador nunca está publicado', () => {
    expect(isPublished(art('2020-01-01', true), new Date('2026-11-05T08:00:00Z'))).toBe(false)
  })
  it('visibleArticles filtra, salvo includeHidden (dev)', () => {
    const list = [art('2026-11-06'), art('2026-11-04'), art('2026-11-03', true)]
    const now = new Date('2026-11-05T08:00:00Z')
    expect(visibleArticles(list, false, now)).toEqual([art('2026-11-04')])
    expect(visibleArticles(list, true, now)).toHaveLength(3)
  })
})

describe('formatArticleDate', () => {
  it('formatea en español sin desfase de zona', () => {
    expect(formatArticleDate('2026-03-04')).toBe('4 de marzo de 2026')
  })
})

describe('markdown: bloques', () => {
  it('párrafos, encabezados, listas y citas', () => {
    const blocks = parseMarkdown('Uno\ndos\n\n## T2\n### T3\n- a\n- b\n\n1. x\n2. y\n\n> cita\n> larga')
    expect(blocks.map((b) => b.t)).toEqual(['p', 'h2', 'h3', 'ul', 'ol', 'quote'])
    expect(blocks[0]).toEqual({ t: 'p', children: [{ t: 'text', text: 'Uno dos' }] })
    expect(blocks[3]).toMatchObject({ items: [[{ text: 'a' }], [{ text: 'b' }]] })
    expect(blocks[5]).toEqual({
      t: 'quote',
      children: [{ t: 'text', text: 'cita' }, { t: 'br' }, { t: 'text', text: 'larga' }],
    })
  })
  it('las citas conservan los saltos de verso y una línea > vacía separa párrafos', () => {
    const [q] = parseMarkdown('> verso uno\n> verso dos\n>\n> otra estrofa')
    expect(q).toEqual({
      t: 'quote',
      children: [
        { t: 'text', text: 'verso uno' },
        { t: 'br' },
        { t: 'text', text: 'verso dos' },
        { t: 'br' },
        { t: 'br' },
        { t: 'text', text: 'otra estrofa' },
      ],
    })
  })
  it('un h1 no existe: es un párrafo', () => {
    expect(parseMarkdown('# Hola')[0].t).toBe('p')
  })
})

describe('markdown: en línea', () => {
  it('negrita, cursiva y enlaces anidados', () => {
    expect(parseInline('a **b** [d](https://x.es) _e_')).toEqual([
      { t: 'text', text: 'a ' },
      { t: 'strong', children: [{ t: 'text', text: 'b' }] },
      { t: 'text', text: ' ' },
      { t: 'link', href: 'https://x.es', children: [{ t: 'text', text: 'd' }] },
      { t: 'text', text: ' ' },
      { t: 'em', children: [{ t: 'text', text: 'e' }] },
    ])
  })
  it('no confunde snake_case ni asteriscos sueltos', () => {
    expect(parseInline('a_b_c 2 * 3')).toEqual([{ t: 'text', text: 'a_b_c 2 * 3' }])
  })
  it('respeta el escapado', () => {
    expect(parseInline('\\*no\\*')).toEqual([{ t: 'text', text: '*no*' }])
  })
  it('el HTML crudo queda como texto', () => {
    expect(parseInline('<script>alert(1)</script>')).toEqual([{ t: 'text', text: '<script>alert(1)</script>' }])
  })
  it('descarta enlaces javascript: y data:, dejando el texto', () => {
    const nodes = parseInline('[clic](javascript:alert(1))')
    expect(nodes.some((n) => n.t === 'link')).toBe(false)
    expect(nodes[0]).toEqual({ t: 'text', text: 'clic' })
    expect(isSafeHref('data:text/html,x')).toBe(false)
    expect(isSafeHref('//evil.com')).toBe(false)
    expect(isSafeHref('/escribir')).toBe(true)
    expect(isSafeHref('https://a.es')).toBe(true)
  })
})
