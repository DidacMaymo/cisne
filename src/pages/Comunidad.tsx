import { Link } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { Seo } from '../components/Seo'
import { listArticles } from '../lib/comunidad-content'
import { formatArticleDate, isPublished } from '../lib/comunidad'
import { COMMUNITY_META } from '../lib/seo'

export function Comunidad() {
  const allArticles = listArticles()
  return (
    <section className="mx-auto w-full max-w-pagina py-6 md:py-12">
      <Seo {...COMMUNITY_META} />
      <p className="meta tracking-[0.2em] uppercase">Comunidad</p>
      <h1 className="mt-3 font-serif text-4xl italic md:text-5xl">Comunidad de escritores</h1>
      <p className="mt-4 font-serif text-xl leading-relaxed">
        Guías, recursos y libros recomendados para quienes escriben poesía.
      </p>
      {allArticles.length === 0 ? (
        <EmptyState title="Aún no hay entradas." />
      ) : (
        <ul className="mt-10 divide-y divide-linea border-y border-linea">
          {allArticles.map((a) => (
            <li key={a.slug} className="py-6">
              <Link to={`/comunidad/${a.slug}`} className="block hover:text-gris">
                <h2 className="font-serif text-3xl">{a.titulo}</h2>
                <p className="mt-2 text-ui leading-relaxed text-tinta/80">{a.descripcion}</p>
                <p className="meta mt-2">
                  {a.autor} · {formatArticleDate(a.fecha)}
                  {a.borrador ? ' · borrador' : !isPublished(a) && ' · programado'}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
