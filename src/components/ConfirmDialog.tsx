import { useEffect, useRef, type ReactNode } from 'react'

type Props = {
  open: boolean
  title: string
  children: ReactNode
  confirmLabel: string
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Diálogo de confirmación sobre <dialog> nativo: foco atrapado y Escape gratis. */
export function ConfirmDialog({ open, title, children, confirmLabel, busy, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      onClose={() => open && onCancel()}
      className="m-auto w-[calc(100%-3rem)] max-w-md border border-tinta bg-blanco p-8 text-tinta backdrop:bg-tinta/30"
    >
      <h2 id="confirm-title" className="font-serif text-3xl">
        {title}
      </h2>
      <div className="mt-4 text-ui">{children}</div>
      <div className="mt-8 flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onCancel} className="btn" autoFocus>
          Cancelar
        </button>
        <button type="button" onClick={onConfirm} disabled={busy} className="btn btn-primario">
          {busy ? 'Un momento…' : confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
