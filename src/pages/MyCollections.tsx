import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { repos } from '../data'
import { CollectionCard } from '../components/CollectionCard'
import { CollectionForm } from '../components/CollectionForm'
import { EmptyState } from '../components/EmptyState'
import { LoadState } from '../components/LoadState'
import { SwanDivider } from '../components/brand/SwanDivider'
import { useQuery } from '../hooks/useQuery'

/** Mis colecciones: poemarios propios y antologías de poemas que me acompañan. */
export function MyCollections() {
  const navigate = useNavigate()
  const { data, error, loading } = useQuery(() => repos.collections.listMine(), [])
  const [creating, setCreating] = useState(false)

  const form = (
    <div className="mx-auto mt-10 max-w-xl">
      <CollectionForm
        submitLabel="Crear colección"
        onCancel={() => setCreating(false)}
        onSubmit={async (v) => {
          const c = await repos.collections.create(v)
          navigate(`/coleccion/${c.id}`, { state: { flash: 'Colección creada.' } })
        }}
      />
    </div>
  )

  return (
    <div className="mx-auto max-w-pagina">
      <header className="py-4 text-center">
        <h1 className="font-serif text-5xl">Mis colecciones</h1>
        <p className="mx-auto mt-3 max-w-[44ch] font-serif text-xl italic text-gris">
          Reúne tus poemas en poemarios, o guarda juntos los de otros que te acompañan.
        </p>
        <SwanDivider className="mx-auto mt-8 h-6 w-48 text-gris" />
      </header>

      <LoadState loading={loading} error={error} />

      {data && data.length === 0 && !creating && (
        <EmptyState title="Aún no tienes colecciones.">
          <button type="button" className="btn" onClick={() => setCreating(true)}>
            Crear mi primera colección
          </button>
        </EmptyState>
      )}

      {creating && form}

      {data && data.length > 0 && (
        <>
          {!creating && (
            <p className="text-center">
              <button type="button" className="btn" onClick={() => setCreating(true)}>
                Nueva colección
              </button>
            </p>
          )}
          <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
            {data.map((c) => (
              <li key={c.id}>
                <CollectionCard collection={c} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
