import { Link, useParams } from 'react-router-dom'
import { repos } from '../data'
import { EmptyState } from '../components/EmptyState'
import { LoadState } from '../components/LoadState'
import { PoemList } from '../components/PoemList'
import { FeatherDivider } from '../components/brand/FeatherDivider'
import { useQuery } from '../hooks/useQuery'

/** Página de autor mínima; la fase 4 la completa con colecciones e intereses. */
export function AuthorPage() {
  const { accountName = '' } = useParams()
  const { data, error, loading } = useQuery(async () => {
    const profile = await repos.profiles.getPublicByAccountName(accountName)
    const poems = profile ? await repos.poems.listPublic({ authorAccountName: accountName }) : []
    return { profile, poems }
  }, [accountName])

  if (loading || error) return <LoadState loading={loading} error={error} />
  if (!data?.profile) {
    return (
      <>
        <h1 className="sr-only">Autor no encontrado</h1>
        <EmptyState title="No encontramos a este autor.">
          <Link to="/" className="enlace">
            Volver al inicio
          </Link>
        </EmptyState>
      </>
    )
  }

  const { profile, poems } = data
  return (
    <>
      <header className="mx-auto max-w-pagina py-4 text-center">
        <h1 className="font-serif text-5xl">{profile.displayName}</h1>
        {profile.bio && <p className="mx-auto mt-4 max-w-[48ch] font-serif text-xl italic">{profile.bio}</p>}
        <FeatherDivider className="mx-auto mt-8 h-4 w-48 text-gris" />
      </header>
      {poems.length === 0 ? (
        <EmptyState title="Todavía no hay poemas publicados." />
      ) : (
        <PoemList poems={poems} />
      )}
    </>
  )
}
