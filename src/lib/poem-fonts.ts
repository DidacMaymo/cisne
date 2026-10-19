import type { PoemFont } from '../data'

/** Las cinco tipografías que se pueden elegir para un poema. */
export const poemFonts: { id: PoemFont; label: string; hint: string; className: string }[] = [
  { id: 'clasica', label: 'Clásica', hint: 'Cormorant Garamond · la de CISNE, elegante', className: 'poema-clasica' },
  { id: 'libro', label: 'Libro', hint: 'EB Garamond · la de los poemarios impresos', className: 'poema-libro' },
  { id: 'pantalla', label: 'Pantalla', hint: 'Literata · pensada para leer en pantalla', className: 'poema-pantalla' },
  { id: 'maquina', label: 'Máquina', hint: 'Courier Prime · máquina de escribir', className: 'poema-maquina' },
  { id: 'clara', label: 'Clara', hint: 'Atkinson Hyperlegible · máxima legibilidad', className: 'poema-clara' },
]

export const isPoemFont = (v: unknown): v is PoemFont => poemFonts.some((f) => f.id === v)

export function fontClass(font: PoemFont | undefined): string {
  return poemFonts.find((f) => f.id === font)?.className ?? 'poema-clasica'
}
