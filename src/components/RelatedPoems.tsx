import { Link } from 'react-router-dom'
import { repos } from '../data'
import { useQuery } from '../hooks/useQuery'
import { firstLine } from '../lib/poem-text'
import { FeatherDivider } from './brand/FeatherDivider'

/** Poemas que comparten etiquetas: una lista breve y discreta, sin barra lateral. */
export function RelatedPoems({ poemId }: { poemId: string }) {
  const { data } = useQuery(() => repos.poems.related(poemId, 3), [poemId])
  if (!data || data.length === 0) return null

  return (
    <section aria-labelledby="relacionados" className="mx-auto mt-20 max-w-pagina text-center">
      <FeatherDivider className="mx-auto h-4 w-48 text-gris" />
      <h2 id="relacionados" className="meta mt-6">
        También te puede interesar
      </h2>
      <ul className="mt-4">
        {data.map((p) => (
          <li key={p.id}>
            <Link to={`/poema/${p.id}`} className="inline-flex min-h-11 flex-col items-center justify-center py-2">
              <span className="font-serif text-2xl underline-offset-4 hover:underline">
                {p.title ?? firstLine(p.content)}
              </span>
              <span className="meta">{p.authorName}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
