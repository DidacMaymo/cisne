// Artículos empaquetados en la SPA. Vite sustituye `import.meta.glob` al compilar.
// Los borradores y los programados (fecha futura, hora de Madrid) solo se ven con `npm run dev`;
// el filtro por fecha se aplica al consultar, no al compilar, para que no haga falta redesplegar.
// Las plantillas (`_*.md`) nunca.
import { loadArticles, visibleArticles, type Article } from './comunidad'

const files = import.meta.glob<string>(['/content/comunidad/*.md', '!/content/comunidad/_*.md'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

const { articles, errors } = loadArticles(files, import.meta.env.DEV)
if (import.meta.env.DEV) for (const e of errors) console.warn(`[comunidad] ${e}`)

/** Artículos visibles ahora mismo, por fecha descendente. */
export function listArticles(): Article[] {
  return visibleArticles(articles, import.meta.env.DEV)
}

export function getArticle(slug: string): Article | undefined {
  return listArticles().find((a) => a.slug === slug)
}
