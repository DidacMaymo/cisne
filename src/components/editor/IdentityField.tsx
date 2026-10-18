import { useId } from 'react'
import type { PublicationIdentity } from '../../data'
import type { FieldErrors } from '../../data/schemas'

type Props = {
  identity: PublicationIdentity
  displayName: string
  pseudonym: string
  pseudonyms: string[]
  errors: FieldErrors
  /** Sin cuenta aún no hay nombre público que editar. */
  signedIn: boolean
  onChange: (patch: { identity?: PublicationIdentity; displayName?: string; pseudonym?: string }) => void
}

/** Cómo se firma el poema: nombre público, pseudónimo (se puede crear aquí) o anónimo. */
export function IdentityField({ identity, displayName, pseudonym, pseudonyms, errors, signedIn, onChange }: Props) {
  const id = useId()
  const radio = (value: PublicationIdentity, label: string) => (
    <label className="flex min-h-11 items-center gap-3">
      <input
        type="radio"
        name={`${id}-identidad`}
        value={value}
        checked={identity === value}
        onChange={() => onChange({ identity: value })}
        className="size-4 accent-tinta"
      />
      <span>{label}</span>
    </label>
  )

  return (
    <fieldset>
      <legend className="meta">Firmar con</legend>

      {radio('profile_name', 'Mi nombre público')}
      {identity === 'profile_name' && !signedIn && (
        <p className="meta mb-3 ml-7">Firmará con el nombre público que elijas al crear tu cuenta.</p>
      )}
      {identity === 'profile_name' && signedIn && (
        <div className="mb-3 ml-7">
          <label htmlFor={`${id}-nombre`} className="meta block">
            Nombre público
          </label>
          <input
            id={`${id}-nombre`}
            value={displayName}
            onChange={(e) => onChange({ displayName: e.target.value })}
            maxLength={60}
            autoComplete="name"
            aria-invalid={!!errors.displayName}
            aria-describedby={errors.displayName ? `${id}-nombre-error` : undefined}
            className="campo"
          />
          {errors.displayName && (
            <p id={`${id}-nombre-error`} className="meta mt-2 text-tinta">
              {errors.displayName}
            </p>
          )}
        </div>
      )}

      {radio('pseudonym', 'Otro pseudónimo')}
      {identity === 'pseudonym' && (
        <div className="mb-3 ml-7">
          <label htmlFor={`${id}-seudonimo`} className="meta block">
            Pseudónimo
          </label>
          <input
            id={`${id}-seudonimo`}
            value={pseudonym}
            onChange={(e) => onChange({ pseudonym: e.target.value })}
            list={`${id}-conocidos`}
            maxLength={40}
            autoComplete="off"
            aria-invalid={!!errors.pseudonym}
            aria-describedby={`${id}-seudonimo-ayuda`}
            className="campo"
          />
          <datalist id={`${id}-conocidos`}>
            {pseudonyms.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
          <p id={`${id}-seudonimo-ayuda`} className="meta mt-2">
            {errors.pseudonym ?? 'Se mostrará este nombre, sin revelar el de tu cuenta.'}
          </p>
        </div>
      )}

      {radio('anonymous', 'Anónimo')}
      {identity === 'anonymous' && (
        <p className="meta mb-3 ml-7">
          Aparecerá como «Anónimo», sin enlace a tu perfil. Es anonimato frente a otras personas lectoras, no
          frente a quienes administran la plataforma.
        </p>
      )}
    </fieldset>
  )
}
