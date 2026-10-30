// Artículos de la comunidad: ficheros Markdown con frontmatter en `content/comunidad/`.
// Esta es la única fuente de verdad del formato: la usan la SPA, el build (que
// genera `comunidad.json` para el Worker) y los tests. Lógica pura, sin DOM.

export interface ArticleMeta {
  /** Nombre del fichero sin `.md`. */
  slug: string
  titulo: string
  descripcion: string
  /** AAAA-MM-DD */
  fecha: string
  autor: string
  etiquetas: string[]
  borrador: boolean
}

export interface Article extends ArticleMeta {
  /** Markdown del cuerpo (sin frontmatter). */
  cuerpo: string
}

export const MAX_DESCRIPTION = 160

function unquote(v: string): string {
  const t = v.trim()
  return t.length >= 2 && /^(["']).*\1$/.test(t) ? t.slice(1, -1) : t
}

/** Separa `--- clave: valor ---` del cuerpo. Admite comentarios `#` y CRLF. */
export function parseFrontmatter(input: string): { data: Record<string, string>; body: string } {
  const raw = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input // quita la marca BOM de algunos editores
  const m = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)([\s\S]*)$/.exec(raw)
  if (!m) throw new Error('Falta el frontmatter (bloque entre líneas ---)')
  const data: Record<string, string> = {}
  for (const line of m[1].split(/\r?\n/)) {
    if (line.trim() === '' || line.trim().startsWith('#')) continue
    const kv = /^([A-Za-zñÑ_]+)\s*:\s*(.*)$/.exec(line)
    if (!kv) throw new Error(`Línea de frontmatter no válida: «${line.trim()}»`)
    data[kv[1]] = kv[2].trim()
  }
  return { data, body: m[2] }
}

function parseList(v: string): string[] {
  const inner = v.startsWith('[') && v.endsWith(']') ? v.slice(1, -1) : v
  return inner
    .split(',')
    .map(unquote)
    .filter((s) => s !== '')
}

function validDate(v: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false
  const d = new Date(`${v}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v
}

/** Lanza un `Error` con un mensaje en español si el fichero no es válido. */
export function parseArticle(slug: string, raw: string): Article {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) throw new Error('El nombre del fichero solo admite minúsculas, números y guiones')
  const { data, body } = parseFrontmatter(raw)
  const titulo = unquote(data.titulo ?? '')
  const descripcion = unquote(data.descripcion ?? '')
  const autor = unquote(data.autor ?? '')
  const fecha = unquote(data.fecha ?? '')
  if (!titulo) throw new Error('Falta «titulo»')
  if (!descripcion) throw new Error('Falta «descripcion»')
  if (descripcion.length > MAX_DESCRIPTION) throw new Error(`«descripcion» supera ${MAX_DESCRIPTION} caracteres`)
  if (!autor) throw new Error('Falta «autor»')
  if (!validDate(fecha)) throw new Error('«fecha» debe ser AAAA-MM-DD y real')
  if (data.etiquetas === undefined) throw new Error('Falta «etiquetas» (puede ir vacía: [])')
  const b = data.borrador?.trim().toLowerCase()
  if (b !== undefined && b !== '' && b !== 'true' && b !== 'false') throw new Error('«borrador» debe ser true o false')
  return {
    slug,
    titulo,
    descripcion,
    fecha,
    autor,
    etiquetas: parseList(data.etiquetas),
    borrador: b === 'true',
    cuerpo: body.trim(),
  }
}

export interface LoadResult {
  articles: Article[]
  /** Un mensaje por fichero inválido (el fichero se omite). */
  errors: string[]
}

/**
 * Carga un mapa `ruta → texto`. Ignora lo que no sea `.md` y los ficheros que empiezan por
 * `_` (plantillas). Los borradores solo entran con `includeDrafts`. Orden: fecha descendente.
 */
export function loadArticles(files: Record<string, string>, includeDrafts: boolean): LoadResult {
  const articles: Article[] = []
  const errors: string[] = []
  for (const [path, raw] of Object.entries(files)) {
    const name = path.split('/').pop() ?? ''
    if (!name.endsWith('.md') || name.startsWith('_')) continue
    const slug = name.slice(0, -3)
    try {
      const a = parseArticle(slug, raw)
      if (!a.borrador || includeDrafts) articles.push(a)
    } catch (e) {
      errors.push(`${name}: ${e instanceof Error ? e.message : 'no válido'}`)
    }
  }
  articles.sort((a, b) => b.fecha.localeCompare(a.fecha) || a.slug.localeCompare(b.slug))
  return { articles, errors }
}

export function toMeta(a: Article): ArticleMeta {
  const { slug, titulo, descripcion, fecha, autor, etiquetas, borrador } = a
  return { slug, titulo, descripcion, fecha, autor, etiquetas, borrador }
}

/** «28 de octubre de 2026» a partir de AAAA-MM-DD (sin desfases de zona horaria). */
export function formatArticleDate(fecha: string): string {
  return new Date(`${fecha}T00:00:00Z`).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
