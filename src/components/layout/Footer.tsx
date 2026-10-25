import { socialLinks } from '../../lib/social'

export function Footer() {
  return (
    <footer className="border-t border-linea">
      <div className="mx-auto flex w-full max-w-ancho flex-wrap items-center justify-between gap-x-6 px-6 py-4 pb-24 md:px-10 md:pb-4">
        <p className="meta">CISNE · poesía en español</p>
        <ul aria-label="Redes" className="flex gap-x-6">
          {socialLinks.map((s) => (
            <li key={s.label}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="meta inline-flex min-h-11 items-center underline-offset-4 hover:text-tinta hover:underline"
              >
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
