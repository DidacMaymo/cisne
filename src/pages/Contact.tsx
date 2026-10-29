import { Link } from 'react-router-dom'
import { ContactLink } from '../components/LegalPage'
import { Seo } from '../components/Seo'
import { socialLinks } from '../lib/social'

export function Contact() {
  return (
    <article className="mx-auto w-full max-w-pagina px-6 py-10 leading-relaxed break-words md:px-10 md:py-16">
      <Seo
        title="Contacto — CISNE"
        description="Escribe a CISNE: dudas, sugerencias, problemas con la cuenta, denuncias, derechos de autor, privacidad y colaboraciones."
        path="/contacto"
      />
      <h1 className="font-serif text-4xl">Contacto</h1>
      <p className="mt-6">
        Escríbenos a <ContactLink />.
      </p>

      <h2 className="mt-10 font-serif text-2xl">Para qué escribir</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6">
        <li>Dudas y sugerencias sobre CISNE.</li>
        <li>Problemas con tu cuenta.</li>
        <li>
          Denunciar un contenido. En cada poema encontrarás el botón «Denunciar», que es la vía más directa.
        </li>
        <li>Derechos de autor o sospecha de plagio.</li>
        <li>
          Privacidad y tus datos: mira antes la{' '}
          <Link to="/privacidad" className="underline underline-offset-4">
            política de privacidad
          </Link>
          .
        </li>
        <li>Prensa o colaboraciones.</li>
      </ul>

      {socialLinks.length > 0 && (
        <>
          <h2 className="mt-10 font-serif text-2xl">En redes</h2>
          <ul className="mt-3 flex flex-wrap gap-x-6">
            {socialLinks.map((s) => (
              <li key={s.label}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center underline underline-offset-4"
                >
                  {s.label}
                  <span className="sr-only"> (se abre en otra pestaña)</span>
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </article>
  )
}
