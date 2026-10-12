import { Link } from 'react-router-dom'
import { SwanMark } from '../brand/SwanMark'

export function Logo() {
  return (
    <Link to="/" className="inline-flex min-h-11 items-center gap-3" aria-label="CISNE, inicio">
      <SwanMark className="h-8 w-auto" />
      <span className="font-serif text-2xl font-medium tracking-[0.28em]">CISNE</span>
    </Link>
  )
}
