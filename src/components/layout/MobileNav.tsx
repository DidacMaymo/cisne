import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: 'Inicio' },
  { to: '/explorar', label: 'Explorar' },
  { to: '/escribir', label: 'Escribir' },
  { to: '/mis/biblioteca', label: 'Biblioteca' },
  { to: '/mi-pagina', label: 'Mi página' },
] as const

export function MobileNav() {
  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-linea bg-blanco pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-5">
        {items.map((i) => (
          <li key={i.to}>
            <NavLink
              to={i.to}
              end={i.to === '/'}
              className={({ isActive }) =>
                `flex min-h-14 items-center justify-center px-1 text-center text-[0.75rem] ${
                  isActive ? 'text-tinta underline decoration-1 underline-offset-8' : 'text-gris'
                }`
              }
            >
              {i.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
