import { Link } from 'react-router-dom'
import { repos } from '../data'
import { EmptyState } from '../components/EmptyState'
import { LoadState } from '../components/LoadState'
import { PoemList } from '../components/PoemList'
import { FeatherDivider } from '../components/brand/FeatherDivider'
import { useQuery } from '../hooks/useQuery'

/** Biblioteca privada: los poemas guardados, el último primero. */
export function Library() {
  const { data, error, loading } = useQuery(() => repos.favorites.list(), [])
  return (
    <>
      <header className="py-4 text-center">
        <h1 className="font-serif text-5xl">Mi biblioteca</h1>
        <p className="mt-3 font-serif text-xl italic text-gris">Solo tú ves lo que guardas aquí.</p>
        <FeatherDivider className="mx-auto mt-8 h-4 w-48 text-gris" />
      </header>
      <LoadState loading={loading} error={error} />
      {data && data.length === 0 && (
        <EmptyState title="Tu biblioteca espera su primer poema.">
          <Link to="/explorar" className="btn">
            Explorar poemas
          </Link>
        </EmptyState>
      )}
      {data && data.length > 0 && <PoemList poems={data} />}
    </>
  )
}
