import { useId, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { repos } from '../data'
import type { Profile } from '../data'
import { LoadState } from '../components/LoadState'
import { SettingsNav } from '../components/SettingsNav'
import { formatDateEs, NAME_CHANGE_DAYS, nextNameChange } from '../data/names'
import { countWords, MAX_BIO_WORDS, profileSchema, toErrors } from '../data/schemas'
import { useQuery } from '../hooks/useQuery'

const MAX_LINKS = 4

export function ProfileSettings() {
  const { data, error, loading } = useQuery(() => repos.profiles.getMine(), [])
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-8 text-center font-serif text-5xl">Ajustes</h1>
      <SettingsNav />
      <LoadState loading={loading} error={error} />
      {data && <ProfileForm profile={data} />}
    </div>
  )
}

/** Lo que verá cualquiera en tu página de autor. Solo texto: nada de fotos. */
function ProfileForm({ profile }: { profile: Profile }) {
  const id = useId()
  const [saved, setSaved] = useState(profile)
  const [displayName, setDisplayName] = useState(profile.displayName)
  const [primaryPseudonym, setPseudonym] = useState(profile.primaryPseudonym ?? '')
  const [bio, setBio] = useState(profile.bio ?? '')
  const [links, setLinks] = useState<string[]>(profile.links?.length ? profile.links : [''])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  // Sin nombre aún: elegirlo no cuenta como cambio, aunque la fecha fuese anterior.
  const nextChange = saved.displayName ? nextNameChange(saved.displayNameChangedAt) : null

  async function submit(e: FormEvent) {
    e.preventDefault()
    setStatus('')
    const parsed = profileSchema.safeParse({
      displayName,
      primaryPseudonym,
      bio,
      links: links.map((l) => l.trim()).filter(Boolean),
    })
    if (!parsed.success) return setErrors(toErrors(parsed.error))
    setErrors({})
    setBusy(true)
    try {
      const v = parsed.data
      const updated = await repos.profiles.updateMine({
        displayName: v.displayName,
        primaryPseudonym: v.primaryPseudonym || undefined,
        bio: v.bio || undefined,
        links: v.links,
      })
      setSaved(updated)
      setDisplayName(updated.displayName)
      setStatus(
        updated.accountName !== saved.accountName
          ? `Perfil guardado. Tu página de autor ahora está en /autor/${updated.accountName}.`
          : 'Perfil guardado.',
      )
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'No se pudo guardar.')
    } finally {
      setBusy(false)
    }
  }

  // Los errores de enlaces vienen indexados sobre la lista sin huecos.
  const filled = links.map((l, i) => ({ l, i })).filter((x) => x.l.trim())
  const linkError = (i: number) => {
    const n = filled.findIndex((x) => x.i === i)
    return n === -1 ? undefined : errors[`links.${n}`]
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-10">
      <p className="text-center text-ui text-gris">
        Así te verán en{' '}
        <Link to={`/autor/${saved.accountName}`} className="underline underline-offset-4 hover:text-tinta">
          tu página de autor
        </Link>
        . Aquí solo hay palabras: sin fotografías.
      </p>

      <div>
        <label htmlFor={`${id}-n`} className="meta block">
          Nombre público
        </label>
        <input
          id={`${id}-n`}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={60}
          aria-invalid={!!errors.displayName}
          readOnly={!!nextChange}
          aria-describedby={`${id}-nh`}
          className="campo font-serif text-3xl"
        />
        <p id={`${id}-nh`} className={`meta mt-2 ${errors.displayName ? 'text-tinta' : ''}`}>
          {errors.displayName ?? 'Tu nombre o un pseudónimo: es lo que firma tus poemas «con mi nombre».'}
        </p>
        <p className="meta mt-2">
          {nextChange
            ? `Podrás volver a cambiarlo a partir del ${formatDateEs(nextChange)}. `
            : `Puedes cambiarlo una vez cada ${NAME_CHANGE_DAYS} días; el primer cambio es libre. `}
          Dos personas no pueden tener el mismo nombre. Al cambiarlo, la dirección de tu página de autor cambia con él
          (ahora es /autor/{saved.accountName}) y la anterior deja de funcionar.
        </p>
      </div>

      <div>
        <label htmlFor={`${id}-b`} className="meta block">
          Unas líneas sobre ti
        </label>
        <textarea
          id={`${id}-b`}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          aria-invalid={!!errors.bio || countWords(bio) > MAX_BIO_WORDS}
          aria-describedby={`${id}-bh`}
          className="campo field-sizing-content resize-none font-serif text-xl italic"
        />
        <p id={`${id}-bh`} className={`meta mt-2 ${errors.bio ? 'text-tinta' : ''}`}>
          {errors.bio ?? `${countWords(bio)} de ${MAX_BIO_WORDS} palabras`}
        </p>
      </div>

      <fieldset>
        <legend className="meta">Enlaces (redes o web personal)</legend>
        {links.map((l, i) => {
          const err = linkError(i)
          return (
            <div key={i} className="mt-2">
              <div className="flex items-end gap-3">
                <label htmlFor={`${id}-l${i}`} className="sr-only">
                  Enlace {i + 1}
                </label>
                <input
                  id={`${id}-l${i}`}
                  type="url"
                  inputMode="url"
                  value={l}
                  onChange={(e) => setLinks((ls) => ls.map((x, j) => (j === i ? e.target.value : x)))}
                  placeholder="https://instagram.com/tu-nombre"
                  aria-invalid={!!err}
                  aria-describedby={err ? `${id}-l${i}e` : undefined}
                  className="campo"
                />
                <button
                  type="button"
                  className="meta inline-flex min-h-11 shrink-0 items-center hover:text-tinta"
                  aria-label={`Quitar enlace ${i + 1}`}
                  onClick={() => setLinks((ls) => (ls.length === 1 ? [''] : ls.filter((_, j) => j !== i)))}
                >
                  Quitar
                </button>
              </div>
              {err && (
                <p id={`${id}-l${i}e`} className="meta mt-2 text-tinta">
                  {err}
                </p>
              )}
            </div>
          )
        })}
        {links.length < MAX_LINKS && (
          <button
            type="button"
            className="meta mt-2 inline-flex min-h-11 items-center hover:text-tinta"
            onClick={() => setLinks((ls) => [...ls, ''])}
          >
            + Añadir otro enlace
          </button>
        )}
      </fieldset>

      <div>
        <label htmlFor={`${id}-p`} className="meta block">
          Pseudónimo habitual (opcional)
        </label>
        <input
          id={`${id}-p`}
          value={primaryPseudonym}
          onChange={(e) => setPseudonym(e.target.value)}
          maxLength={40}
          aria-describedby={`${id}-ph`}
          className="campo"
        />
        <p id={`${id}-ph`} className={`meta mt-2 ${errors.primaryPseudonym ? 'text-tinta' : ''}`}>
          {errors.primaryPseudonym ??
            'Privado. Se propone en el editor al firmar con pseudónimo; esos poemas no enlazan a esta página.'}
        </p>
      </div>

      <div className="text-center">
        <button type="submit" className="btn btn-primario" disabled={busy}>
          {busy ? 'Guardando…' : 'Guardar perfil'}
        </button>
        <p role="status" className="meta mt-3 min-h-5">
          {status}
        </p>
      </div>
    </form>
  )
}
