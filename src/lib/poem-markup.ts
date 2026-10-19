import { createElement, type ReactNode } from 'react'

// Formato dentro del texto del poema, como marcas sencillas:
//   **negrita**   *cursiva*   __subrayado__   ~~tachado~~
// Las marcas nunca cruzan un salto de línea, así que los versos y las estrofas
// se conservan tal cual y el texto sigue siendo texto (búsqueda, fragmentos…).
// Una barra invertida escribe el signo literal: \* \_ \~

export type MarkStyle = 'bold' | 'italic' | 'underline' | 'strike'

export const marks: Record<MarkStyle, string> = {
  bold: '**',
  italic: '*',
  underline: '__',
  strike: '~~',
}

// Orden importante: «***» antes que «**», y este antes que «*».
const rules: { open: string; tag: 'emstrong' | 'strong' | 'em' | 'u' | 's' }[] = [
  { open: '***', tag: 'emstrong' },
  { open: '**', tag: 'strong' },
  { open: '__', tag: 'u' },
  { open: '~~', tag: 's' },
  { open: '*', tag: 'em' },
]

const ESCAPABLE = '*_~\\'

/** Posición del cierre de `open` desde `from` en la misma línea, o -1. */
function findClose(text: string, from: number, open: string): number {
  let j = from
  while (j < text.length && text[j] !== '\n') {
    if (text[j] === '\\' && ESCAPABLE.includes(text[j + 1] ?? '')) {
      j += 2
      continue
    }
    // Dentro de una cursiva, una negrita anidada no la cierra.
    if (open === '*' && text.startsWith('**', j)) {
      const inner = findClose(text, j + 2, '**')
      if (inner !== -1) {
        j = inner + 2
        continue
      }
    }
    if (text.startsWith(open, j)) return j
    j++
  }
  return -1
}

type Node = string | { tag: (typeof rules)[number]['tag']; children: Node[] }

function parse(text: string): Node[] {
  const out: Node[] = []
  let buf = ''
  let i = 0
  while (i < text.length) {
    const ch = text[i]
    if (ch === '\\' && ESCAPABLE.includes(text[i + 1] ?? '')) {
      buf += text[i + 1]
      i += 2
      continue
    }
    const rule = rules.find((r) => text.startsWith(r.open, i))
    if (rule) {
      const start = i + rule.open.length
      const end = findClose(text, start, rule.open)
      if (end > start) {
        if (buf) out.push(buf)
        buf = ''
        out.push({ tag: rule.tag, children: parse(text.slice(start, end)) })
        i = end + rule.open.length
        continue
      }
    }
    buf += ch
    i++
  }
  if (buf) out.push(buf)
  return out
}

function toReact(nodes: Node[], prefix: string): ReactNode[] {
  return nodes.map((n, i) => {
    if (typeof n === 'string') return n
    const key = `${prefix}${i}`
    const children = toReact(n.children, `${key}.`)
    // «***texto***»: cursiva y negrita a la vez.
    if (n.tag === 'emstrong') return createElement('em', { key }, createElement('strong', null, ...children))
    return createElement(n.tag, { key }, ...children)
  })
}

function toPlain(nodes: Node[]): string {
  return nodes.map((n) => (typeof n === 'string' ? n : toPlain(n.children))).join('')
}

/** El poema con su formato, listo para un contenedor con `white-space: pre-wrap`. */
export function renderMarkup(text: string): ReactNode[] {
  return toReact(parse(text), 'm')
}

/** El poema sin marcas: para títulos de respaldo, compartir o lectores de pantalla. */
export function stripMarkup(text: string): string {
  return toPlain(parse(text))
}

/**
 * Aplica o quita un estilo a la selección de un textarea. Si la selección
 * abarca varios versos, marca cada uno por separado (las marcas no cruzan líneas).
 */
export function toggleMark(
  value: string,
  start: number,
  end: number,
  style: MarkStyle,
): { value: string; start: number; end: number } {
  const m = marks[style]
  // Quitar: la selección ya está rodeada por la marca. Con asteriscos se
  // cuenta la racha entera: «**» es negrita, no dos cursivas.
  const runBefore = value.slice(0, start).match(/\*+$/)?.[0].length ?? 0
  const runAfter = value.slice(end).match(/^\*+/)?.[0].length ?? 0
  const isWrapped =
    style === 'italic'
      ? runBefore % 2 === 1 && runAfter % 2 === 1
      : style === 'bold'
        ? runBefore >= 2 && runAfter >= 2
        : value.slice(start - m.length, start) === m && value.slice(end, end + m.length) === m
  if (isWrapped) {
    return {
      value: value.slice(0, start - m.length) + value.slice(start, end) + value.slice(end + m.length),
      start: start - m.length,
      end: end - m.length,
    }
  }
  const selected = value.slice(start, end)
  if (!selected) {
    // Sin selección: deja el cursor entre las dos marcas.
    return { value: value.slice(0, start) + m + m + value.slice(end), start: start + m.length, end: start + m.length }
  }
  const wrapped = selected
    .split('\n')
    .map((line) => {
      const lead = line.match(/^\s*/)![0]
      const trail = line.match(/\s*$/)![0]
      const core = line.slice(lead.length, line.length - trail.length)
      return core ? `${lead}${m}${core}${m}${trail}` : line
    })
    .join('\n')
  const single = !selected.includes('\n') && selected.trim() === selected
  return {
    value: value.slice(0, start) + wrapped + value.slice(end),
    start: single ? start + m.length : start,
    end: single ? start + m.length + selected.length : start + wrapped.length,
  }
}
