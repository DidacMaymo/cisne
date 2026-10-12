import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { repos } from '../data'
import { ConfirmDialog } from '../components/ConfirmDialog'
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
  const navigate = useNavigate()
  const flash = (useLocation().state as { flash?: string } | null)?.flash
  const { data: poem, error, loading } = useQuery(() => repos.poems.get(id), [id])
  const saved = useSavedIds()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  async function remove() {
    setBusy(true)
    try {
      await repos.poems.remove(id)
      navigate('/mis/poemas', { replace: true, state: { flash: 'Poema eliminado.' } })
    } catch (e) {
      setConfirmDelete(false)
      setDeleteError(e instanceof Error ? e.message : 'No se pudo eliminar el poema.')
    } finally {
      setBusy(false)
    }
  }

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

  const notPublic = poem.status === 'draft' || poem.visibility === 'private'

  return (
    <>
      {(flash || notPublic) && (
        <p role="status" className="meta mb-8 text-center">
          {flash}
          {flash && notPublic && ' · '}
          {notPublic && (poem.status === 'draft' ? 'Borrador: solo tú puedes verlo.' : 'Privado: solo tú puedes leerlo.')}
        </p>
      )}

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
          {poem.isOwner && (
            <>
              <Link to={`/escribir/${poem.id}`} className="meta inline-flex min-h-11 items-center hover:text-tinta">
                Editar
              </Link>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="meta inline-flex min-h-11 items-center hover:text-tinta"
              >
                Eliminar
              </button>
            </>
          )}
        </div>
        {deleteError && (
          <p role="alert" className="mt-2 text-ui">
            {deleteError}
          </p>
        )}
      </PoemReader>

      {!notPublic && <RelatedPoems poemId={poem.id} />}

      <ConfirmDialog
        open={confirmDelete}
        title="¿Eliminar este poema?"
        confirmLabel="Eliminar"
        busy={busy}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      >
        Se borrará para siempre, también de tu biblioteca y de sus colecciones. No se puede deshacer.
      </ConfirmDialog>
    </>
  )
}
