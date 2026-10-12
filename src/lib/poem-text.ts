/**
 * Fragmento para listados: conserva saltos de línea y estrofas, y corta
 * siempre entre líneas. Devuelve si hubo recorte.
 */
export function makeExcerpt(content: string, maxLines = 6, maxChars = 260): { text: string; truncated: boolean } {
  const lines = content.split('\n')
  const out: string[] = []
  let chars = 0
  for (const line of lines) {
    if (out.length >= maxLines || (out.length > 0 && chars + line.length > maxChars)) break
    out.push(line)
    chars += line.length + 1
  }
  while (out.length > 0 && out[out.length - 1].trim() === '') out.pop()
  const truncated = out.length < lines.length
  return { text: out.join('\n') + (truncated ? '…' : ''), truncated }
}

export function firstLine(content: string): string {
  return content.split('\n').find((l) => l.trim() !== '')?.trim() ?? ''
}
