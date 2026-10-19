import { useEffect, useMemo, useRef, useState } from 'react'
import type { PoemFont, VerseComment } from '../../data'
import { fontClass } from '../../lib/poem-fonts'
import { renderMarkup, stripMarkup } from '../../lib/poem-markup'
import { VerseThread } from './VerseThread'

type Props = {
  poemId: string
  content: string
  font: PoemFont
  comments: VerseComment[]
  signedIn: boolean
}

type Draft = { line: number; quote: string }

/**
 * Si se editó el poema después de comentar, el comentario busca su verso por
 * el fragmento citado; si no lo encuentra, se queda en su número de verso.
 */
function resolveLine(c: VerseComment, plain: string[]): number {
  const fits = (i: number) => !c.quote || plain[i]?.includes(c.quote)
  if (c.line < plain.length && fits(c.line)) return c.line
  const found = c.quote ? plain.findIndex((l) => l.includes(c.quote)) : -1
  return found !== -1 ? found : Math.min(c.line, plain.length - 1)
}

/**
 * El poema con sus comentarios: subrayas un fragmento y aparece «Escribir
 * comentario»; cada verso comentado lleva un puntito con su número, en el
 * margen, para no tocar las palabras del poema.
 */
export function AnnotatedPoem({ poemId, content, font, comments, signedIn }: Props) {
  const lines = useMemo(() => content.split('\n'), [content])
  const plain = useMemo(() => lines.map((l) => stripMarkup(l)), [lines])
  const byLine = useMemo(() => {
    const map = new Map<number, VerseComment[]>()
    for (const c of comments) {
      const i = resolveLine(c, plain)
      map.set(i, [...(map.get(i) ?? []), c])
    }
    return map
  }, [comments, plain])

  const boxRef = useRef<HTMLDivElement>(null)
  const [pending, setPending] = useState<(Draft & { top: number; left: number }) | null>(null)
  const [open, setOpen] = useState<Draft | 'pick' | null>(null)

  // Al seleccionar dentro del poema, se ofrece comentar ese verso.
  useEffect(() => {
    function onSelection() {
      const box = boxRef.current
      const sel = window.getSelection()
      if (!box || !sel || sel.isCollapsed || sel.rangeCount === 0) return setPending(null)
      const range = sel.getRangeAt(0)
      if (!box.contains(range.commonAncestorContainer)) return setPending(null)
      const start = range.startContainer
      const el = (start instanceof Element ? start : start.parentElement)?.closest('[data-line]')
      const quote = sel.toString().replace(/\s+/g, ' ').trim().slice(0, 200)
      if (!el || !quote) return setPending(null)
      const rect = range.getBoundingClientRect()
      const boxRect = box.getBoundingClientRect()
      setPending({
        line: Number(el.getAttribute('data-line')),
        quote,
        top: rect.bottom - boxRect.top + 8,
        left: Math.max(0, Math.min(rect.left - boxRect.left, boxRect.width - 180)),
      })
    }
    document.addEventListener('selectionchange', onSelection)
    return () => document.removeEventListener('selectionchange', onSelection)
  }, [])

  return (
    <>
      <div ref={boxRef} className={`poema ${fontClass(font)} relative mx-auto mt-12 pr-11 md:pr-0`}>
        {lines.map((line, i) => {
          const here = byLine.get(i)
          return (
            <span key={i} data-line={i} className="relative block">
              {line ? renderMarkup(line) : '​'}
              {here && (
                <button
                  type="button"
                  onClick={() => setOpen({ line: i, quote: '' })}
                  aria-label={`${here.length === 1 ? '1 comentario' : `${here.length} comentarios`} en el verso ${i + 1}`}
                  className="group absolute top-0 -right-11 inline-flex size-11 items-center justify-center"
                >
                  <span className="inline-flex size-5 items-center justify-center rounded-full border border-gris font-sans text-[0.625rem] leading-none text-gris group-hover:border-current group-hover:text-current">
                    {here.length}
                  </span>
                </button>
              )}
            </span>
          )
        })}

        {pending && (
          <button
            type="button"
            // Que pulsar no borre la selección antes de leerla.
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setOpen({ line: pending.line, quote: pending.quote })
              setPending(null)
              window.getSelection()?.removeAllRanges()
            }}
            style={{ top: pending.top, left: pending.left }}
            className="btn btn-primario absolute z-10 min-h-9 px-3 font-sans text-meta"
          >
            Escribir comentario
          </button>
        )}
      </div>

      <p className="mt-6 text-center">
        <button
          type="button"
          onClick={() => setOpen('pick')}
          className="meta inline-flex min-h-11 items-center hover:text-tinta"
        >
          {comments.length > 0 ? 'Comentar un verso' : 'Los versos están abiertos a comentarios · comentar'}
        </button>
      </p>

      {open && (
        <VerseThread
          poemId={poemId}
          verses={plain}
          initial={open === 'pick' ? null : open}
          commentsFor={(line) => byLine.get(line) ?? []}
          signedIn={signedIn}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  )
}
