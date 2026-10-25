import { Link } from 'react-router-dom'
import { repos } from '../data'
import { EmptyState } from '../components/EmptyState'
import { LoadState } from '../components/LoadState'
import { PoemList } from '../components/PoemList'
import { useQuery } from '../hooks/useQuery'

/** Biblioteca privada (pestaña de «Mi página»): los poemas guardados, el último primero. */
export function MyLibrary() {
  const { data, error, loading } = useQuery(() => repos.favorites.list(), [])
  return (
    <div>
      <p className="mx-auto max-w-[44ch] text-center font-serif text-xl italic text-gris">
        Solo tú ves lo que guardas aquí.
      </p>
      <LoadState loading={loading} error={error} />
      {data && data.length === 0 && (
        <EmptyState title="Tu biblioteca está vacía.">
          <Link to="/explorar" className="btn">
            Explorar poemas
          </Link>
        </EmptyState>
      )}
      {data && data.length > 0 && (
        <div className="mt-8">
          <PoemList poems={data} />
        </div>
      )}
    </div>
  )
}
