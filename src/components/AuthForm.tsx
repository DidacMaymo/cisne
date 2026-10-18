import { useId, type FormEvent, type ReactNode } from 'react'
import { dataMode } from '../data'

export type AuthField = {
  name: string
  label: string
  type: 'text' | 'email' | 'password'
  autoComplete: string
  hint?: string
}

type Props = {
  title: string
  intro?: string
  fields: AuthField[]
  values: Record<string, string>
  errors: Record<string, string>
  problem: string
  busy: boolean
  submitLabel: string
  onChange: (name: string, value: string) => void
  onSubmit: () => void
  footer?: ReactNode
}

/** Formulario sobrio para entrar y registrarse: etiquetas claras y errores junto a su campo. */
export function AuthForm(p: Props) {
  const id = useId()
  function submit(e: FormEvent) {
    e.preventDefault()
    p.onSubmit()
  }
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-center font-serif text-5xl">{p.title}</h1>
      {p.intro && <p className="mt-3 text-center font-serif text-xl italic text-gris">{p.intro}</p>}
      <form onSubmit={submit} noValidate className="mt-10 grid gap-7">
        {p.fields.map((f) => {
          const err = p.errors[f.name]
          const describedBy = err || f.hint ? `${id}-${f.name}-h` : undefined
          return (
            <div key={f.name}>
              <label htmlFor={`${id}-${f.name}`} className="meta block">
                {f.label}
              </label>
              <input
                id={`${id}-${f.name}`}
                type={f.type}
                value={p.values[f.name] ?? ''}
                onChange={(e) => p.onChange(f.name, e.target.value)}
                autoComplete={f.autoComplete}
                aria-invalid={!!err}
                aria-describedby={describedBy}
                className="campo"
              />
              {(err || f.hint) && (
                <p id={describedBy} className={`meta mt-2 ${err ? 'text-tinta' : ''}`}>
                  {err ?? f.hint}
                </p>
              )}
            </div>
          )
        })}
        <button type="submit" className="btn btn-primario justify-center" disabled={p.busy}>
          {p.busy ? 'Un momento…' : p.submitLabel}
        </button>
        {p.problem && (
          <p role="alert" className="text-center text-ui">
            {p.problem}
          </p>
        )}
      </form>
      {p.footer && <div className="mt-8 text-center text-ui">{p.footer}</div>}
      {dataMode === 'local' && (
        <p className="meta mt-10 border-t border-linea pt-4 text-center">
          Versión de prueba: por ahora tu cuenta se guarda solo en este navegador. Cuando CISNE tenga servidor, las
          cuentas serán reales y podrás entrar desde cualquier dispositivo.
        </p>
      )}
    </div>
  )
}
