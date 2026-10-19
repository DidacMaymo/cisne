import { useState } from 'react'
import { repos } from '../data'
import type { Visibility } from '../data'
import { LoadState } from '../components/LoadState'
import { SettingsNav } from '../components/SettingsNav'
import { useQuery } from '../hooks/useQuery'

const options: [Visibility, string, string][] = [
  ['private', 'Solo yo', 'Verás cuánta gente te apoya; nadie más.'],
  ['public', 'Todo el mundo', 'Se verá en tu página de autor y en tus poemas firmados con tu nombre.'],
]

/** Privacidad: quién ve cuánta gente te apoya. */
export function PrivacySettings() {
  const { data, error, loading } = useQuery(() => repos.profiles.getMine(), [])
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  async function choose(supportVisibility: Visibility) {
    setBusy(true)
    setStatus('')
    try {
      await repos.profiles.updateMine({ supportVisibility })
      setStatus('Guardado.')
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'No se pudo guardar.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-8 text-center font-serif text-5xl">Ajustes</h1>
      <SettingsNav />
      <LoadState loading={loading} error={error} />
      {data && (
        <fieldset disabled={busy}>
          <legend className="font-serif text-3xl">¿Quién ve cuánta gente te apoya?</legend>
          <p className="mt-2 text-ui text-gris">
            Los apoyos son un gesto entre quien lee y quien escribe. En CISNE nunca sirven para ordenar poemas ni
            para destacar a nadie. Los poemas anónimos o con pseudónimo no muestran su número a nadie más que a ti.
          </p>
          <div className="mt-6">
            {options.map(([value, label, hint]) => (
              <label key={value} className="flex min-h-11 items-start gap-3 py-1">
                <input
                  type="radio"
                  name="apoyos"
                  checked={data.supportVisibility === value}
                  onChange={() => choose(value)}
                  className="mt-1 size-4 shrink-0 accent-tinta"
                />
                <span>
                  {label}
                  <span className="meta block">{hint}</span>
                </span>
              </label>
            ))}
          </div>
          <p role="status" className="meta mt-4 min-h-5">
            {status}
          </p>
        </fieldset>
      )}
    </div>
  )
}
