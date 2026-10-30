/** Cuentas de CISNE en redes. Único sitio donde cambiarlas. */
export const socialLinks = [
  { label: 'Instagram', url: 'https://www.instagram.com/cisneverso.es/' },
  { label: 'TikTok', url: 'https://www.tiktok.com/@cisneverso.es' },
] as const

/** URL de la página de Ko-fi de CISNE. `null` hasta que exista (U5): sin URL no se muestra enlace de donación. */
export const kofiUrl: string | null = null

/** Datos estructurados (schema.org) de CISNE como organización; `index.html` los recibe en la compilación (vite.config.ts). */
export function organizationJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CISNE',
    url: 'https://cisneverso.es',
    logo: 'https://cisneverso.es/icons/icon-512.png',
    sameAs: socialLinks.map((s) => s.url),
  }
}
