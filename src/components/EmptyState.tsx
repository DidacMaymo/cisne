import type { ReactNode } from 'react'
import { SwanMark } from './brand/SwanMark'

type Props = { title: string; children?: ReactNode }

/** Estado vacío: el cisne, delicado, y una frase. */
export function EmptyState({ title, children }: Props) {
  return (
    <div className="flex flex-col items-center px-4 py-16 text-center">
      <SwanMark className="h-24 w-auto text-gris" />
      <p className="mt-8 font-serif text-3xl italic">{title}</p>
      {children && <div className="mt-8">{children}</div>}
    </div>
  )
}
