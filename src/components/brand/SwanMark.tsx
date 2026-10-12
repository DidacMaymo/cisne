import { SWAN_STROKES, SWAN_VIEWBOX } from './swan-paths'

type Props = {
  className?: string
  /** Si se da un título, el símbolo se anuncia; si no, es decorativo. */
  title?: string
}

/** Emblema de CISNE: cisne de trazo fino cuyo cuerpo y cuello forman un corazón. */
export function SwanMark({ className, title }: Props) {
  return (
    <svg
      viewBox={SWAN_VIEWBOX}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {SWAN_STROKES.map((s) => (
        <path key={s.d} d={s.d} strokeWidth={s.w} />
      ))}
    </svg>
  )
}
