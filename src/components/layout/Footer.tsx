import { Link } from 'react-router-dom'

const links = [
  { to: '/mis/poemas', label: 'Mis poemas' },
  { to: '/mis/borradores', label: 'Mis borradores' },
  { to: '/mis/colecciones', label: 'Mis colecciones' },
  { to: '/mis/biblioteca', label: 'Mi biblioteca' },
  { to: '/ajustes/perfil', label: 'Ajustes' },
] as const

export function Footer() {
  return (
    <footer className="border-t border-linea">
      <div className="mx-auto flex w-full max-w-ancho flex-col gap-2 px-6 py-6 pb-24 md:flex-row md:items-center md:justify-between md:px-10 md:pb-6">
        <p className="meta">CISNE · poesía en español · menos ruido, más poesía.</p>
        <nav aria-label="Tu espacio" className="flex flex-wrap gap-x-6">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="meta inline-flex min-h-11 items-center hover:text-tinta">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
