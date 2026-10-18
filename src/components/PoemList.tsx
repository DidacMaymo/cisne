import { useSavedIds } from '../hooks/useSavedIds'
import { useSession } from '../hooks/useSession'
import type { PoemView } from '../data'
import { PoemListItem } from './PoemListItem'

export function PoemList({ poems }: { poems: PoemView[] }) {
  const saved = useSavedIds()
  const { session } = useSession()
  return (
    <div className="mx-auto max-w-pagina">
      {poems.map((p) => (
        <PoemListItem key={p.id} poem={p} saved={saved.has(p.id)} signedIn={!!session} />
      ))}
    </div>
  )
}
