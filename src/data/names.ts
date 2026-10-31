// Reglas de nombres públicos y pseudónimos. Espejo de la migración
// 20261102120000_nombres_unicos.sql: si cambias una, cambia la otra.
import { foldText } from './normalize'

/** Días que hay que esperar entre dos cambios de nombre público. */
export const NAME_CHANGE_DAYS = 30

/** «  Ana   LÍA » → «ana lia»: minúsculas, sin tildes ni diéresis, espacios colapsados. */
export function normalizeName(raw: string): string {
  return foldText(raw).replace(/\s+/g, ' ').trim()
}

// «anonimo» y «sin nombre» son los textos que las vistas usan como marcador.
const RESERVED = [
  'cisne',
  'cisneverso',
  'equipo de cisne',
  'administracion',
  'administrador',
  'admin',
  'moderacion',
  'soporte',
  'anonimo',
  'anonima',
  'sin nombre',
]

/** ¿Es un nombre que nadie puede usar (nombre público ni pseudónimo)? */
export function isReservedName(raw: string): boolean {
  return RESERVED.includes(normalizeName(raw))
}

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto',
  'septiembre', 'octubre', 'noviembre', 'diciembre',
]

/** «12 de noviembre de 2026» (UTC), igual que `format_date_es` en SQL. */
export function formatDateEs(d: Date): string {
  return `${d.getUTCDate()} de ${MESES[d.getUTCMonth()]} de ${d.getUTCFullYear()}`
}

/** Cuándo podrá volver a cambiar el nombre; `null` si ya puede (o nunca lo ha cambiado). */
export function nextNameChange(changedAt: string | undefined, now: number = Date.now()): Date | null {
  if (!changedAt) return null
  const next = new Date(new Date(changedAt).getTime() + NAME_CHANGE_DAYS * 86_400_000)
  return next.getTime() > now ? next : null
}

export const nameMessages = {
  reserved: 'Ese nombre está reservado. Elige otro.',
  taken: 'Ese nombre ya lo usa otra persona. Elige otro.',
  empty: 'Tu nombre público no puede quedar vacío.',
  pseudonymReserved: 'Ese pseudónimo está reservado. Elige otro.',
  pseudonymTaken: 'Ese pseudónimo coincide con el nombre público de otra persona. Elige otro.',
  tooSoon: (next: Date) =>
    `Solo puedes cambiar tu nombre público una vez cada ${NAME_CHANGE_DAYS} días. Podrás volver a cambiarlo a partir del ${formatDateEs(next)}.`,
}
