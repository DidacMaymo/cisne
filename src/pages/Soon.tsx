import { Link } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'

export function Soon({ title }: { title: string }) {
  return (
    <>
      <h1 className="sr-only">{title}</h1>
      <EmptyState title={`${title} llegará pronto.`}>
        <Link to="/" className="enlace">
          Volver al inicio
        </Link>
      </EmptyState>
    </>
  )
}
