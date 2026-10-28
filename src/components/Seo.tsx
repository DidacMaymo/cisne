import { useEffect } from 'react'
import { canonicalUrl, type PageMeta } from '../lib/seo'

/**
 * Metadatos de la página. React 19 sube <title>, <meta> y <link> al <head>.
 * Al montarse retira lo que el Worker o `index.html` escribieron (`data-seo`),
 * para que no queden etiquetas viejas al navegar dentro de la SPA.
 */
export function Seo({ title, description, path, noindex }: Partial<PageMeta> & { title: string }) {
  useEffect(() => {
    document.head.querySelectorAll('[data-seo]').forEach((n) => n.remove())
  }, [])
  return (
    <>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {path !== undefined && <link rel="canonical" href={canonicalUrl(path)} />}
      {noindex && <meta name="robots" content="noindex" />}
    </>
  )
}
