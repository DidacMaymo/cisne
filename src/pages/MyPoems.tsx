import { Link, useLocation } from 'react-router-dom'
import { repos } from '../data'
import type { PoemStatus } from '../data'
import { EmptyState } from '../components/EmptyState'
import { LoadState } from '../components/LoadState'
import { SwanDivider } from '../components/brand/SwanDivider'
import { useQuery } from '../hooks/useQuery'
import { formatDate } from '../lib/format'
import { firstLine } from '../lib/poem-text'

const copy = {
  published: {
    title: 'Mis poemas',
    empty: 'Aún no has publicado ningún poema.',
    cta: 'Escribir un poema',
  },
  draft: {
    title: 'Mis borradores',
    empty: 'No tienes borradores guardados.',
    cta: 'Escribir un poema',
  },
} as const

/** Espacio privado del autor: lo publicado y los borradores, para seguir editando. */
export function MyPoems({ status }: { status: PoemStatus }) {
  const flash = (useLocation().state as { flash?: string } | null)?.flash
  const { data, error, loading } = useQuery(() => repos.poems.listMine(status), [status])
  const c = copy[status]

  return (
    <div className="mx-auto max-w-pagina">
      <header className="py-4 text-center">
        <h1 className="font-serif text-5xl">{c.title}</h1>
        <SwanDivider className="mx-auto mt-8 h-6 w-48 text-gris" />
        {flash && (
          <p role="status" className="meta mt-6">
            {flash}
          </p>
        )}
      </header>

      <LoadState loading={loading} error={error} />

      {data && data.length === 0 && (
        <EmptyState title={c.empty}>
          <Link to="/escribir" className="btn">
            {c.cta}
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
                  {formatDate(status === 'draft' ? p.updatedAt : p.publishedAt)}
                  {status === 'published' && p.visibility === 'private' && ' · Privado'}
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
