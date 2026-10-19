import { useId } from 'react'
import type { PoemFont } from '../../data'
import { poemFonts } from '../../lib/poem-fonts'

/** Tipografía del poema: cada opción se muestra en su propia letra. */
export function FontField({ value, onChange }: { value: PoemFont; onChange: (font: PoemFont) => void }) {
  const id = useId()
  return (
    <fieldset>
      <legend className="meta">Tipografía</legend>
      {poemFonts.map((f) => (
        <label key={f.id} className="flex min-h-11 items-center gap-3">
          <input
            type="radio"
            name={`${id}-fuente`}
            checked={value === f.id}
            onChange={() => onChange(f.id)}
            className="size-4 shrink-0 accent-tinta"
          />
          <span className={`poema ${f.className} !leading-tight`}>{f.label}</span>
          <span className="meta">{f.hint}</span>
        </label>
      ))}
    </fieldset>
  )
}
