import { useState } from 'react'
import { Link } from 'react-router-dom'
import { dataMode, repos } from '../data'
import { AuthForm } from '../components/AuthForm'
import { EmptyState } from '../components/EmptyState'
import { signInSchema, toErrors } from '../data/schemas'

const emailOnly = signInSchema.pick({ email: true })

/** Recuperar contraseña: se envía un enlace a /nueva-contrasena. */
export function Recover() {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [problem, setProblem] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  if (dataMode === 'local') {
    return (
      <>
        <h1 className="sr-only">Recuperar contraseña</h1>
        <EmptyState title="Recuperar la contraseña">
          <p className="mx-auto max-w-[40ch] text-ui">
            En esta versión de prueba no se envían correos, así que aún no podemos recuperarla. Cuando CISNE esté
            conectado a su servidor, aquí recibirás un enlace en tu email.
          </p>
          <Link to="/entrar" className="enlace mt-4">
            Volver a entrar
          </Link>
        </EmptyState>
      </>
    )
  }

  if (sent) {
    return (
      <>
        <h1 className="sr-only">Revisa tu correo</h1>
        <EmptyState title="Revisa tu correo.">
          <p className="mx-auto max-w-[40ch] text-ui">
            Si hay una cuenta con <strong className="font-medium">{email}</strong>, te llegará un enlace para elegir
            una contraseña nueva. Mira también en la carpeta de spam.
          </p>
          <Link to="/entrar" className="enlace mt-4">
            Volver a entrar
          </Link>
        </EmptyState>
      </>
    )
  }

  async function submit() {
    setProblem('')
    const parsed = emailOnly.safeParse({ email })
    if (!parsed.success) return setErrors(toErrors(parsed.error))
    setErrors({})
    setBusy(true)
    try {
      await repos.auth.requestPasswordReset(parsed.data.email)
      setSent(true)
    } catch (e) {
      setProblem(e instanceof Error ? e.message : 'No se pudo enviar. Inténtalo de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthForm
      title="Recuperar"
      intro="Te enviaremos un enlace para elegir otra contraseña."
      fields={[{ name: 'email', label: 'Email', type: 'email', autoComplete: 'email' }]}
      values={{ email }}
      errors={errors}
      problem={problem}
      busy={busy}
      submitLabel="Enviar enlace"
      onChange={(_, v) => setEmail(v)}
      onSubmit={submit}
      footer={
        <Link to="/entrar" className="underline underline-offset-4">
          Volver a entrar
        </Link>
      }
    />
  )
}
