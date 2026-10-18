import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { repos } from '../data'
import { AuthForm } from '../components/AuthForm'
import { signInSchema, signUpSchema, toErrors } from '../data/schemas'
import { useSession } from '../hooks/useSession'
import { safeReturn } from '../lib/links'

type Mode = 'entrar' | 'registro'

const fields = {
  entrar: [
    { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
    { name: 'password', label: 'Contraseña', type: 'password', autoComplete: 'current-password' },
  ],
  registro: [
    {
      name: 'displayName',
      label: 'Nombre público',
      type: 'text',
      autoComplete: 'nickname',
      hint: 'Puede ser tu nombre o un pseudónimo. Es lo que verán los demás; podrás cambiarlo.',
    },
    { name: 'email', label: 'Email', type: 'email', autoComplete: 'email', hint: 'Privado. Nunca se muestra.' },
    {
      name: 'password',
      label: 'Contraseña',
      type: 'password',
      autoComplete: 'new-password',
      hint: 'Al menos 8 caracteres.',
    },
  ],
} as const

/** /entrar y /registro. Tras entrar, se vuelve a donde se estaba (`?volver=`). */
export function SignIn({ mode }: { mode: Mode }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const volver = safeReturn(params.get('volver'))
  const { session } = useSession()
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [problem, setProblem] = useState('')
  const [busy, setBusy] = useState(false)

  if (session && !busy) return <Navigate to={volver} replace />

  async function submit() {
    setProblem('')
    const parsed = (mode === 'entrar' ? signInSchema : signUpSchema).safeParse(values)
    if (!parsed.success) return setErrors(toErrors(parsed.error))
    setErrors({})
    setBusy(true)
    try {
      if (mode === 'entrar') await repos.auth.signIn(parsed.data as { email: string; password: string })
      else await repos.auth.signUp(parsed.data as { displayName: string; email: string; password: string })
      navigate(volver, { replace: true })
    } catch (e) {
      setProblem(e instanceof Error ? e.message : 'No se pudo completar. Inténtalo de nuevo.')
      setBusy(false)
    }
  }

  const keep = params.get('volver') ? `?volver=${encodeURIComponent(volver)}` : ''

  return (
    <AuthForm
      title={mode === 'entrar' ? 'Entrar' : 'Crear cuenta'}
      intro={mode === 'entrar' ? 'Tus poemas te esperan.' : 'Para publicar, guardar y crear colecciones.'}
      fields={[...fields[mode]]}
      values={values}
      errors={errors}
      problem={problem}
      busy={busy}
      submitLabel={mode === 'entrar' ? 'Entrar' : 'Crear cuenta'}
      onChange={(name, value) => setValues((v) => ({ ...v, [name]: value }))}
      onSubmit={submit}
      footer={
        mode === 'entrar' ? (
          <>
            <p>
              ¿Aún no tienes cuenta?{' '}
              <Link to={`/registro${keep}`} className="underline underline-offset-4">
                Crear cuenta
              </Link>
            </p>
            <p className="mt-2">
              <Link to="/recuperar" className="meta underline underline-offset-4 hover:text-tinta">
                He olvidado mi contraseña
              </Link>
            </p>
          </>
        ) : (
          <p>
            ¿Ya tienes cuenta?{' '}
            <Link to={`/entrar${keep}`} className="underline underline-offset-4">
              Entrar
            </Link>
          </p>
        )
      }
    />
  )
}
