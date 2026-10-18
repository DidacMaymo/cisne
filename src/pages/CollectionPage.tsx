import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { repos } from '../data'
import { CollectionCover } from '../components/CollectionCover'
import { CollectionForm } from '../components/CollectionForm'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { EmptyState } from '../components/EmptyState'
import { LoadState } from '../components/LoadState'
import { ShareButton } from '../components/ShareButton'
import { useQuery } from '../hooks/useQuery'
import { firstLine } from '../lib/poem-text'

const small = 'meta inline-flex min-h-11 min-w-11 items-center justify-center hover:text-tinta disabled:opacity-30'

/** Una colección como un pequeño libro: portada, índice y, para su dueño, las herramientas. */
export function CollectionPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const flash = (useLocation().state as { flash?: string } | null)?.flash
  const { data, error, loading } = useQuery(() => repos.collections.get(id), [id])
  const isOwner = !!data?.collection.isOwner
  const { data: mine } = useQuery(
    () => (isOwner ? repos.poems.listMine('published') : Promise.resolve([])),
    [id, isOwner],
  )
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState('')
  const [toAdd, setToAdd] = useState('')

  async function run(action: () => Promise<unknown>) {
    setBusy(true)
    setProblem('')
    try {
      await action()
    } catch (e) {
      setProblem(e instanceof Error ? e.message : 'No se pudo guardar. Inténtalo de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  if (loading || error) return <LoadState loading={loading} error={error} />
  if (!data) {
    return (
      <>
        <h1 className="sr-only">Colección no encontrada</h1>
        <EmptyState title="Esta colección no existe o es privada.">
          <Link to="/explorar" className="enlace">
            Seguir explorando
          </Link>
        </EmptyState>
      </>
    )
  }

  const { collection: c, poems } = data
  const addable = (mine ?? []).filter((p) => !poems.some((x) => x.id === p.id))

  if (editing) {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="mb-10 text-center font-serif text-4xl">Editar colección</h1>
        <CollectionForm
          initial={{ title: c.title, description: c.description, visibility: c.visibility }}
          submitLabel="Guardar cambios"
          onCancel={() => setEditing(false)}
          onSubmit={async (v) => {
            await repos.collections.update(c.id, v)
            setEditing(false)
          }}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-pagina">
      {(flash || (isOwner && c.visibility === 'private')) && (
        <p role="status" className="meta mb-8 text-center">
          {flash}
          {flash && c.visibility === 'private' && ' · '}
          {c.visibility === 'private' && 'Privada: solo tú puedes verla.'}
        </p>
      )}

      <header className="grid items-center gap-10 sm:grid-cols-[14rem_1fr]">
        <CollectionCover title={c.title} ownerName={c.ownerName} size="lg" className="mx-auto w-56 sm:w-full" />
        <div className="text-center sm:text-left">
          <p className="meta">Colección</p>
          <h1 className="mt-1 text-balance font-serif text-5xl leading-tight">{c.title}</h1>
          <p className="mt-3 font-serif text-xl italic">
            {c.ownerAccountName ? (
              <Link to={`/autor/${c.ownerAccountName}`} className="underline-offset-4 hover:underline">
                {c.ownerName}
              </Link>
            ) : (
              c.ownerName
            )}
          </p>
          {c.description && (
            <p className="mt-4 whitespace-pre-line text-pretty font-serif text-xl leading-relaxed">{c.description}</p>
          )}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 sm:justify-start">
            {c.visibility === 'public' && <ShareButton title={c.title} />}
            {isOwner && (
              <>
                <button type="button" className="meta inline-flex min-h-11 items-center hover:text-tinta" onClick={() => setEditing(true)}>
                  Editar
                </button>
                <button
                  type="button"
                  className="meta inline-flex min-h-11 items-center hover:text-tinta"
                  onClick={() => setConfirmDelete(true)}
                >
                  Eliminar
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <section aria-labelledby="indice" className="mt-16">
        <h2 id="indice" className="meta border-b border-linea pb-3 text-center">
          Índice
        </h2>
        {poems.length === 0 ? (
          <p className="py-12 text-center font-serif text-2xl italic text-gris">Todavía no hay poemas aquí.</p>
        ) : (
          <ol>
            {poems.map((p, i) => (
              <li key={p.id} className="flex items-center gap-4 border-b border-linea py-4">
                <span className="w-8 shrink-0 text-right font-serif text-lg italic text-gris">{i + 1}</span>
                <Link to={`/poema/${p.id}`} className="group min-w-0 flex-1">
                  <span className="block truncate font-serif text-2xl underline-offset-4 group-hover:underline">
                    {p.title ?? firstLine(p.content)}
                  </span>
                  <span className="meta block truncate">
                    {p.authorName}
                    {p.isOwner && p.visibility === 'private' && ' · Privado'}
                  </span>
                </Link>
                {isOwner && (
                  <span className="flex shrink-0 items-center">
                    <button
                      type="button"
                      className={small}
                      disabled={busy || i === 0}
                      aria-label={`Subir ${p.title ?? firstLine(p.content)}`}
                      onClick={() => run(() => repos.collections.movePoem(c.id, p.id, -1))}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className={small}
                      disabled={busy || i === poems.length - 1}
                      aria-label={`Bajar ${p.title ?? firstLine(p.content)}`}
                      onClick={() => run(() => repos.collections.movePoem(c.id, p.id, 1))}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className={`${small} px-2`}
                      disabled={busy}
                      aria-label={`Quitar ${p.title ?? firstLine(p.content)} de la colección`}
                      onClick={() => run(() => repos.collections.removePoem(c.id, p.id))}
                    >
                      Quitar
                    </button>
                  </span>
                )}
              </li>
            ))}
          </ol>
        )}

        {isOwner && (
          <div className="mt-8">
            {addable.length > 0 ? (
              <form
                className="flex items-end gap-3"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (toAdd) run(() => repos.collections.addPoem(c.id, toAdd).then(() => setToAdd('')))
                }}
              >
                <div className="min-w-0 flex-1">
                  <label htmlFor="anadir" className="meta block">
                    Añadir uno de tus poemas
                  </label>
                  <select id="anadir" value={toAdd} onChange={(e) => setToAdd(e.target.value)} className="campo min-h-11">
                    <option value="">Elige un poema…</option>
                    {addable.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title ?? firstLine(p.content)}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn shrink-0" disabled={busy || !toAdd}>
                  Añadir
                </button>
              </form>
            ) : null}
            <p className="meta mt-4 text-center">
              También puedes añadir poemas de otras voces desde{' '}
              <Link to="/explorar" className="underline underline-offset-4 hover:text-tinta">
                Explorar
              </Link>
              , con «A una colección».
            </p>
          </div>
        )}
        {problem && (
          <p role="alert" className="mt-4 text-center text-ui">
            {problem}
          </p>
        )}
      </section>

      <ConfirmDialog
        open={confirmDelete}
        title="¿Eliminar esta colección?"
        confirmLabel="Eliminar colección"
        busy={busy}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() =>
          run(async () => {
            await repos.collections.remove(c.id)
            navigate('/mis/colecciones', { replace: true })
          })
        }
      >
        Se borrará la colección, pero no los poemas: seguirán publicados y en tu espacio.
      </ConfirmDialog>
    </div>
  )
}
