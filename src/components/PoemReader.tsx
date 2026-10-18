import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { formatDate } from '../lib/format'
import { FeatherDivider } from './brand/FeatherDivider'
import { SwanMark } from './brand/SwanMark'
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
  children,
}: Props) {
  return (
    <article className="mx-auto max-w-pagina">
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
        <FeatherDivider className="mx-auto mt-8 h-4 w-48 text-gris" />
      </header>

      <div className="poema mx-auto mt-12">{content}</div>

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
