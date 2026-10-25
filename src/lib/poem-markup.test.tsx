import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { firstLine, makeExcerpt } from './poem-text'
import { renderMarkup, stripMarkup, toggleMark } from './poem-markup'

const html = (t: string) => renderToStaticMarkup(<>{renderMarkup(t)}</>)

describe('renderMarkup', () => {
  it('negrita y cursiva', () => {
    expect(html('**a** y *b*')).toBe('<strong>a</strong> y <em>b</em>')
  })
  it('conserva saltos de línea y estrofas', () => {
    expect(html('uno\ndos\n\ntres')).toBe('uno\ndos\n\ntres')
  })
  it('las marcas no cruzan un salto de línea', () => {
    expect(html('*uno\ndos*')).toBe('*uno\ndos*')
  })
  it('la barra invertida escribe el signo literal', () => {
    expect(html('\\*no\\*')).toBe('*no*')
  })
})

describe('stripMarkup', () => {
  it('quita las marcas y deja los versos', () => {
    expect(stripMarkup('**a**\n*b*\n\n~~c~~')).toBe('a\nb\n\nc')
  })
})

describe('toggleMark', () => {
  it('envuelve y desenvuelve la selección', () => {
    const on = toggleMark('hola mundo', 0, 4, 'bold')
    expect(on.value).toBe('**hola** mundo')
    expect(toggleMark(on.value, on.start, on.end, 'bold').value).toBe('hola mundo')
  })
  it('marca cada verso por separado', () => {
    expect(toggleMark('a\nb', 0, 3, 'italic').value).toBe('*a*\n*b*')
  })
})

describe('poem-text', () => {
  it('makeExcerpt corta entre líneas y conserva estrofas', () => {
    const r = makeExcerpt('a\nb\n\nc\nd\ne\nf\ng', 4)
    expect(r.text).toBe('a\nb\n\nc…')
    expect(r.truncated).toBe(true)
  })
  it('makeExcerpt no recorta un poema corto', () => {
    expect(makeExcerpt('a\nb')).toEqual({ text: 'a\nb', truncated: false })
  })
  it('firstLine salta líneas vacías y quita marcas', () => {
    expect(firstLine('\n**Hola** mundo\notro')).toBe('Hola mundo')
  })
})
