import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { repos } from '../data'
import { AuthForm } from '../components/AuthForm'
import { EmptyState } from '../components/EmptyState'
import { LoadState } from '../components/LoadState'
import { signUpSchema, toErrors } from '../data/schemas'
import { useSession } from '../hooks/useSession'

const passwordOnly = signUpSchema.pick({ password: true })

/** Destino del enlace de recuperación: con esa sesión temporal se elige otra contraseña. */
export function NewPassword() {
  const navigate = useNavigate()
  const { session, loading } = useSession()
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [problem, setProblem] = useState('')
  const [busy, setBusy] = useState(false)

  if (loading) return <LoadState loading />
  if (!session) {
    return (
      <>
        <h1 className="sr-only">Enlace no válido</h1>
        <EmptyState title="Este enlace ya no sirve.">
          <p className="mx-auto max-w-[40ch] text-ui">Puede que haya caducado o que ya lo usaras. Pide otro.</p>
          <Link to="/recuperar" className="enlace mt-4">
            Pedir un enlace nuevo
          </Link>
        </EmptyState>
      </>
    )
  }

  async function submit() {
    setProblem('')
    const parsed = passwordOnly.safeParse({ password })
    if (!parsed.success) return setErrors(toErrors(parsed.error))
    setErrors({})
    setBusy(true)
    try {
      await repos.auth.updatePassword(parsed.data.password)
      navigate('/', { replace: true })
    } catch (e) {
      setProblem(e instanceof Error ? e.message : 'No se pudo cambiar. Inténtalo de nuevo.')
      setBusy(false)
    }
  }

  return (
    <AuthForm
      title="Nueva contraseña"
      fields={[
        {
          name: 'password',
          label: 'Contraseña nueva',
          type: 'password',
          autoComplete: 'new-password',
          hint: 'Al menos 8 caracteres.',
        },
      ]}
      values={{ password }}
      errors={errors}
      problem={problem}
      busy={busy}
      submitLabel="Guardar contraseña"
      onChange={(_, v) => setPassword(v)}
      onSubmit={submit}
    />
  )
}
