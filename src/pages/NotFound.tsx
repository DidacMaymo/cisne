import { Link } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'

export function NotFound() {
  return (
    <>
      <h1 className="sr-only">Página no encontrada</h1>
      <EmptyState title="Este verso no existe.">
        <Link to="/" className="enlace">
          Volver al inicio
        </Link>
      </EmptyState>
    </>
  )
}
