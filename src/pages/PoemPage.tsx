import { Link, useParams } from 'react-router-dom'
import { repos } from '../data'
import { EmptyState } from '../components/EmptyState'
import { FavoriteButton } from '../components/FavoriteButton'
import { LoadState } from '../components/LoadState'
import { PoemReader } from '../components/PoemReader'
import { RelatedPoems } from '../components/RelatedPoems'
import { ShareButton } from '../components/ShareButton'
import { useQuery } from '../hooks/useQuery'
import { useSavedIds } from '../hooks/useSavedIds'

export function PoemPage() {
  const { id = '' } = useParams()
  const { data: poem, error, loading } = useQuery(() => repos.poems.get(id), [id])
  const saved = useSavedIds()

  if (loading || error) return <LoadState loading={loading} error={error} />
  if (!poem) {
    return (
      <>
        <h1 className="sr-only">Poema no encontrado</h1>
        <EmptyState title="Este poema no existe o es privado.">
          <Link to="/" className="enlace">
            Volver al inicio
          </Link>
        </EmptyState>
      </>
    )
  }

  return (
    <>
      <PoemReader
        title={poem.title}
        content={poem.content}
        authorName={poem.authorName}
        authorHref={poem.authorAccountName ? `/autor/${poem.authorAccountName}` : null}
        date={poem.publishedAt}
        tags={poem.tags.map((t) => ({ name: t.normalizedName }))}
        collectionTitle={poem.collection?.title}
      >
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6">
          <FavoriteButton poemId={poem.id} saved={saved.has(poem.id)} />
          <ShareButton title={poem.title} />
        </div>
      </PoemReader>
      <RelatedPoems poemId={poem.id} />
    </>
  )
}
