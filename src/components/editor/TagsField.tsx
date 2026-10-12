import { useId } from 'react'
import { normalizeTag } from '../../data/normalize'
import type { Tag } from '../../data'

const MAX_TAGS = 10
const RECOMMENDED = 5

type Props = {
  tags: string[]
  input: string
  suggestions: Tag[]
  error?: string
  onTagsChange: (tags: string[]) => void
  onInputChange: (value: string) => void
}

/** Etiquetas como texto: se escribe, Enter o coma las añade, y se sugieren las que ya existen. */
export function TagsField({ tags, input, suggestions, error, onTagsChange, onInputChange }: Props) {
  const id = useId()

  function add(raw: string) {
    const next = [...tags]
    for (const part of raw.split(',')) {
      const n = normalizeTag(part)
      if (n && !next.includes(n) && next.length < MAX_TAGS) next.push(n)
    }
    onTagsChange(next)
    onInputChange('')
  }

  const query = normalizeTag(input)
  const shown = suggestions
    .filter((s) => !tags.includes(s.normalizedName) && s.normalizedName.startsWith(query))
    .slice(0, 8)

  return (
    <div>
      <label htmlFor={id} className="meta block">
        Etiquetas
      </label>
      {tags.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-x-4">
          {tags.map((t) => (
            <li key={t}>
              <button
                type="button"
                onClick={() => onTagsChange(tags.filter((x) => x !== t))}
                aria-label={`Quitar la etiqueta ${t}`}
                className="inline-flex min-h-11 items-center text-ui hover:line-through"
              >
                #{t}
                <span aria-hidden="true" className="ml-1 text-gris">
                  ×
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        id={id}
        value={input}
        onChange={(e) => {
          const v = e.target.value
          if (v.includes(',')) add(v)
          else onInputChange(v)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            if (input.trim()) add(input)
          }
        }}
        onBlur={() => input.trim() && add(input)}
        disabled={tags.length >= MAX_TAGS}
        placeholder="amor, nostalgia…"
        autoComplete="off"
        aria-invalid={!!error}
        aria-describedby={`${id}-ayuda`}
        className="campo"
      />
      <p id={`${id}-ayuda`} className="meta mt-2">
        {error ??
          (tags.length > RECOMMENDED
            ? 'Con unas pocas etiquetas el poema se encuentra mejor.'
            : 'Escribe y pulsa Enter o coma para añadir.')}
      </p>
      {shown.length > 0 && (
        <ul className="mt-1 flex flex-wrap gap-x-4" aria-label="Etiquetas sugeridas">
          {shown.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => add(s.normalizedName)}
                className="meta inline-flex min-h-11 items-center hover:text-tinta"
              >
                #{s.normalizedName}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
