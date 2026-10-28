import { Link, useParams } from 'react-router-dom'
import { repos } from '../data'
import { normalizeTag } from '../data/normalize'
import { EmptyState } from '../components/EmptyState'
import { LoadState } from '../components/LoadState'
import { PoemList } from '../components/PoemList'
import { SwanDivider } from '../components/brand/SwanDivider'
import { Seo } from '../components/Seo'
import { tagMeta } from '../lib/seo'
import { useQuery } from '../hooks/useQuery'

export function TagPage() {
  const { tag = '' } = useParams()
  const name = normalizeTag(tag)
  const { data, error, loading } = useQuery(() => repos.poems.listPublic({ tag: name }), [name])

  return (
    <>
      <Seo {...tagMeta(name)} noindex={!!data && data.length === 0} />
      <header className="py-4 text-center">
        <p className="meta">Etiqueta</p>
        <h1 className="mt-2 font-serif text-5xl italic">#{name}</h1>
        <SwanDivider className="mx-auto mt-8 h-6 w-48 text-gris" />
      </header>
      <LoadState loading={loading} error={error} />
      {data && data.length === 0 && (
        <EmptyState title="Aún no hay poemas con esta etiqueta.">
          <Link to="/" className="enlace">
            Volver al inicio
          </Link>
        </EmptyState>
      )}
      {data && data.length > 0 && <PoemList poems={data} />}
    </>
  )
}
