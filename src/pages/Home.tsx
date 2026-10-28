import { Link } from 'react-router-dom'
import { SwanDivider } from '../components/brand/SwanDivider'
import { SwanMark } from '../components/brand/SwanMark'
import { Seo } from '../components/Seo'
import { SITE_META } from '../lib/seo'

const doors = [
  {
    n: 'I',
    title: 'Leer',
    text: 'Lee poesía en un formato limpio y cuidado, pensado para disfrutar cada poema sin distracciones.',
    to: '/explorar',
    cta: 'Empezar a leer',
  },
  {
    n: 'II',
    title: 'Descubrir',
    text: 'Explora poemas por temas, encuentra nuevos autores y guarda los que te gusten en tu biblioteca o en colecciones.',
    to: '/explorar',
    cta: 'Explorar poemas',
  },
  {
    n: 'III',
    title: 'Escribir',
    text: 'Escribe y publica tus poemas, elige cómo firmarlos y organiza tu obra en poemarios.',
    to: '/escribir',
    cta: 'Escribir un poema',
  },
] as const

const principles = ['Sin fotografías', 'Sin seguidores', 'Sin rankings']

export function Home() {
  return (
    <>
      <Seo {...SITE_META} />
      <section className="mx-auto max-w-pagina py-6 text-center md:py-14">
        <p className="meta tracking-[0.2em] uppercase">Poesía en español</p>
        <h1 className="mx-auto mt-6 max-w-[20ch] text-balance font-serif text-5xl italic leading-[1.05] md:text-7xl">
          Un lugar para la poesía.
        </h1>
        <p className="mx-auto mt-8 max-w-[46ch] text-pretty font-serif text-2xl leading-snug">
          Lee a poetas que todavía no conoces, guarda los versos que te emocionan y escribe los tuyos con total
          libertad.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/explorar" className="btn btn-primario">
            Explorar poemas
          </Link>
          <Link to="/escribir" className="btn">
            Escribir un poema
          </Link>
        </div>
      </section>

      <SwanDivider className="mx-auto mt-10 h-6 w-48 text-gris md:mt-16" />

      <section aria-label="Qué puedes hacer en CISNE" className="mx-auto mt-14 max-w-ancho md:mt-20">
        <ol className="grid gap-14 md:grid-cols-3 md:gap-12">
          {doors.map((d) => (
            <li key={d.n} className="text-center md:text-left">
              <p className="meta font-serif text-lg italic">{d.n}</p>
              <h2 className="mt-2 font-serif text-4xl">{d.title}</h2>
              <p className="mx-auto mt-4 max-w-[38ch] text-ui leading-relaxed text-tinta/80 md:mx-0">{d.text}</p>
              <Link to={d.to} className="enlace mt-2 text-ui">
                {d.cta}
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto mt-20 max-w-pagina border-y border-linea py-14 text-center md:mt-28 md:py-20">
        <h2 className="font-serif text-4xl italic md:text-5xl">Aquí solo hay palabras.</h2>
        <ul className="mt-6 flex flex-wrap justify-center gap-x-3 gap-y-1 text-ui text-gris">
          {principles.map((p, i) => (
            <li key={p}>
              {i > 0 && (
                <span aria-hidden="true" className="mr-3">
                  ·
                </span>
              )}
              {p}
            </li>
          ))}
        </ul>
        <p className="mx-auto mt-6 max-w-[44ch] text-pretty font-serif text-xl leading-relaxed">
          Aquí los poemas se descubren al azar, no por popularidad.
        </p>
      </section>

      <section className="flex flex-col items-center py-20 text-center md:py-28">
        <SwanMark className="h-20 w-auto text-gris" />
        <p className="mt-8 font-serif text-3xl italic">Toda obra empieza con una primera palabra.</p>
        <Link to="/escribir" className="btn mt-8">
          Escribir mi primer poema
        </Link>
      </section>
    </>
  )
}
