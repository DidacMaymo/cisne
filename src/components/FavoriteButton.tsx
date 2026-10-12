import { useState } from 'react'
import { repos } from '../data'

type Props = { poemId: string; saved: boolean }

export function FavoriteButton({ poemId, saved }: Props) {
  const [busy, setBusy] = useState(false)

  async function toggle() {
    setBusy(true)
    try {
      await repos.favorites.toggle(poemId)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
      className="meta inline-flex min-h-11 items-center hover:text-tinta"
    >
      {saved ? '✓ Guardado en tu biblioteca' : 'Guardar'}
    </button>
  )
}
