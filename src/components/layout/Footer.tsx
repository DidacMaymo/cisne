import { Link } from 'react-router-dom'
import { socialLinks } from '../../lib/social'

const legalLinks = [
  { to: '/sobre', label: 'Sobre CISNE' },
  { to: '/contacto', label: 'Contacto' },
  { to: '/aviso-legal', label: 'Aviso legal' },
  { to: '/privacidad', label: 'Privacidad' },
  { to: '/cookies', label: 'Cookies' },
]

const linkClass = 'meta inline-flex min-h-11 items-center underline-offset-4 hover:text-tinta hover:underline'

export function Footer() {
  return (
    <footer className="border-t border-linea">
      <div className="mx-auto flex w-full max-w-ancho flex-wrap items-center justify-between gap-x-6 px-6 py-4 pb-24 md:px-10 md:pb-4">
        <p className="meta">CISNE · poesía en español</p>
        <nav aria-label="Legal">
          <ul className="flex flex-wrap gap-x-6">
            {legalLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className={linkClass}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <ul aria-label="Redes" className="flex gap-x-6">
          {socialLinks.map((s) => (
            <li key={s.label}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                {s.label}
                <span className="sr-only"> (se abre en otra pestaña)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
