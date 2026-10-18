import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { repos } from '../data'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { LoadState } from '../components/LoadState'
import { SettingsNav } from '../components/SettingsNav'
import { useQuery } from '../hooks/useQuery'
import { formatDate } from '../lib/format'

export function AccountSettings() {
  const navigate = useNavigate()
  const { data, error, loading } = useQuery(() => repos.auth.account(), [])
  const [confirm, setConfirm] = useState(false)
  const [busy, setBusy] = useState(false)

  async function signOut() {
    await repos.auth.signOut()
    navigate('/')
  }

  async function remove() {
    setBusy(true)
    try {
      await repos.auth.deleteAccount()
      navigate('/', { replace: true })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-8 text-center font-serif text-5xl">Ajustes</h1>
      <SettingsNav />
      <LoadState loading={loading} error={error} />
      {data && (
        <>
          <dl className="grid gap-6">
            <div>
              <dt className="meta">Email (privado)</dt>
              <dd className="mt-1 text-ui">{data.email}</dd>
            </div>
            <div>
              <dt className="meta">Dirección de tu página de autor</dt>
              <dd className="mt-1 text-ui">/autor/{data.accountName}</dd>
            </div>
            <div>
              <dt className="meta">Cuenta creada</dt>
              <dd className="mt-1 text-ui">{formatDate(data.createdAt)}</dd>
            </div>
          </dl>

          <div className="mt-12 flex flex-wrap justify-center gap-3 border-t border-linea pt-10">
            <Link to="/nueva-contrasena" className="btn">
              Cambiar contraseña
            </Link>
            <button type="button" className="btn" onClick={signOut}>
              Cerrar sesión
            </button>
            <button type="button" className="btn" onClick={() => setConfirm(true)}>
              Eliminar mi cuenta
            </button>
          </div>
        </>
      )}
      <ConfirmDialog
        open={confirm}
        title="¿Eliminar tu cuenta?"
        confirmLabel="Eliminar para siempre"
        busy={busy}
        onConfirm={remove}
        onCancel={() => setConfirm(false)}
      >
        Se borrarán tu perfil, todos tus poemas (también los anónimos), tus borradores, tus colecciones y tu
        biblioteca. No se puede deshacer.
      </ConfirmDialog>
    </div>
  )
}
