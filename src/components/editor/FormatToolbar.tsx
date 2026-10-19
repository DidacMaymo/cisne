import type { MarkStyle } from '../../lib/poem-markup'

const buttons: { style: MarkStyle; label: string; shortcut: string; glyph: string; className: string }[] = [
  { style: 'bold', label: 'Negrita', shortcut: 'Ctrl+B', glyph: 'N', className: 'font-bold' },
  { style: 'italic', label: 'Cursiva', shortcut: 'Ctrl+I', glyph: 'C', className: 'italic' },
  { style: 'underline', label: 'Subrayado', shortcut: 'Ctrl+U', glyph: 'S', className: 'underline underline-offset-2' },
  { style: 'strike', label: 'Tachado', shortcut: 'Ctrl+Mayús+X', glyph: 'T', className: 'line-through' },
]

/** Barra mínima de formato sobre el texto del poema. */
export function FormatToolbar({ onMark }: { onMark: (style: MarkStyle) => void }) {
  return (
    <div role="toolbar" aria-label="Formato del texto" aria-controls="texto" className="flex gap-1 border-b border-linea">
      {buttons.map((b) => (
        <button
          key={b.style}
          type="button"
          // Que el clic no robe la selección del texto.
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onMark(b.style)}
          title={`${b.label} (${b.shortcut})`}
          aria-label={`${b.label} (${b.shortcut})`}
          className={`inline-flex size-11 items-center justify-center font-serif text-xl text-gris hover:text-tinta ${b.className}`}
        >
          {b.glyph}
        </button>
      ))}
    </div>
  )
}
