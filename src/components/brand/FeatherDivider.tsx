/** Separador editorial: un trazo finísimo en forma de pluma. */
export function FeatherDivider({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M2 8 H88" />
      <path d="M152 8 H238" />
      <path d="M88 8 C100 2 114 1 128 4 C136 6 144 7 152 8 C144 9 136 10 128 12 C114 15 100 14 88 8 Z" />
      <path d="M96 8 H140" />
    </svg>
  )
}
