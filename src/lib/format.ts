const fecha = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric' })

export function formatDate(iso: string | null | undefined): string {
  return iso ? fecha.format(new Date(iso)) : ''
}

/** Número de día desde 1970: semilla estable durante 24 h para «Descubrir». */
export function dayNumber(): number {
  return Math.floor(Date.now() / 86_400_000)
}
