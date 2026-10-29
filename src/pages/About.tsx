import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'

const buttonClass =
  'inline-flex min-h-11 items-center rounded border border-linea px-5 hover:border-tinta'

export function About() {
  return (
    <article className="mx-auto w-full max-w-pagina px-6 py-10 leading-relaxed break-words md:px-10 md:py-16">
      <Seo
        title="Sobre CISNE"
        description="CISNE es un lugar para leer, escribir y publicar poesía en español, con menos ruido y más poesía."
        path="/sobre"
      />
      <h1 className="font-serif text-4xl">Sobre CISNE</h1>
      <p className="mt-6 font-serif text-xl italic">Menos ruido, más poesía.</p>

      <div className="mt-6 space-y-4">
        <p>
          CISNE es un lugar para leer, escribir y publicar poesía en español. Sin fotos, sin seguidores y sin
          rankings: solo los versos.
        </p>
        <p>
          Puedes firmar con tu nombre, con un pseudónimo o de forma anónima. Al leer, no hay algoritmo que decida por
          ti: se descubre al azar, de poema en poema.
        </p>
        <p>
          Reúne tus poemas en colecciones, guarda en tu biblioteca los que quieras volver a leer, apoya los que te
          lleguen y comenta directamente sobre los versos.
        </p>
        <p>
          Los poemas son de quienes los escriben. Más detalles en el{' '}
          <Link to="/aviso-legal" className="underline underline-offset-4">
            aviso legal
          </Link>
          .
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link to="/explorar" className={buttonClass}>
          Leer
        </Link>
        <Link to="/escribir" className={buttonClass}>
          Escribir
        </Link>
      </div>
    </article>
  )
}
