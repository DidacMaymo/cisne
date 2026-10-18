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

/** Texto sin tildes ni mayúsculas, para buscar «corazon» y encontrar «Corazón». */
export function foldText(raw: string): string {
  return raw.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

/** Nombre de cuenta para la URL del autor: «Ana Lía» → «ana-lia». */
export function slugify(raw: string): string {
  return foldText(raw)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30)
}
