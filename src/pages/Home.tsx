import { Link } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { FeatherDivider } from '../components/brand/FeatherDivider'

export function Home() {
  return (
    <>
      <section className="py-6 text-center md:py-10">
        <h1 className="mx-auto max-w-[22ch] text-balance font-serif text-4xl italic leading-tight md:text-portada">
          Un lugar para las palabras que merecen quedarse.
        </h1>
        <FeatherDivider className="mx-auto mt-10 h-4 w-48 text-gris" />
      </section>
      <EmptyState title="Toda obra empieza con una primera palabra.">
        <Link to="/escribir" className="btn">
          Escribir mi primer poema
        </Link>
      </EmptyState>
    </>
  )
}
