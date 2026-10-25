import { Navigate, useLocation } from 'react-router-dom'
import { LoadState } from '../components/LoadState'
import { useSession } from '../hooks/useSession'

/** `/mi-pagina` y las rutas viejas (`/mis/poemas`…): llevan a la pestaña de tu página de autor. */
export function MyPageRedirect({ ver }: { ver?: 'publicados' | 'borradores' | 'colecciones' | 'biblioteca' }) {
  const { session, loading } = useSession()
  const { state } = useLocation()
  if (loading) return <LoadState loading />
  if (!session) return <Navigate to="/entrar?volver=%2Fmi-pagina" replace />
  const to = `/autor/${session.accountName}${ver ? `?ver=${ver}` : ''}`
  return <Navigate to={to} replace state={state} />
}
