import { useId, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { repos } from '../data'
import { normalizeTag } from '../data/normalize'
import { EmptyState } from '../components/EmptyState'
import { LoadState } from '../components/LoadState'
import { PoemList } from '../components/PoemList'
import { SwanDivider } from '../components/brand/SwanDivider'
import { Seo } from '../components/Seo'
import { SITE_NAME } from '../lib/seo'
import { useQuery } from '../hooks/useQuery'

const PAGE = 10
const newSeed = () => Math.floor(Math.random() * 2 ** 31)
const HIDE_DARK_KEY = 'cisne:ocultar-cisne-negro'

/** Preferencia de este navegador: ocultar o no los «Cisne negro». */
function readHideDark(): boolean {
  try {
    return localStorage.getItem(HIDE_DARK_KEY) === '1'
  } catch {
    return false
  }
}

/** Explorar: poemas al azar (o recientes), buscador y etiquetas. */
export function Explore() {
  const id = useId()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const tag = normalizeTag(params.get('etiqueta') ?? '')
  const order = params.get('orden') === 'recientes' ? 'recent' : 'random'

  const [seed, setSeed] = useState(newSeed)
  const [shown, setShown] = useState(PAGE)
  const [text, setText] = useState(q)
  const [hideDark, setHideDark] = useState(readHideDark)

  const { data, error, loading } = useQuery(
    () => repos.poems.search({ q, tag: tag || undefined, order, seed, includeSensitive: !hideDark }),
    [q, tag, order, seed, hideDark],
  )
  const { data: tags } = useQuery(() => repos.tags.suggest(), [])

  function update(patch: Record<string, string | null>) {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v)
      else next.delete(k)
    }
    setParams(next, { replace: true })
    setShown(PAGE)
  }

  const filtering = !!q || !!tag

  return (
    <>
      <Seo
        title={`Explorar poemas · ${SITE_NAME}`}
        description="Abre un poema al azar o busca por tema, autor o etiqueta. Poesía en español, sin ruido."
        path="/explorar"
      />
      <header className="mx-auto max-w-pagina py-4 text-center">
        <h1 className="font-serif text-5xl md:text-6xl">Explorar</h1>
        <p className="mt-3 font-serif text-xl italic text-gris">Abre un poema al azar. Quizá sea el tuyo.</p>
      </header>

      <div className="mx-auto mt-8 max-w-pagina">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault()
            update({ q: text.trim() || null })
          }}
        >
          <label htmlFor={`${id}-q`} className="sr-only">
            Buscar por título, verso, autor o etiqueta
          </label>
          <div className="flex items-end gap-3">
            <input
              id={`${id}-q`}
              type="search"
              value={text}
              onChange={(e) => {
                setText(e.target.value)
                update({ q: e.target.value.trim() || null })
              }}
              placeholder="Busca un verso o un autor…"
              autoComplete="off"
              className="campo font-serif text-2xl"
            />
          </div>
        </form>

        {tags && tags.length > 0 && (
          <div className="mt-4">
            <p id={`${id}-tags`} className="sr-only">
              Filtrar por etiqueta
            </p>
            <ul aria-labelledby={`${id}-tags`} className="flex flex-wrap gap-x-4">
              {tags.slice(0, 14).map((t) => {
                const active = t.normalizedName === tag
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => update({ etiqueta: active ? null : t.normalizedName })}
                      className={`inline-flex min-h-11 items-center text-meta underline-offset-4 ${
                        active ? 'text-tinta underline' : 'text-gris hover:text-tinta'
                      }`}
                    >
                      #{t.normalizedName}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 border-b border-linea pb-2">
          <div role="group" aria-label="Orden" className="flex gap-6">
            {(
              [
                ['random', 'Al azar'],
                ['recent', 'Recientes'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={order === value}
                onClick={() => update({ orden: value === 'recent' ? 'recientes' : null })}
                className={`inline-flex min-h-11 items-center border-b text-ui ${
                  order === value ? 'border-tinta text-tinta' : 'border-transparent text-gris hover:text-tinta'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {order === 'random' && (
            <button
              type="button"
              onClick={() => {
                setSeed(newSeed())
                setShown(PAGE)
              }}
              className="meta inline-flex min-h-11 items-center hover:text-tinta"
            >
              Barajar de nuevo
            </button>
          )}
        </div>

        <label className="mt-2 flex min-h-11 items-center gap-3">
          <input
            type="checkbox"
            checked={hideDark}
            onChange={(e) => {
              const on = e.target.checked
              setHideDark(on)
              setShown(PAGE)
              try {
                localStorage.setItem(HIDE_DARK_KEY, on ? '1' : '0')
              } catch {
                // sin almacenamiento: vale para esta visita
              }
            }}
            className="size-4 accent-tinta"
          />
          <span className="text-ui">
            Ocultar Cisne negro <span className="meta">— poemas con temas sensibles (+18)</span>
          </span>
        </label>
      </div>

      <div className="mt-10">
        <LoadState loading={loading} error={error} />

        {data && data.length === 0 && (
          <EmptyState title={filtering ? 'Ningún poema coincide con tu búsqueda.' : 'Toda obra empieza con una primera palabra.'}>
            {filtering ? (
              <button
                type="button"
                className="enlace"
                onClick={() => {
                  setText('')
                  update({ q: null, etiqueta: null })
                }}
              >
                Ver todos los poemas
              </button>
            ) : (
              <Link to="/escribir" className="btn">
                Escribir el primer poema
              </Link>
            )}
          </EmptyState>
        )}

        {data && data.length > 0 && (
          <>
            <p role="status" className="sr-only">
              {data.length === 1 ? 'Un poema' : `${data.length} poemas`}
            </p>
            <PoemList poems={data.slice(0, shown)} />
            {data.length > shown ? (
              <div className="mt-10 text-center">
                <button type="button" className="btn" onClick={() => setShown((n) => n + PAGE)}>
                  Ver más poemas
                </button>
              </div>
            ) : (
              <SwanDivider className="mx-auto mt-10 h-6 w-48 text-gris" />
            )}
          </>
        )}
      </div>
    </>
  )
}
