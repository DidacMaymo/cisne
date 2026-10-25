import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { repos } from '../data'
import { CollectionCard } from '../components/CollectionCard'
import { CollectionForm } from '../components/CollectionForm'
import { EmptyState } from '../components/EmptyState'
import { LoadState } from '../components/LoadState'
import { useQuery } from '../hooks/useQuery'

/** Mis colecciones (públicas y privadas), dentro de «Mi página». */
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
    <div>
      <p className="mx-auto max-w-[44ch] text-center font-serif text-xl italic text-gris">
        Reúne tus poemas en poemarios, o guarda juntos los de otros.
      </p>

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
            <p className="mt-6 text-center">
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
