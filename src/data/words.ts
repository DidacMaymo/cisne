// Límites de palabras y conteo, sin Zod: la lectura los usa y no debe cargar el validador.

/** Los comentarios son notas al margen: breves. */
export const MAX_COMMENT_WORDS = 50

export const MAX_BIO_WORDS = 150

export function countWords(text: string): number {
  const t = text.trim()
  return t ? t.split(/\s+/).length : 0
}
