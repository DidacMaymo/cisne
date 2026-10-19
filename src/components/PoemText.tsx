import type { PoemFont } from '../data'
import { fontClass } from '../lib/poem-fonts'
import { renderMarkup } from '../lib/poem-markup'

type Props = { content: string; font?: PoemFont; className?: string }

/** Texto de un poema con su tipografía y su formato. Los saltos de línea se respetan siempre. */
export function PoemText({ content, font, className = '' }: Props) {
  return <div className={`poema ${fontClass(font)} ${className}`}>{renderMarkup(content)}</div>
}
