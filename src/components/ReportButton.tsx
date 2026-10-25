import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { repos } from '../data'
import type { ReportCategory } from '../data/repositories'
import { countWords, MAX_COMMENT_WORDS } from '../data/words'
import { signInHref } from '../lib/links'

const REASONS: { value: ReportCategory; label: string }[] = [
  { value: 'odio', label: 'Contenido de odio u ofensivo' },
  { value: 'acoso', label: 'Acoso a una persona' },
  { value: 'plagio', label: 'Plagio: no es de quien lo firma' },
  { value: 'otro', label: 'Otro motivo' },
]

const btn = 'meta inline-flex min-h-11 items-center hover:text-tinta'

/** Botón discreto «Denunciar» y su diálogo. Sin sesión, lleva a entrar y vuelve. */
export function ReportButton({ poemId, signedIn }: { poemId: string; signedIn: boolean }) {
  const { pathname, search } = useLocation()
  const [open, setOpen] = useState(false)

  if (!signedIn) {
    return (
      <Link to={signInHref(pathname + search)} className={btn}>
        Denunciar
      </Link>
    )
  }
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={btn}>
        Denunciar
      </button>
      {open && <ReportDialog poemId={poemId} onClose={() => setOpen(false)} />}
    </>
  )
}

function ReportDialog({ poemId, onClose }: { poemId: string; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const id = useId()
  const [category, setCategory] = useState<ReportCategory | ''>('')
  const [detail, setDetail] = useState('')
  const [problem, setProblem] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    ref.current?.showModal()
  }, [])

  const words = countWords(detail)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!category) return setProblem('Elige un motivo.')
    if (category === 'otro' && words === 0) return setProblem('Cuéntanos brevemente el motivo.')
    if (words > MAX_COMMENT_WORDS) return setProblem(`La explicación admite hasta ${MAX_COMMENT_WORDS} palabras.`)
    setBusy(true)
    setProblem('')
    try {
      await repos.reports.report(poemId, { category, detail: detail.trim() || undefined })
      setSent(true)
    } catch (err) {
      setProblem(err instanceof Error ? err.message : 'No se pudo enviar. Inténtalo de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  // En <body>, fuera del poema: así no hereda los colores invertidos de un «Cisne negro».
  return createPortal(
    <dialog
      ref={ref}
      aria-labelledby={`${id}-t`}
      onClose={onClose}
      className="m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto border border-tinta bg-blanco p-6 text-left text-tinta backdrop:bg-tinta/30 sm:p-8"
    >
      <h2 id={`${id}-t`} className="font-serif text-3xl">
        {sent ? 'Gracias' : 'Denunciar este poema'}
      </h2>

      {sent ? (
        <>
          <p role="status" className="mt-4 text-ui">
            Hemos recibido tu aviso. Lo revisaremos.
          </p>
          <div className="mt-6 flex justify-end">
            <button type="button" className="btn btn-primario" autoFocus onClick={() => ref.current?.close()}>
              Cerrar
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={submit} className="mt-4">
          <fieldset>
            <legend className="meta">Motivo</legend>
            {REASONS.map((r) => (
              <label key={r.value} className="flex min-h-11 items-center gap-3 text-ui">
                <input
                  type="radio"
                  name={`${id}-m`}
                  value={r.value}
                  checked={category === r.value}
                  onChange={() => setCategory(r.value)}
                />
                {r.label}
              </label>
            ))}
          </fieldset>

          <label htmlFor={`${id}-d`} className="meta mt-4 block">
            {category === 'otro' ? 'Cuéntanos el motivo' : 'Algo más (opcional)'}
          </label>
          <textarea
            id={`${id}-d`}
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            rows={3}
            maxLength={600}
            aria-invalid={words > MAX_COMMENT_WORDS}
            aria-describedby={`${id}-c`}
            className="campo field-sizing-content resize-none"
          />
          <p id={`${id}-c`} className="meta mt-2">
            {words} de {MAX_COMMENT_WORDS} palabras
          </p>

          <p role="alert" className="mt-2 min-h-5 text-ui">
            {problem}
          </p>

          <div className="mt-2 flex flex-wrap justify-end gap-3">
            <button type="button" className="btn" onClick={() => ref.current?.close()}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primario" disabled={busy}>
              {busy ? 'Un momento…' : 'Enviar denuncia'}
            </button>
          </div>
        </form>
      )}
    </dialog>,
    document.body,
  )
}
