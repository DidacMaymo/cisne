// Markdown mínimo de los artículos de la comunidad. Solo lo necesario: párrafos,
// `##`/`###`, listas, enlaces, cursiva, negrita y citas. No hay HTML crudo: el
// resultado es un árbol de datos (no una cadena HTML) que la UI convierte en
// elementos React, que escapan todo el texto. Lógica pura.

export type Inline =
  | { t: 'text'; text: string }
  | { t: 'br' }
  | { t: 'em'; children: Inline[] }
  | { t: 'strong'; children: Inline[] }
  | { t: 'link'; href: string; children: Inline[] }

export type Block =
  | { t: 'h2' | 'h3' | 'p' | 'quote'; children: Inline[] }
  | { t: 'ul' | 'ol'; items: Inline[][] }

/** Solo enlaces web, correo o rutas internas: nunca `javascript:` ni `data:`. */
export function isSafeHref(href: string): boolean {
  return /^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(href)
}

const ESCAPABLE = /[\\*_[\]()#>`-]/

export function parseInline(src: string): Inline[] {
  const out: Inline[] = []
  let buf = ''
  const flush = () => {
    if (buf) out.push({ t: 'text', text: buf })
    buf = ''
  }
  let i = 0
  while (i < src.length) {
    const c = src[i]
    const rest = src.slice(i)
    if (c === '\\' && i + 1 < src.length && ESCAPABLE.test(src[i + 1])) {
      buf += src[i + 1]
      i += 2
      continue
    }
    if (c === '[') {
      const m = /^\[([^\]]+)\]\(([^)\s]+)\)/.exec(rest)
      if (m) {
        flush()
        const children = parseInline(m[1])
        if (isSafeHref(m[2])) out.push({ t: 'link', href: m[2], children })
        else out.push(...children)
        i += m[0].length
        continue
      }
    }
    if (rest.startsWith('**')) {
      const end = src.indexOf('**', i + 3)
      if (end > i + 2 && !/^\s/.test(src[i + 2])) {
        flush()
        out.push({ t: 'strong', children: parseInline(src.slice(i + 2, end)) })
        i = end + 2
        continue
      }
    }
    if ((c === '*' || c === '_') && !rest.startsWith(c + c)) {
      const before = i > 0 ? src[i - 1] : ' '
      const ok = c === '*' || !/[\p{L}\p{N}]/u.test(before)
      let end = ok && !/^\s/.test(src[i + 1] ?? ' ') ? src.indexOf(c, i + 2) : -1
      while (end > 0 && src[end - 1] === '\\') end = src.indexOf(c, end + 1)
      if (end > i + 1 && !/\s/.test(src[end - 1])) {
        flush()
        out.push({ t: 'em', children: parseInline(src.slice(i + 1, end)) })
        i = end + 1
        continue
      }
    }
    buf += c
    i++
  }
  flush()
  return out
}

const UL = /^[-*] +/
const OL = /^\d+[.)] +/
const startsBlock = (l: string) => /^#{2,3} /.test(l) || UL.test(l) || OL.test(l) || l.startsWith('>')

export function parseMarkdown(src: string): Block[] {
  const lines = src.replace(/\r\n?/g, '\n').split('\n').map((l) => l.trimEnd())
  const blocks: Block[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.trim() === '') {
      i++
      continue
    }
    const h = /^(#{2,3}) +(.+)$/.exec(line)
    if (h) {
      blocks.push({ t: h[1].length === 2 ? 'h2' : 'h3', children: parseInline(h[2].trim()) })
      i++
      continue
    }
    const marker = UL.test(line) ? UL : OL.test(line) ? OL : null
    if (marker) {
      const items: Inline[][] = []
      while (i < lines.length && marker.test(lines[i])) {
        items.push(parseInline(lines[i].replace(marker, '').trim()))
        i++
      }
      blocks.push({ t: marker === UL ? 'ul' : 'ol', items })
      continue
    }
    if (line.startsWith('>')) {
      // Cada línea `>` conserva su salto (son versos); una `>` vacía separa párrafos.
      const parts: string[] = []
      while (i < lines.length && lines[i].startsWith('>')) {
        parts.push(lines[i].replace(/^> ?/, '').trim())
        i++
      }
      while (parts.length && parts[parts.length - 1] === '') parts.pop()
      const children: Inline[] = []
      let blank = 0
      parts.forEach((p, k) => {
        if (p === '') {
          blank++
          return
        }
        if (k > 0) children.push({ t: 'br' })
        if (blank > 0) children.push({ t: 'br' })
        blank = 0
        children.push(...parseInline(p))
      })
      blocks.push({ t: 'quote', children })
      continue
    }
    const parts: string[] = []
    while (i < lines.length && lines[i].trim() !== '' && (parts.length === 0 || !startsBlock(lines[i]))) {
      parts.push(lines[i].trim())
      i++
    }
    blocks.push({ t: 'p', children: parseInline(parts.join(' ')) })
  }
  return blocks
}
