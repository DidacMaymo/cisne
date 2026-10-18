import { Link } from 'react-router-dom'
import { FeatherDivider } from '../components/brand/FeatherDivider'
import { SwanMark } from '../components/brand/SwanMark'

const doors = [
  {
    n: 'I',
    title: 'Leer',
    text: 'Cada poema tiene su propia página, como en un libro: una columna estrecha, los versos y las estrofas tal y como se escribieron. Sin anuncios y sin ruido.',
    to: '/explorar',
    cta: 'Empezar a leer',
  },
  {
    n: 'II',
    title: 'Descubrir',
    text: 'Poemas al azar, etiquetas como #nostalgia o #mar, voces que aún no conoces. Guarda los que te acompañen y ordénalos en tus propias colecciones.',
    to: '/explorar',
    cta: 'Explorar poemas',
  },
  {
    n: 'III',
    title: 'Escribir',
    text: 'Un editor en blanco, sin distracciones. Publica con tu nombre, con un pseudónimo o sin firma, y reúne tus poemas en poemarios.',
    to: '/escribir',
    cta: 'Escribir un poema',
  },
] as const

const principles = ['Sin fotografías', 'Sin seguidores', 'Sin contadores', 'Sin rankings']

export function Home() {
  return (
    <>
      <section className="mx-auto max-w-pagina py-6 text-center md:py-14">
        <p className="meta tracking-[0.2em] uppercase">Poesía en español</p>
        <h1 className="mx-auto mt-6 max-w-[20ch] text-balance font-serif text-5xl italic leading-[1.05] md:text-7xl">
          Un lugar para las palabras que merecen quedarse.
        </h1>
        <p className="mx-auto mt-8 max-w-[46ch] text-pretty font-serif text-2xl leading-snug">
          Lee a poetas que todavía no conoces, guarda los versos que te acompañan y escribe los tuyos con total
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

      <FeatherDivider className="mx-auto mt-10 h-4 w-48 text-gris md:mt-16" />

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
          Nadie compite por atención. Los poemas se descubren al azar, no por popularidad, y cada autor es solo su
          nombre, unas líneas sobre sí mismo y lo que escribe.
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
