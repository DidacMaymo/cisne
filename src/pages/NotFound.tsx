import { Link } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { Seo } from '../components/Seo'
import { SITE_META } from '../lib/seo'

export function NotFound() {
  return (
    <>
      <Seo title={SITE_META.title} noindex />
      <h1 className="sr-only">Página no encontrada</h1>
      <EmptyState title="Este verso no existe.">
        <Link to="/" className="enlace">
          Volver al inicio
        </Link>
      </EmptyState>
    </>
  )
}
