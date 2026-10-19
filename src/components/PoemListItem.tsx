import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDate } from '../lib/format'
import { firstLine, makeExcerpt } from '../lib/poem-text'
import type { PoemView } from '../data'
import { AddToCollection } from './AddToCollection'
import { SwanMark } from './brand/SwanMark'
import { FavoriteButton } from './FavoriteButton'
import { PoemText } from './PoemText'
import { ShareButton } from './ShareButton'
import { TagChip } from './TagChip'

type Props = { poem: PoemView; saved: boolean; signedIn: boolean }

/** Un poema en un listado: abierto, sin tarjeta, con fragmento que respeta los versos. */
export function PoemListItem({ poem, saved, signedIn }: Props) {
  const to = `/poema/${poem.id}`
  const { text, truncated } = makeExcerpt(poem.content)
  const name = poem.title ?? firstLine(poem.content)
  // Un «Cisne negro» se muestra tapado hasta que quien lee decide abrirlo.
  const [revealed, setRevealed] = useState(!poem.sensitive)

  return (
    <article
      className={
        poem.sensitive
          ? 'cisne-negro -mx-6 my-8 px-6 py-10 sm:mx-0 sm:px-10'
          : 'border-b border-linea py-12 first:pt-2 last:border-b-0'
      }
    >
      {poem.sensitive && (
        <p className="meta mb-6 flex items-center gap-2">
          <SwanMark className="h-5 w-auto text-blanco" />
          Cisne negro
        </p>
      )}
      {poem.title && (
        <h2 className="font-serif text-4xl leading-tight">
          <Link to={to} className="underline-offset-4 hover:underline">
            {poem.title}
          </Link>
        </h2>
      )}

      {revealed ? (
        <Link to={to} className={`block ${poem.title ? 'mt-5' : ''}`} tabIndex={poem.title ? -1 : undefined}>
          <PoemText content={text} font={poem.font} />
        </Link>
      ) : (
        <div className={poem.title ? 'mt-5' : ''}>
          <p className="max-w-[40ch] font-serif text-xl italic">
            Este poema toca temas sensibles. Ábrelo solo si te apetece leerlo ahora.
          </p>
          <button type="button" className="btn mt-4" onClick={() => setRevealed(true)}>
            Mostrar el poema
          </button>
        </div>
      )}

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
          aria-label={`Leer ${name}${truncated ? ' completo' : ''}`}
          className="meta inline-flex min-h-11 items-center hover:text-tinta"
        >
          {truncated ? 'Leer completo' : 'Leer'}
        </Link>
        <FavoriteButton poemId={poem.id} saved={saved} signedIn={signedIn} />
        <AddToCollection poemId={poem.id} poemTitle={name} signedIn={signedIn} />
        <ShareButton path={to} title={name} author={poem.authorName} />
      </div>
    </article>
  )
}
