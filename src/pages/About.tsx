import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { kofiUrl } from '../lib/social'

const buttonClass =
  'inline-flex min-h-11 items-center rounded border border-linea px-5 hover:border-tinta'

export function About() {
  return (
    <article className="mx-auto w-full max-w-pagina px-6 py-10 leading-relaxed break-words md:px-10 md:py-16">
      <Seo
        title="Sobre CISNE"
        description="CISNE es un lugar para leer, escribir y publicar poesía en español."
        path="/sobre"
      />
      <h1 className="font-serif text-4xl">Sobre CISNE</h1>
      <p className="mt-6 font-serif text-xl italic">Un lugar para la poesía.</p>

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

      <section className="mt-10" aria-labelledby="movil">
        <h2 id="movil" className="font-serif text-2xl">
          ¿Y en el móvil?
        </h2>
        <p className="mt-4">
          CISNE es, por ahora, una web. No descartamos una app para Android e iOS; mientras tanto, puedes añadirla a la
          pantalla de inicio de tu móvil y abrirla como si fuera una app.
        </p>
        <h3 className="mt-6 font-medium">iPhone (Safari)</h3>
        <ol className="mt-2 list-decimal space-y-1 pl-6">
          <li>Toca el botón Compartir.</li>
          <li>Elige «Añadir a pantalla de inicio».</li>
          <li>Toca «Añadir».</li>
        </ol>
        <h3 className="mt-6 font-medium">Android (Chrome)</h3>
        <ol className="mt-2 list-decimal space-y-1 pl-6">
          <li>Abre el menú ⋮.</li>
          <li>Elige «Añadir a pantalla de inicio» o «Instalar aplicación».</li>
          <li>Toca «Instalar».</li>
        </ol>
      </section>

      <section className="mt-10" aria-labelledby="apoyar">
        <h2 id="apoyar" className="font-serif text-2xl">
          Apoyar el proyecto
        </h2>
        <p className="mt-4">
          La mejor forma de apoyar CISNE es darlo a conocer: comparte la web con quien ame la poesía y publica tus
          poemas para que haya más versos que leer.
        </p>
        {kofiUrl && (
          <p className="mt-4">
            Si quieres invitarnos a un café,{' '}
            <a href={kofiUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
              puedes hacerlo en Ko-fi
            </a>
            .
          </p>
        )}
      </section>

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
