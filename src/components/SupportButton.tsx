import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { repos } from '../data'
import { useQuery } from '../hooks/useQuery'
import { useSession } from '../hooks/useSession'
import { signInHref } from '../lib/links'

type Props =
  | { kind: 'poem'; poemId: string; name: string }
  | { kind: 'author'; accountName: string; name: string }

const cls = 'meta inline-flex min-h-11 items-center hover:text-tinta'

function people(n: number, what: string): string {
  return `${n === 1 ? '1 persona apoya' : `${n} personas apoyan`} ${what}`
}

/**
 * «Apoyar»: un gesto de aprecio, no una competición. El número solo aparece
 * si su autor lo ha hecho público (Ajustes → Privacidad) o si eres tú.
 */
export function SupportButton(props: Props) {
  const { session } = useSession()
  const { pathname, search } = useLocation()
  const [busy, setBusy] = useState(false)
  const key = props.kind === 'poem' ? props.poemId : props.accountName
  const { data } = useQuery(
    () => (props.kind === 'poem' ? repos.supports.poem(props.poemId) : repos.supports.author(props.accountName)),
    [props.kind, key],
  )
  if (!data) return null

  const what = props.kind === 'poem' ? 'este poema' : `a ${props.name}`
  const count = data.count !== null && data.count > 0 ? <span className="meta">{people(data.count, what)}</span> : null

  // Lo propio no se apoya: como mucho, ves tu número.
  if (!data.canSupport) return count

  async function toggle() {
    setBusy(true)
    try {
      if (props.kind === 'poem') await repos.supports.togglePoem(props.poemId)
      else await repos.supports.toggleAuthor(props.accountName)
    } finally {
      setBusy(false)
    }
  }

  const label = props.kind === 'poem' ? 'Apoyar' : `Apoyar a ${props.name}`
  return (
    <span className="inline-flex flex-wrap items-center gap-x-3">
      {session ? (
        <button type="button" onClick={toggle} disabled={busy} aria-pressed={data.supported} className={cls}>
          {data.supported ? (props.kind === 'poem' ? '✓ Lo apoyas' : `✓ Apoyas a ${props.name}`) : label}
        </button>
      ) : (
        <Link to={signInHref(pathname + search)} className={cls} title="Entra para apoyar">
          {label}
        </Link>
      )}
      {count}
    </span>
  )
}
