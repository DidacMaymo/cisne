import type { ReactNode } from 'react'
import { CONTACT_EMAIL, LEGAL_UPDATED } from '../lib/contact'
import { Seo } from './Seo'

export function ContactLink() {
  return (
    <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4">
      {CONTACT_EMAIL}
    </a>
  )
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-serif text-2xl">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  )
}

export function LegalPage({ title, path, children }: { title: string; path: string; children: ReactNode }) {
  return (
    <article className="mx-auto w-full max-w-pagina px-6 py-10 leading-relaxed break-words md:px-10 md:py-16">
      <Seo title={`${title} — CISNE`} description={`${title} de CISNE, plataforma de poesía en español.`} path={path} />
      <h1 className="font-serif text-4xl">{title}</h1>
      <p className="meta mt-2">Última actualización: {LEGAL_UPDATED}</p>
      {children}
    </article>
  )
}
