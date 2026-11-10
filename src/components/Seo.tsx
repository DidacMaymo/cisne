import { useEffect } from 'react'
import type { JsonLd } from '../lib/jsonld'
import { applyJsonLd, type HeadDoc } from '../lib/jsonld-dom'
import { canonicalUrl, type PageMeta } from '../lib/seo'

/**
 * Metadatos de la página. React 19 sube <title>, <meta> y <link> al <head>.
 * Al montarse retira lo que el Worker o `index.html` escribieron (`data-seo`),
 * para que no queden etiquetas viejas al navegar dentro de la SPA. El JSON-LD
 * (`jsonLd`, generado con la misma lógica que el Worker) se vuelve a poner aquí.
 */
export function Seo({
  title,
  description,
  path,
  noindex,
  jsonLd,
}: Partial<PageMeta> & { title: string; jsonLd?: JsonLd }) {
  useEffect(() => {
    document.head.querySelectorAll('[data-seo]').forEach((n) => n.remove())
  }, [])
  const ldKey = jsonLd && !noindex ? JSON.stringify(jsonLd) : ''
  useEffect(() => applyJsonLd(document as unknown as HeadDoc, ldKey ? (JSON.parse(ldKey) as JsonLd) : undefined), [ldKey])
  return (
    <>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {path !== undefined && <link rel="canonical" href={canonicalUrl(path)} />}
      {noindex && <meta name="robots" content="noindex" />}
    </>
  )
}
