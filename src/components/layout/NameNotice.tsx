import { Link, useLocation } from 'react-router-dom'
import { useSession } from '../../hooks/useSession'

/** Aviso fino bajo la cabecera para quien tiene cuenta pero aún no tiene nombre público. */
export function NameNotice() {
  const { session } = useSession()
  const { pathname } = useLocation()
  // En Ajustes → Perfil ya se explica junto al campo.
  if (!session || session.displayName || pathname === '/ajustes/perfil') return null
  return (
    <div role="status" className="border-b border-linea bg-papel">
      <p className="mx-auto w-full max-w-ancho px-6 py-2 text-ui text-gris md:px-10">
        Aún no tienes nombre público: puede que el que elegiste ya esté en uso o no esté permitido. Elige uno para poder
        publicar.{' '}
        <Link to="/ajustes/perfil" className="inline-flex min-h-11 items-center text-tinta underline underline-offset-4">
          Elegir nombre
        </Link>
      </p>
    </div>
  )
}
