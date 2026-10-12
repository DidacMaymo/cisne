import { useSavedIds } from '../hooks/useSavedIds'
import type { PoemView } from '../data'
import { PoemListItem } from './PoemListItem'

export function PoemList({ poems }: { poems: PoemView[] }) {
  const saved = useSavedIds()
  return (
    <div className="mx-auto max-w-pagina">
      {poems.map((p) => (
        <PoemListItem key={p.id} poem={p} saved={saved.has(p.id)} />
      ))}
    </div>
  )
}
