import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSession } from '../hooks/useSession'
import { EmptyState } from './EmptyState'
import { LoadState } from './LoadState'

/** Rutas privadas: sin sesión, una invitación a entrar que luego vuelve aquí. */
export function RequireSession({ title, children }: { title: string; children: ReactNode }) {
  const { session, loading } = useSession()
  const { pathname, search } = useLocation()
  if (loading) return <LoadState loading />
  if (session) return children
  const volver = encodeURIComponent(pathname + search)
  return (
    <>
      <h1 className="sr-only">{title}</h1>
      <EmptyState title="Este espacio es tuyo. Entra para verlo.">
        <div className="flex flex-wrap justify-center gap-3">
          <Link to={`/entrar?volver=${volver}`} className="btn btn-primario">
            Entrar
          </Link>
          <Link to={`/registro?volver=${volver}`} className="btn">
            Crear cuenta
          </Link>
        </div>
      </EmptyState>
    </>
  )
}
