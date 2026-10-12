import { Link } from 'react-router-dom'

type Props = { name: string; linked?: boolean }

/** Etiqueta pequeña y discreta: texto gris, sin bloques de color. */
export function TagChip({ name, linked = true }: Props) {
  if (!linked) return <span className="meta">#{name}</span>
  return (
    <Link
      to={`/etiqueta/${encodeURIComponent(name)}`}
      className="meta inline-flex min-h-11 items-center hover:text-tinta hover:underline underline-offset-4"
    >
      #{name}
    </Link>
  )
}
