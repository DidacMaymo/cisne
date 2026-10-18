import { Link } from 'react-router-dom'
import { formatDate } from '../lib/format'
import { firstLine, makeExcerpt } from '../lib/poem-text'
import type { PoemView } from '../data'
import { AddToCollection } from './AddToCollection'
import { FavoriteButton } from './FavoriteButton'
import { TagChip } from './TagChip'

type Props = { poem: PoemView; saved: boolean; signedIn: boolean }

/** Un poema en un listado: abierto, sin tarjeta, con fragmento que respeta los versos. */
export function PoemListItem({ poem, saved, signedIn }: Props) {
  const to = `/poema/${poem.id}`
  const { text, truncated } = makeExcerpt(poem.content)

  return (
    <article className="border-b border-linea py-12 first:pt-2 last:border-b-0">
      {poem.title && (
        <h2 className="font-serif text-4xl leading-tight">
          <Link to={to} className="underline-offset-4 hover:underline">
            {poem.title}
          </Link>
        </h2>
      )}
      <Link to={to} className={`block ${poem.title ? 'mt-5' : ''}`} tabIndex={poem.title ? -1 : undefined}>
        <p className="poema">{text}</p>
      </Link>

      <p className="mt-6 font-serif text-xl italic">
        {poem.authorAccountName ? (
          <Link to={`/autor/${poem.authorAccountName}`} className="underline-offset-4 hover:underline">
            {poem.authorName}
          </Link>
        ) : (
          poem.authorName
        )}
      </p>
      <p className="meta mt-1">{formatDate(poem.publishedAt)}</p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4">
        {poem.tags.map((t) => (
          <TagChip key={t.id} name={t.normalizedName} />
        ))}
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-x-6">
        <Link
          to={to}
          aria-label={`Leer ${poem.title ?? 'el poema'}${truncated ? ' completo' : ''}`}
          className="meta inline-flex min-h-11 items-center hover:text-tinta"
        >
          {truncated ? 'Leer completo' : 'Leer'}
        </Link>
        <FavoriteButton poemId={poem.id} saved={saved} signedIn={signedIn} />
        <AddToCollection poemId={poem.id} poemTitle={poem.title ?? firstLine(poem.content)} signedIn={signedIn} />
      </div>
    </article>
  )
}
