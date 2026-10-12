import { Link, useParams } from 'react-router-dom'
import { repos } from '../data'
import { Editor } from '../components/editor/Editor'
import { EmptyState } from '../components/EmptyState'
import { LoadState } from '../components/LoadState'
import { useQuery } from '../hooks/useQuery'

/** /escribir (poema nuevo) y /escribir/:id (continuar o editar uno propio). */
export function Write() {
  const { id } = useParams()
  const { data, error, loading } = useQuery(async () => {
    const [profile, collections, tagSuggestions, pseudonyms, poem] = await Promise.all([
      repos.profiles.getMine(),
      repos.collections.listMine(),
      repos.tags.suggest(),
      repos.profiles.listPseudonyms(),
      id ? repos.poems.getOwn(id) : Promise.resolve(null),
    ])
    return { profile, collections, tagSuggestions, pseudonyms, poem }
  }, [id])

  if (loading || error) return <LoadState loading={loading} error={error} />
  if (id && !data?.poem) {
    return (
      <>
        <h1 className="sr-only">Poema no encontrado</h1>
        <EmptyState title="No encontramos ese poema entre los tuyos.">
          <Link to="/mis/borradores" className="enlace">
            Ver mis borradores
          </Link>
        </EmptyState>
      </>
    )
  }

  return <Editor key={id ?? 'nuevo'} {...data!} />
}
