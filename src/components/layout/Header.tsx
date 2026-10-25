import { Link, NavLink } from 'react-router-dom'
import { useSession } from '../../hooks/useSession'
import { Logo } from './Logo'
import { mainLinks } from './nav'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex min-h-11 items-center border-b border-transparent text-ui hover:text-tinta ${
    isActive ? 'border-tinta text-tinta' : 'text-gris'
  }`

export function Header() {
  const { session, loading } = useSession()
  // Sin sesión: «Entrar». Con sesión: el nombre, que lleva a tus ajustes.
  const account = loading ? null : session ? (
    <Link to="/ajustes/perfil" className="inline-flex min-h-11 max-w-[12rem] items-center truncate text-ui text-gris hover:text-tinta">
      {session.displayName || 'Tu cuenta'}
    </Link>
  ) : (
    <Link to="/entrar" className="inline-flex min-h-11 items-center text-ui text-gris hover:text-tinta">
      Entrar
    </Link>
  )
  return (
    <header className="sticky top-0 z-30 border-b border-linea bg-blanco">
      <div className="mx-auto flex w-full max-w-ancho items-center justify-between px-6 py-2 md:px-10 md:py-4">
        <Logo />
        <nav aria-label="Principal" className="hidden items-center gap-8 md:flex">
          {mainLinks.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-6 md:flex">
          <Link to="/escribir" className="btn">
            Escribir un poema
          </Link>
          {account}
        </div>
        <div className="md:hidden">{!loading && !session && account}</div>
      </div>
    </header>
  )
}
