import { useState } from 'react'

type Props = { title?: string }

/** Comparte el enlace con el menú del sistema o, si no existe, lo copia. */
export function ShareButton({ title }: Props) {
  const [message, setMessage] = useState('')

  async function share() {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: title || 'Un poema en CISNE', url })
        return
      }
      await navigator.clipboard.writeText(url)
      setMessage('Enlace copiado.')
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return
      setMessage('No pudimos copiar el enlace. Cópialo desde la barra de direcciones.')
    }
    window.setTimeout(() => setMessage(''), 3500)
  }

  return (
    <span className="inline-flex items-center gap-3">
      <button type="button" onClick={share} className="meta inline-flex min-h-11 items-center hover:text-tinta">
        Compartir
      </button>
      <span role="status" className="meta text-tinta">
        {message}
      </span>
    </span>
  )
}
