import { useState } from 'react'
import { Link } from 'react-router-dom'
import { repos } from '../data'
import { LoadState } from '../components/LoadState'
import { SettingsNav } from '../components/SettingsNav'
import { useQuery } from '../hooks/useQuery'

const small = 'meta inline-flex min-h-11 shrink-0 items-center hover:text-tinta disabled:opacity-40'

/** A quién y qué apoyas, con la opción de dejar de hacerlo. Solo lo ves tú. */
export function SupportSettings() {
  const { data, error, loading } = useQuery(() => repos.supports.listMine(), [])
  const [busy, setBusy] = useState('')
  const [problem, setProblem] = useState('')

  async function run(key: string, action: () => Promise<void>) {
    setBusy(key)
    setProblem('')
    try {
      await action()
    } catch (e) {
      setProblem(e instanceof Error ? e.message : 'No se pudo completar. Inténtalo de nuevo.')
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-8 text-center font-serif text-5xl">Ajustes</h1>
      <SettingsNav />
      <p className="text-center text-ui text-gris">Solo tú ves esta lista. Dejar de apoyar no avisa a nadie.</p>
      <LoadState loading={loading} error={error} />

      {data && (
        <>
          <section aria-labelledby="apoyos-autores" className="mt-10">
            <h2 id="apoyos-autores" className="font-serif text-3xl">
              Autores
            </h2>
            {data.authors.length === 0 ? (
              <p className="meta mt-3">Todavía no apoyas a ningún autor.</p>
            ) : (
              <ul className="mt-3">
                {data.authors.map((a) => (
                  <li key={a.accountName} className="flex items-center justify-between gap-4 border-b border-linea py-2">
                    <Link to={`/autor/${a.accountName}`} className="min-w-0 truncate font-serif text-xl hover:underline">
                      {a.displayName}
                    </Link>
                    <button
                      type="button"
                      className={small}
                      disabled={!!busy}
                      aria-label={`Dejar de apoyar a ${a.displayName}`}
                      onClick={() => run(a.accountName, () => repos.supports.unsupportAuthor(a.accountName))}
                    >
                      {busy === a.accountName ? 'Un momento…' : 'Dejar de apoyar'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="apoyos-poemas" className="mt-12">
            <h2 id="apoyos-poemas" className="font-serif text-3xl">
              Poemas
            </h2>
            {data.poems.length === 0 ? (
              <p className="meta mt-3">Todavía no apoyas ningún poema.</p>
            ) : (
              <ul className="mt-3">
                {data.poems.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-4 border-b border-linea py-2">
                    {p.available ? (
                      <Link to={`/poema/${p.id}`} className="group min-w-0">
                        <span className="block truncate font-serif text-xl group-hover:underline">{p.title}</span>
                        <span className="meta block truncate">{p.authorName}</span>
                      </Link>
                    ) : (
                      <span className="min-w-0 truncate font-serif text-xl italic text-gris">{p.title}</span>
                    )}
                    <button
                      type="button"
                      className={small}
                      disabled={!!busy}
                      aria-label={`Dejar de apoyar ${p.title}`}
                      onClick={() => run(p.id, () => repos.supports.unsupportPoem(p.id))}
                    >
                      {busy === p.id ? 'Un momento…' : 'Dejar de apoyar'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {problem && (
            <p role="alert" className="mt-6 text-center text-ui">
              {problem}
            </p>
          )}
        </>
      )}
    </div>
  )
}
