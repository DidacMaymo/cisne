import { Link } from 'react-router-dom'
import type { CollectionView } from '../data'
import { CollectionCover } from './CollectionCover'

/** Una colección en un listado: su portada tipográfica y una línea de datos. */
export function CollectionCard({ collection: c }: { collection: CollectionView }) {
  return (
    <Link to={`/coleccion/${c.id}`} className="group block">
      <CollectionCover title={c.title} ownerName={c.ownerName} className="transition-colors group-hover:border-tinta" />
      <span className="mt-3 block font-serif text-xl leading-tight underline-offset-4 group-hover:underline">
        {c.title}
      </span>
      <span className="meta block">
        {c.poemCount === 1 ? '1 poema' : `${c.poemCount} poemas`}
        {c.isOwner && c.visibility === 'private' && ' · Privada'}
      </span>
    </Link>
  )
}
