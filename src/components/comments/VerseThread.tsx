import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { repos } from '../../data'
import type { VerseComment } from '../../data'
import { commentSchema, MAX_COMMENT_CHARS } from '../../data/schemas'
import { formatDate } from '../../lib/format'
import { signInHref } from '../../lib/links'

type Props = {
  poemId: string
  /** Versos del poema sin marcas de formato. */
  verses: string[]
  /** Verso (y fragmento subrayado) desde el que se abre; `null` para elegirlo. */
  initial: { line: number; quote: string } | null
  commentsFor: (line: number) => VerseComment[]
  signedIn: boolean
  onClose: () => void
}

/** Los comentarios de un verso y el formulario para añadir uno. */
export function VerseThread({ poemId, verses, initial, commentsFor, signedIn, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const id = useId()
  const { pathname, search } = useLocation()
  const [line, setLine] = useState<number | null>(initial?.line ?? null)
  const [quote, setQuote] = useState(initial?.quote ?? '')
  const [body, setBody] = useState('')
  const [problem, setProblem] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirming, setConfirming] = useState<string | null>(null)

  useEffect(() => {
    ref.current?.showModal()
  }, [])

  const comments = line === null ? [] : commentsFor(line)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (line === null) return
    const parsed = commentSchema.safeParse({ body })
    if (!parsed.success) return setProblem(parsed.error.issues[0].message)
    setBusy(true)
    setProblem('')
    try {
      await repos.comments.add(poemId, { line, quote, body: parsed.data.body })
      setBody('')
      setQuote('')
    } catch (err) {
      setProblem(err instanceof Error ? err.message : 'No se pudo publicar. Tu comentario sigue aquí.')
    } finally {
      setBusy(false)
    }
  }

  async function remove(commentId: string) {
    setBusy(true)
    setProblem('')
    try {
      await repos.comments.remove(commentId)
      setConfirming(null)
    } catch (err) {
      setProblem(err instanceof Error ? err.message : 'No se pudo borrar.')
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
      className="m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto border border-tinta bg-blanco p-6 text-left text-tinta backdrop:bg-tinta/30 sm:p-8"
    >
      <h2 id={`${id}-t`} className="font-serif text-3xl">
        {line === null ? 'Comentar un verso' : `Verso ${line + 1}`}
      </h2>

      {line === null ? (
        <div className="mt-4">
          <label htmlFor={`${id}-v`} className="meta block">
            ¿Qué verso quieres comentar?
          </label>
          <select
            id={`${id}-v`}
            className="campo min-h-11"
            defaultValue=""
            onChange={(e) => e.target.value !== '' && setLine(Number(e.target.value))}
          >
            <option value="">Elige un verso…</option>
            {verses.map((v, i) =>
              v.trim() ? (
                <option key={i} value={i}>
                  {i + 1}. {v.length > 60 ? `${v.slice(0, 60)}…` : v}
                </option>
              ) : null,
            )}
          </select>
        </div>
      ) : (
        <blockquote className="mt-2 border-l border-linea pl-4 font-serif text-xl italic">{verses[line]}</blockquote>
      )}

      {comments.length > 0 && (
        <ol className="mt-6">
          {comments.map((c) => (
            <li key={c.id} className="border-t border-linea py-4">
              {c.quote && c.quote !== verses[line!]?.trim() && (
                <p className="meta italic">«{c.quote}»</p>
              )}
              <p className="mt-1 whitespace-pre-wrap text-ui">{c.body}</p>
              <p className="meta mt-2 flex flex-wrap items-center gap-x-3">
                {c.authorAccountName ? (
                  <Link to={`/autor/${c.authorAccountName}`} className="hover:text-tinta hover:underline">
                    {c.authorName}
                  </Link>
                ) : (
                  <span>{c.authorName}</span>
                )}
                <span aria-hidden="true">·</span>
                <span>{formatDate(c.createdAt)}</span>
                {c.canDelete &&
                  (confirming === c.id ? (
                    <span className="inline-flex items-center gap-3">
                      <span className="text-tinta">¿Borrarlo?</span>
                      <button type="button" disabled={busy} onClick={() => remove(c.id)} className="min-h-11 text-tinta underline">
                        Sí, borrar
                      </button>
                      <button type="button" onClick={() => setConfirming(null)} className="min-h-11 hover:text-tinta">
                        No
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirming(c.id)}
                      className="min-h-11 hover:text-tinta"
                      aria-label={`Borrar el comentario de ${c.authorName}`}
                    >
                      Borrar
                    </button>
                  ))}
              </p>
            </li>
          ))}
        </ol>
      )}

      {line !== null &&
        (signedIn ? (
          <form onSubmit={submit} className="mt-6 border-t border-linea pt-4">
            {quote && <p className="meta italic">Sobre «{quote}»</p>}
            <label htmlFor={`${id}-c`} className="meta mt-2 block">
              Tu comentario
            </label>
            <textarea
              id={`${id}-c`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              maxLength={MAX_COMMENT_CHARS}
              autoFocus
              aria-describedby={`${id}-ch`}
              className="campo field-sizing-content resize-none"
            />
            <p id={`${id}-ch`} className="meta mt-2">
              Se firmará con tu nombre público. {body.length}/{MAX_COMMENT_CHARS}
            </p>
            <div className="mt-4 flex justify-end">
              <button type="submit" className="btn btn-primario" disabled={busy}>
                {busy ? 'Un momento…' : 'Publicar comentario'}
              </button>
            </div>
          </form>
        ) : (
          <p className="mt-6 border-t border-linea pt-4 text-ui">
            <Link to={signInHref(pathname + search)} className="underline underline-offset-4">
              Entra en tu cuenta
            </Link>{' '}
            para comentar este verso.
          </p>
        ))}

      <p role="alert" className="mt-2 min-h-5 text-ui">
        {problem}
      </p>

      <div className="mt-2 flex justify-end">
        <button type="button" className="btn" onClick={() => ref.current?.close()}>
          Cerrar
        </button>
      </div>
    </dialog>,
    document.body,
  )
}
