import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { PoemFont } from '../data'
import { formatDate } from '../lib/format'
import { SwanDivider } from './brand/SwanDivider'
import { SwanMark } from './brand/SwanMark'
import { PoemText } from './PoemText'
import { TagChip } from './TagChip'

type Props = {
  title?: string | null
  content: string
  authorName: string
  /** Ruta al perfil del autor; `null` en poemas anónimos o con pseudónimo. */
  authorHref?: string | null
  date?: string | null
  tags: { name: string }[]
  linkTags?: boolean
  collection?: { id: string; title: string } | null
  font?: PoemFont
  /** «Cisne negro»: la página se lee en negativo. */
  sensitive?: boolean
  /** Sustituye al texto del poema (p. ej. el poema con comentarios). */
  textSlot?: ReactNode
  children?: ReactNode
}

/** Página de lectura tipo libro. La usan la lectura y la vista previa del editor. */
export function PoemReader({
  title,
  content,
  authorName,
  authorHref,
  date,
  tags,
  linkTags = true,
  collection,
  font,
  sensitive = false,
  textSlot,
  children,
}: Props) {
  return (
    <article
      className={`mx-auto max-w-pagina ${sensitive ? 'cisne-negro -mx-6 px-6 py-14 sm:mx-auto md:px-14' : ''}`}
    >
      {sensitive && (
        <p className="meta mb-12 flex items-center justify-center gap-2 text-center">
          <SwanMark className="h-5 w-auto text-blanco" />
          <span>Cisne negro · este poema toca temas sensibles</span>
        </p>
      )}
      <header className="text-center">
        {title && <h1 className="text-balance font-serif text-5xl leading-tight md:text-6xl">{title}</h1>}
        <p className={`font-serif text-2xl italic ${title ? 'mt-5' : ''}`}>
          {authorHref ? (
            <Link to={authorHref} className="underline-offset-4 hover:underline">
              {authorName}
            </Link>
          ) : (
            authorName
          )}
        </p>
        <SwanDivider className="mx-auto mt-8 h-6 w-48 text-gris" />
      </header>

      {textSlot ?? <PoemText content={content} font={font} className="mx-auto mt-12" />}

      <SwanMark className="mx-auto mt-16 h-10 w-auto text-gris" />

      <footer className="mt-10 text-center">
        {(date || collection) && (
          <p className="meta">
            {date && <span>{formatDate(date)}</span>}
            {date && collection && <span aria-hidden="true"> · </span>}
            {collection && (
              <span>
                Del poemario{' '}
                <Link to={`/coleccion/${collection.id}`} className="underline underline-offset-4 hover:text-tinta">
                  «{collection.title}»
                </Link>
              </span>
            )}
          </p>
        )}
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap justify-center gap-x-4">
            {tags.map((t) => (
              <TagChip key={t.name} name={t.name} linked={linkTags} />
            ))}
          </div>
        )}
        {children}
      </footer>
    </article>
  )
}
