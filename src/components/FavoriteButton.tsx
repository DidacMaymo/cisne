import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { repos } from '../data'
import { signInHref } from '../lib/links'

type Props = { poemId: string; saved: boolean; signedIn: boolean }

const cls = 'meta inline-flex min-h-11 items-center hover:text-tinta'

export function FavoriteButton({ poemId, saved, signedIn }: Props) {
  const [busy, setBusy] = useState(false)
  const { pathname, search } = useLocation()

  if (!signedIn) {
    return (
      <Link to={signInHref(pathname + search)} className={cls} title="Entra para guardar poemas en tu biblioteca">
        Guardar
      </Link>
    )
  }

  async function toggle() {
    setBusy(true)
    try {
      await repos.favorites.toggle(poemId)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button type="button" onClick={toggle} disabled={busy} aria-pressed={saved} className={cls}>
      {saved ? '✓ En tu biblioteca' : 'Guardar'}
    </button>
  )
}
