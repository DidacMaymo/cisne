import { Link } from 'react-router-dom'
import { dataMode } from '../data'
import { EmptyState } from '../components/EmptyState'

/** Recuperar contraseña. Necesita enviar correos, así que llega con Supabase. */
export function Recover() {
  return (
    <>
      <h1 className="sr-only">Recuperar contraseña</h1>
      <EmptyState title="Recuperar la contraseña">
        <p className="mx-auto max-w-[40ch] text-ui">
          {dataMode === 'local'
            ? 'En esta versión de prueba no se envían correos, así que aún no podemos recuperarla. Cuando CISNE tenga servidor, aquí recibirás un enlace en tu email.'
            : 'Te enviaremos un enlace a tu email.'}
        </p>
        <Link to="/entrar" className="enlace mt-4">
          Volver a entrar
        </Link>
      </EmptyState>
    </>
  )
}
