import { Link, useSearchParams } from 'react-router-dom'
import { repos } from '../data'
import { EmptyState } from '../components/EmptyState'
import { LoadState } from '../components/LoadState'
import { PoemList } from '../components/PoemList'
import { FeatherDivider } from '../components/brand/FeatherDivider'
import { useQuery } from '../hooks/useQuery'
import { dayNumber } from '../lib/format'

const tabs = [
  { orden: 'recientes', label: 'Recientes' },
  { orden: 'descubrir', label: 'Descubrir' },
] as const

export function Home() {
  const [params, setParams] = useSearchParams()
  const orden = params.get('orden') === 'descubrir' ? 'descubrir' : 'recientes'

  const { data, error, loading } = useQuery(
    () => (orden === 'descubrir' ? repos.poems.discover(dayNumber(), 20) : repos.poems.listPublic()),
    [orden],
  )

  return (
    <>
      <section className="py-6 text-center md:py-10">
        <h1 className="mx-auto max-w-[22ch] text-balance font-serif text-4xl italic leading-tight md:text-portada">
          Un lugar para las palabras que merecen quedarse.
        </h1>
        <FeatherDivider className="mx-auto mt-10 h-4 w-48 text-gris" />
      </section>

      <LoadState loading={loading} error={error} />

      {data && data.length === 0 && (
        <EmptyState title="Toda obra empieza con una primera palabra.">
          <Link to="/escribir" className="btn">
            Escribir mi primer poema
          </Link>
        </EmptyState>
      )}

      {data && data.length > 0 && (
        <>
          <div role="group" aria-label="Orden de los poemas" className="mb-8 flex justify-center gap-8">
            {tabs.map((t) => (
              <button
                key={t.orden}
                type="button"
                aria-pressed={orden === t.orden}
                onClick={() => setParams(t.orden === 'recientes' ? {} : { orden: t.orden }, { replace: true })}
                className={`inline-flex min-h-11 items-center border-b text-ui ${
                  orden === t.orden ? 'border-tinta text-tinta' : 'border-transparent text-gris hover:text-tinta'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <PoemList poems={data} />
        </>
      )}
    </>
  )
}
