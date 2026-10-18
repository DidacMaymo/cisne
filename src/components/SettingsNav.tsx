import { NavLink } from 'react-router-dom'

const links = [
  { to: '/ajustes/perfil', label: 'Perfil' },
  { to: '/ajustes/cuenta', label: 'Cuenta' },
] as const

export function SettingsNav() {
  return (
    <nav aria-label="Ajustes" className="mb-10 flex justify-center gap-8 border-b border-linea">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          className={({ isActive }) =>
            `inline-flex min-h-11 items-center border-b text-ui ${
              isActive ? 'border-tinta text-tinta' : 'border-transparent text-gris hover:text-tinta'
            }`
          }
        >
          {l.label}
        </NavLink>
      ))}
    </nav>
  )
}
