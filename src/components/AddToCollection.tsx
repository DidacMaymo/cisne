import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { repos } from '../data'
import { useQuery } from '../hooks/useQuery'
import { signInHref } from '../lib/links'

type Props = { poemId: string; poemTitle: string; signedIn: boolean }

const cls = 'meta inline-flex min-h-11 items-center hover:text-tinta'

/** «A una colección»: marca en qué colecciones propias está el poema, o crea una nueva. */
export function AddToCollection({ poemId, poemTitle, signedIn }: Props) {
  const [open, setOpen] = useState(false)
  const { pathname, search } = useLocation()

  if (!signedIn) {
    return (
      <Link to={signInHref(pathname + search)} className={cls} title="Entra para crear tus colecciones">
        A una colección
      </Link>
    )
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={cls} aria-haspopup="dialog">
        A una colección
      </button>
      {open && <CollectionsDialog poemId={poemId} poemTitle={poemTitle} onClose={() => setOpen(false)} />}
    </>
  )
}

function CollectionsDialog({ poemId, poemTitle, onClose }: { poemId: string; poemTitle: string; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const id = useId()
  const { data } = useQuery(async () => {
    const [mine, inside] = await Promise.all([repos.collections.listMine(), repos.collections.containing(poemId)])
    return { mine, inside: new Set(inside) }
  }, [poemId])
  const [title, setTitle] = useState('')
  const [problem, setProblem] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    ref.current?.showModal()
  }, [])

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

  function create(e: FormEvent) {
    e.preventDefault()
    const t = title.trim()
    if (!t) return setProblem('Ponle un título a la colección.')
    if (t.length > 80) return setProblem('El título admite hasta 80 caracteres.')
    run(async () => {
      const c = await repos.collections.create({ title: t, visibility: 'private' })
      await repos.collections.addPoem(c.id, poemId)
      setTitle('')
    })
  }

  // En <body>, fuera del poema: así no hereda los colores invertidos de un «Cisne negro».
  return createPortal(
    <dialog
      ref={ref}
      aria-labelledby={`${id}-t`}
      onClose={onClose}
      className="m-auto w-[calc(100%-3rem)] max-w-md border border-tinta bg-blanco p-8 text-left text-tinta backdrop:bg-tinta/30"
    >
      <h2 id={`${id}-t`} className="font-serif text-3xl">
        Guardar en una colección
      </h2>
      <p className="meta mt-1 truncate">«{poemTitle}»</p>

      {data && data.mine.length > 0 && (
        <fieldset className="mt-6">
          <legend className="sr-only">Tus colecciones</legend>
          {data.mine.map((c) => (
            <label key={c.id} className="flex min-h-11 items-center gap-3">
              <input
                type="checkbox"
                checked={data.inside.has(c.id)}
                disabled={busy}
                onChange={(e) =>
                  run(() =>
                    e.target.checked ? repos.collections.addPoem(c.id, poemId) : repos.collections.removePoem(c.id, poemId),
                  )
                }
                className="size-4 accent-tinta"
              />
              <span className="font-serif text-xl">{c.title}</span>
              {c.visibility === 'private' && <span className="meta">· privada</span>}
            </label>
          ))}
        </fieldset>
      )}

      <form onSubmit={create} className="mt-6">
        <label htmlFor={`${id}-nueva`} className="meta block">
          {data && data.mine.length > 0 ? 'O crea una nueva' : 'Crea tu primera colección'}
        </label>
        <div className="flex items-end gap-3">
          <input
            id={`${id}-nueva`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            placeholder="Título"
            autoComplete="off"
            className="campo"
          />
          <button type="submit" className="btn shrink-0" disabled={busy}>
            Crear
          </button>
        </div>
        <p className="meta mt-2">Se crea privada; puedes hacerla pública desde la colección.</p>
      </form>

      <p role="alert" className="mt-2 min-h-5 text-ui">
        {problem}
      </p>

      <div className="mt-4 flex justify-end">
        <button type="button" onClick={() => ref.current?.close()} className="btn btn-primario">
          Hecho
        </button>
      </div>
    </dialog>,
    document.body,
  )
}
