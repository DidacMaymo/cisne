import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { repos } from '../data'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { EmptyState } from '../components/EmptyState'
import { AddToCollection } from '../components/AddToCollection'
import { AnnotatedPoem } from '../components/comments/AnnotatedPoem'
import { FavoriteButton } from '../components/FavoriteButton'
import { LoadState } from '../components/LoadState'
import { PoemReader } from '../components/PoemReader'
import { ReportButton } from '../components/ReportButton'
import { RelatedPoems } from '../components/RelatedPoems'
import { Seo } from '../components/Seo'
import { ShareButton } from '../components/ShareButton'
import { SupportButton } from '../components/SupportButton'
import { useQuery } from '../hooks/useQuery'
import { useSavedIds } from '../hooks/useSavedIds'
import { useSession } from '../hooks/useSession'
import { firstLine } from '../lib/poem-text'
import { poemMeta, SITE_META } from '../lib/seo'

export function PoemPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const flash = (useLocation().state as { flash?: string } | null)?.flash
  const { data: poem, error, loading } = useQuery(() => repos.poems.get(id), [id])
  const saved = useSavedIds()
  const signedIn = !!useSession().session
  const { data: comments } = useQuery(() => repos.comments.list(id), [id])
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
        <Seo title={SITE_META.title} noindex />
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
      <Seo {...poemMeta({ ...poem, title: poem.title ?? null })} noindex={notPublic} />
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
        collection={poem.collection}
        font={poem.font}
        sensitive={poem.sensitive}
        textSlot={
          poem.commentsEnabled && !notPublic ? (
            <AnnotatedPoem
              poemId={poem.id}
              content={poem.content}
              font={poem.font}
              comments={comments ?? []}
              signedIn={signedIn}
            />
          ) : undefined
        }
      >
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6">
          <FavoriteButton poemId={poem.id} saved={saved.has(poem.id)} signedIn={signedIn} />
          <AddToCollection poemId={poem.id} poemTitle={poem.title ?? firstLine(poem.content)} signedIn={signedIn} />
          <SupportButton kind="poem" poemId={poem.id} name={poem.title ?? firstLine(poem.content)} />
          {!notPublic && <ShareButton title={poem.title ?? firstLine(poem.content)} author={poem.authorName} />}
          {!poem.isOwner && !notPublic && <ReportButton poemId={poem.id} signedIn={signedIn} />}
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
        {poem.isOwner && !notPublic && !poem.commentsEnabled && (
          <p className="meta mt-2">
            Los versos de este poema no admiten comentarios ·{' '}
            <Link to={`/escribir/${poem.id}`} className="underline underline-offset-4 hover:text-tinta">
              Abrirlos
            </Link>
          </p>
        )}
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
