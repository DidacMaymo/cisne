import { SWAN_STROKES } from './swan-paths'

// El emblema mide 585 × 670 en sus coordenadas originales (swan-paths.ts).
const EMBLEM = { x: 325, y: 375, h: 670 }
// Punta inferior del corazón, donde termina la línea.
const TIP = { x: 672, y: 1028 }

const H = 26 // alto del emblema dentro del separador
const S = H / EMBLEM.h
const LEFT = 196 // donde empieza el cisne
const OX = LEFT - EMBLEM.x * S
const OY = 1 - EMBLEM.y * S
const TIP_X = OX + TIP.x * S
const TIP_Y = OY + TIP.y * S

/**
 * Separador editorial: un trazo finísimo que, como la tinta de una pluma,
 * acaba convirtiéndose en el cisne del emblema.
 */
export function SwanDivider({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 28"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* La línea se afina hacia el inicio, como un trazo que empieza. */}
      <path d={`M2 ${TIP_Y} H${TIP_X}`} strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <g transform={`translate(${OX} ${OY}) scale(${S})`}>
        {SWAN_STROKES.map((s) => (
          <path key={s.d} d={s.d} strokeWidth={s.w / 6} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
    </svg>
  )
}
