/** Etiqueta normalizada: sin «#», sin espacios sobrantes, en minúsculas. */
export function normalizeTag(raw: string): string {
  return raw
    .normalize('NFC')
    .trim()
    .replace(/^#+/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .slice(0, 30)
}

/** Guarda el poema tal cual lo escribió su autora, salvo saltos de línea y bordes. */
export function normalizePoemText(raw: string): string {
  return raw.replace(/\r\n?/g, '\n').replace(/^\n+/, '').replace(/\s+$/, '')
}
