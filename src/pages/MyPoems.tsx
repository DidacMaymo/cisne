import { Link } from 'react-router-dom'
import { repos } from '../data'
import type { PoemStatus, PoemView } from '../data'
import { EmptyState } from '../components/EmptyState'
import { LoadState } from '../components/LoadState'
import { useQuery } from '../hooks/useQuery'
import { formatDate } from '../lib/format'
import { firstLine } from '../lib/poem-text'

const empty = {
  published: 'Aún no has publicado ningún poema.',
  draft: 'No tienes borradores guardados.',
} as const

/** Marcas que solo ve su dueño: privado, anónimo o con pseudónimo. */
function marks(p: PoemView): string[] {
  const out: string[] = []
  if (p.visibility === 'private') out.push('Privado')
  if (p.authorAccountName === null) out.push(p.authorName === 'Anónimo' ? 'Anónimo' : `Como ${p.authorName}`)
  return out
}

/** Lista privada del autor (publicados o borradores), para seguir editando. Va dentro de «Mi página». */
export function MyPoems({ status }: { status: PoemStatus }) {
  const { data, error, loading } = useQuery(() => repos.poems.listMine(status), [status])

  return (
    <div>
      <LoadState loading={loading} error={error} />

      {data && data.length === 0 && (
        <EmptyState title={empty[status]}>
          <Link to="/escribir" className="btn">
            Escribir un poema
          </Link>
        </EmptyState>
      )}

      {data && data.length > 0 && (
        <ul>
          {data.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-6 border-b border-linea py-5">
              <div className="min-w-0">
                <p className="truncate font-serif text-2xl">
                  {p.title ?? <span className="italic">{firstLine(p.content)}</span>}
                </p>
                <p className="meta">
                  {[formatDate(status === 'draft' ? p.updatedAt : p.publishedAt), ...(status === 'published' ? marks(p) : [])].join(' · ')}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-5">
                {status === 'published' && (
                  <Link to={`/poema/${p.id}`} className="meta inline-flex min-h-11 items-center hover:text-tinta">
                    Leer
                  </Link>
                )}
                <Link
                  to={`/escribir/${p.id}`}
                  className="meta inline-flex min-h-11 items-center hover:text-tinta"
                  aria-label={`${status === 'draft' ? 'Continuar' : 'Editar'} ${p.title ?? firstLine(p.content)}`}
                >
                  {status === 'draft' ? 'Continuar' : 'Editar'}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
