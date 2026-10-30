import { Link, useParams } from 'react-router-dom'
import { Markdown } from '../components/comunidad/Markdown'
import { Seo } from '../components/Seo'
import { formatArticleDate } from '../lib/comunidad'
import { getArticle } from '../lib/comunidad-content'
import { articleMeta } from '../lib/seo'
import { NotFound } from './NotFound'

export function ComunidadArticulo() {
  const { slug = '' } = useParams()
  const a = getArticle(slug)
  if (!a) return <NotFound />
  return (
    <article className="mx-auto w-full max-w-pagina py-6 md:py-12">
      <Seo {...articleMeta(a)} />
      <p className="meta">
        <Link to="/comunidad" className="underline-offset-4 hover:underline">
          Comunidad de escritores
        </Link>
      </p>
      <h1 className="mt-4 text-balance font-serif text-4xl italic leading-tight md:text-5xl">{a.titulo}</h1>
      <p className="meta mt-4">
        {a.autor} · <time dateTime={a.fecha}>{formatArticleDate(a.fecha)}</time>
        {a.borrador && ' · borrador (solo visible en desarrollo)'}
      </p>
      <div className="mt-10">
        <Markdown source={a.cuerpo} />
      </div>
      <aside className="mt-16 border-t border-linea pt-10 text-center">
        <p className="font-serif text-2xl italic">¿Escribes poesía? Este es tu lugar.</p>
        <Link to="/escribir" className="btn btn-primario mt-6">
          Escribir en CISNE
        </Link>
      </aside>
    </article>
  )
}
