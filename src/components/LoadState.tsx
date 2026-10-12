type Props = { loading: boolean; error?: Error }

/** Estado de carga o error, con el mismo tono sobrio del resto. */
export function LoadState({ loading, error }: Props) {
  if (error) {
    return (
      <p role="alert" className="py-16 text-center font-serif text-xl italic">
        No pudimos cargar esto. Recarga la página para intentarlo de nuevo.
      </p>
    )
  }
  if (loading) {
    return (
      <p role="status" className="meta py-16 text-center">
        Cargando…
      </p>
    )
  }
  return null
}
