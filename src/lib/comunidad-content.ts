// Artículos empaquetados en la SPA. Vite sustituye `import.meta.glob` al compilar.
// Los borradores solo se ven con `npm run dev`; las plantillas (`_*.md`) nunca.
import { loadArticles, type Article } from './comunidad'

const files = import.meta.glob<string>(['/content/comunidad/*.md', '!/content/comunidad/_*.md'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

const { articles, errors } = loadArticles(files, import.meta.env.DEV)
if (import.meta.env.DEV) for (const e of errors) console.warn(`[comunidad] ${e}`)

export const allArticles: Article[] = articles

export function getArticle(slug: string): Article | undefined {
  return allArticles.find((a) => a.slug === slug)
}
