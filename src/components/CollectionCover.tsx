import { SwanDivider } from './brand/SwanDivider'

type Props = { title: string; ownerName?: string; size?: 'sm' | 'lg'; className?: string }

/** Portada tipográfica generada: papel, título en serif y una pluma. Nunca imágenes. */
export function CollectionCover({ title, ownerName, size = 'sm', className = '' }: Props) {
  const lg = size === 'lg'
  return (
    <div
      aria-hidden="true"
      className={`flex aspect-[3/4] flex-col items-center justify-between border border-linea bg-papel text-center ${
        lg ? 'px-8 py-10' : 'px-4 py-6'
      } ${className}`}
    >
      <span className={`tracking-[0.3em] text-gris ${lg ? 'text-meta' : 'text-[0.625rem]'}`}>CISNE</span>
      <span
        className={`text-balance break-words font-serif italic leading-tight ${lg ? 'text-4xl' : 'text-2xl'}`}
        style={{ hyphens: 'auto' }}
      >
        {title}
      </span>
      <span className="flex flex-col items-center gap-2">
        <SwanDivider className={`text-gris ${lg ? 'h-5 w-32' : 'h-3 w-20'}`} />
        {ownerName && <span className={`text-tinta ${lg ? 'text-meta' : 'text-[0.625rem]'}`}>{ownerName}</span>}
      </span>
    </div>
  )
}
