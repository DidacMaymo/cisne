// Utilidades de HTML/XML/JSON-LD del Worker. Lógica pura: sin APIs de Cloudflare.

/** Escapa texto para HTML (contenido y atributos) y XML. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** JSON para un <script type="application/ld+json">: `<`, `>` y `&` como \uXXXX para que no cierre el script. */
export function jsonLdScript(data: unknown): string {
  const json = JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
  return `<script type="application/ld+json" data-seo>${json}</script>`
}

const HOLE = /<!--seo-->[\s\S]*?<!--\/seo-->/

/** Sustituye el hueco `<!--seo-->…<!--/seo-->` de index.html. Sin hueco, devuelve el HTML tal cual. */
export function injectSeo(html: string, head: string): string {
  if (!HOLE.test(html)) return html
  return html.replace(HOLE, () => `<!--seo-->\n    ${head}\n    <!--/seo-->`)
}
