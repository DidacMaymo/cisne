import { useId, useState, type FormEvent } from 'react'
import type { CollectionInput } from '../data/repositories'
import { collectionSchema, toErrors } from '../data/schemas'

type Props = {
  initial?: CollectionInput
  submitLabel: string
  onSubmit: (values: CollectionInput) => Promise<void>
  onCancel?: () => void
}

/** Título, descripción y visibilidad de una colección. */
export function CollectionForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const id = useId()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [visibility, setVisibility] = useState(initial?.visibility ?? 'private')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [problem, setProblem] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    const parsed = collectionSchema.safeParse({ title, description, visibility })
    if (!parsed.success) return setErrors(toErrors(parsed.error))
    setErrors({})
    setProblem('')
    setBusy(true)
    try {
      await onSubmit(parsed.data)
    } catch (err) {
      setProblem(err instanceof Error ? err.message : 'No se pudo guardar. Inténtalo de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-8">
      <div>
        <label htmlFor={`${id}-t`} className="meta block">
          Título
        </label>
        <input
          id={`${id}-t`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
          autoComplete="off"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? `${id}-te` : undefined}
          className="campo font-serif text-3xl"
        />
        {errors.title && (
          <p id={`${id}-te`} className="meta mt-2 text-tinta">
            {errors.title}
          </p>
        )}
      </div>
      <div>
        <label htmlFor={`${id}-d`} className="meta block">
          Descripción (opcional)
        </label>
        <textarea
          id={`${id}-d`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={400}
          aria-invalid={!!errors.description}
          aria-describedby={`${id}-dh`}
          className="campo field-sizing-content resize-none font-serif text-xl"
        />
        <p id={`${id}-dh`} className="meta mt-2">
          {errors.description ?? 'Una etapa, una emoción, un proyecto: lo que reúne estos poemas.'}
        </p>
      </div>
      <fieldset>
        <legend className="meta">Visibilidad</legend>
        {(
          [
            ['private', 'Privada', 'solo tú puedes verla'],
            ['public', 'Pública', 'aparece en tu página de autor y se puede compartir'],
          ] as const
        ).map(([value, label, hint]) => (
          <label key={value} className="flex min-h-11 items-center gap-3">
            <input
              type="radio"
              name={`${id}-v`}
              checked={visibility === value}
              onChange={() => setVisibility(value)}
              className="size-4 accent-tinta"
            />
            <span>
              {label} <span className="meta">— {hint}</span>
            </span>
          </label>
        ))}
      </fieldset>
      <div className="flex flex-wrap justify-center gap-3">
        {onCancel && (
          <button type="button" className="btn" onClick={onCancel}>
            Cancelar
          </button>
        )}
        <button type="submit" className="btn btn-primario" disabled={busy}>
          {busy ? 'Guardando…' : submitLabel}
        </button>
      </div>
      {problem && (
        <p role="alert" className="text-center text-ui">
          {problem}
        </p>
      )}
    </form>
  )
}
