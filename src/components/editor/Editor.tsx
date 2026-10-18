import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { repos } from '../../data'
import type { Collection, Poem, Profile, Tag } from '../../data'
import { normalizeTag } from '../../data/normalize'
import {
  draftSchema,
  publishSchema,
  toFieldErrors,
  type FieldErrors,
  type PoemFormValues,
} from '../../data/schemas'
import { FeatherDivider } from '../brand/FeatherDivider'
import { ConfirmDialog } from '../ConfirmDialog'
import { PoemReader } from '../PoemReader'
import { IdentityField } from './IdentityField'
import { TagsField } from './TagsField'

type FormState = PoemFormValues & { tagInput: string }

type Props = {
  poem: Poem | null
  profile: Profile
  collections: Collection[]
  tagSuggestions: Tag[]
  pseudonyms: string[]
  signedIn: boolean
}

function baseForm(poem: Poem | null, profile: Profile): FormState {
  return {
    title: poem?.title ?? '',
    content: poem?.content ?? '',
    tags: poem?.tags.map((t) => t.normalizedName) ?? [],
    tagInput: '',
    collection: poem?.collectionId ?? '',
    newCollectionTitle: '',
    visibility: poem?.visibility ?? 'public',
    identity: poem?.publicationIdentity ?? 'profile_name',
    pseudonym: poem?.displayedPseudonym ?? profile.primaryPseudonym ?? '',
    displayName: profile.displayName,
  }
}

/** Texto en curso guardado en el navegador por si se cierra la pestaña o falla el guardado. */
function readAutosave(key: string, poem: Poem | null): Partial<FormState> | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { savedAt, form } = JSON.parse(raw) as { savedAt: number; form: Partial<FormState> }
    if (poem && savedAt < Date.parse(poem.updatedAt)) return null
    // El nombre público viene siempre del perfil (puede haber cambiado al crear la cuenta).
    const { displayName: _displayName, ...rest } = form
    void _displayName
    return rest
  } catch {
    return null
  }
}

function clearAutosave(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    // sin almacenamiento: nada que limpiar
  }
}

export function Editor({ poem, profile, collections, tagSuggestions, pseudonyms, signedIn }: Props) {
  const navigate = useNavigate()
  const location = useLocation()
  const storageKey = `cisne:escritura:${poem?.id ?? 'nuevo'}`

  const [boot] = useState(() => {
    const base = baseForm(poem, profile)
    const saved = readAutosave(storageKey, poem)
    const form = saved ? { ...base, ...saved } : base
    return {
      baseJson: JSON.stringify(base),
      form,
      recovered: !!saved && JSON.stringify(form) !== JSON.stringify(base),
    }
  })

  const [form, setForm] = useState<FormState>(boot.form)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState(
    () => (location.state as { flash?: string } | null)?.flash ?? (boot.recovered ? 'Recuperamos lo que estabas escribiendo.' : ''),
  )
  const [problem, setProblem] = useState('')
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [needAccount, setNeedAccount] = useState(false)

  const isPublished = poem?.status === 'published'
  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }))

  // Autosave con un pequeño retraso, solo si hay cambios respecto al original.
  useEffect(() => {
    if (JSON.stringify(form) === boot.baseJson) return
    const t = window.setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ savedAt: Date.now(), form }))
      } catch {
        // si no se puede, el texto sigue en pantalla
      }
    }, 300)
    return () => window.clearTimeout(t)
  }, [form, boot.baseJson, storageKey])

  async function submit(kind: 'draft' | 'publish' | 'update') {
    setStatus('')
    setProblem('')

    // La etiqueta a medio escribir también cuenta.
    const pending = normalizeTag(form.tagInput)
    const tags = pending && !form.tags.includes(pending) ? [...form.tags, pending] : form.tags
    const values = { ...form, tags }

    const parsed = (kind === 'draft' || !signedIn ? draftSchema : publishSchema).safeParse(values)
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error))
      setProblem('Revisa los campos señalados; tu texto sigue aquí.')
      return
    }
    setErrors({})
    // Se puede escribir sin cuenta, pero guardar y publicar necesitan una:
    // así cada poema tiene alguien que pueda editarlo o borrarlo, aunque firme como Anónimo.
    if (!signedIn) {
      setNeedAccount(true)
      return
    }
    setBusy(true)
    try {
      const v = parsed.data
      let collectionId = v.collection || undefined
      if (v.collection === 'new') {
        collectionId = (await repos.collections.create({ title: v.newCollectionTitle, visibility: 'private' })).id
        // Si el guardado falla, un reintento no debe crear la colección dos veces.
        set({ collection: collectionId, newCollectionTitle: '' })
      }

      if (v.identity === 'profile_name' && v.displayName !== profile.displayName) {
        await repos.profiles.updateMine({ displayName: v.displayName })
      }
      if (v.identity === 'pseudonym' && !profile.primaryPseudonym) {
        await repos.profiles.updateMine({ primaryPseudonym: v.pseudonym })
      }

      const saved = await repos.poems.save({
        id: poem?.id,
        title: v.title || undefined,
        content: values.content,
        status: kind === 'draft' ? 'draft' : 'published',
        visibility: v.visibility,
        publicationIdentity: v.identity,
        displayedPseudonym: v.identity === 'pseudonym' ? v.pseudonym : undefined,
        tags: v.tags,
        collectionId,
      })
      // Si cambió de colección en el editor, sale de la anterior.
      if (poem?.collectionId && poem.collectionId !== collectionId) {
        await repos.collections.removePoem(poem.collectionId, saved.id)
      }

      clearAutosave(storageKey)
      if (kind === 'draft') {
        if (poem) {
          setForm((f) => ({ ...f, tags, tagInput: '', collection: collectionId ?? '', newCollectionTitle: '' }))
          setStatus('Borrador guardado.')
        } else {
          navigate(`/escribir/${saved.id}`, { replace: true, state: { flash: 'Borrador guardado.' } })
        }
      } else {
        navigate(`/poema/${saved.id}`, {
          state: { flash: kind === 'publish' ? 'Poema publicado.' : 'Cambios guardados.' },
        })
      }
    } catch (e) {
      setProblem(
        e instanceof Error && e.message
          ? e.message
          : 'No se pudo guardar. Tu texto sigue aquí; inténtalo de nuevo en unos segundos.',
      )
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!poem) return
    setBusy(true)
    try {
      await repos.poems.remove(poem.id)
      clearAutosave(storageKey)
      navigate('/mis/poemas', { replace: true, state: { flash: 'Poema eliminado.' } })
    } catch (e) {
      setConfirmDelete(false)
      setProblem(e instanceof Error ? e.message : 'No se pudo eliminar el poema.')
    } finally {
      setBusy(false)
    }
  }

  const previewName =
    form.identity === 'anonymous'
      ? 'Anónimo'
      : form.identity === 'pseudonym'
        ? form.pseudonym.trim() || 'Tu pseudónimo'
        : form.displayName.trim() || 'Tu nombre público'

  return (
    <form onSubmit={(e) => e.preventDefault()} noValidate className="mx-auto max-w-pagina">
      <h1 className="sr-only">{poem ? 'Editar poema' : 'Escribir un poema'}</h1>
      {!signedIn && !needAccount && (
        <p className="meta mb-10 text-center">
          Puedes escribir sin cuenta: lo guardamos en este navegador. Para publicarlo necesitarás{' '}
          <Link to={`/registro?volver=${encodeURIComponent(location.pathname)}`} className="underline underline-offset-4 hover:text-tinta">
            crear una cuenta
          </Link>
          .
        </p>
      )}

      {preview ? (
        <>
          <p className="meta mb-10 text-center">Así se verá tu poema.</p>
          <PoemReader
            title={form.title.trim() || null}
            content={form.content}
            authorName={previewName}
            tags={form.tags.map((name) => ({ name }))}
            linkTags={false}
          />
        </>
      ) : (
        <>
          <div>
            <label htmlFor="titulo" className="sr-only">
              Título del poema (opcional)
            </label>
            <input
              id="titulo"
              value={form.title}
              onChange={(e) => set({ title: e.target.value })}
              placeholder="Título (opcional)"
              autoComplete="off"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'titulo-error' : undefined}
              className="campo font-serif text-4xl"
            />
            {errors.title && (
              <p id="titulo-error" className="meta mt-2 text-tinta">
                {errors.title}
              </p>
            )}
          </div>

          <div className="mt-6">
            <label htmlFor="texto" className="sr-only">
              Texto del poema
            </label>
            <textarea
              id="texto"
              value={form.content}
              onChange={(e) => set({ content: e.target.value })}
              placeholder="Escribe aquí tu poema…"
              rows={12}
              aria-invalid={!!errors.content}
              aria-describedby={errors.content ? 'texto-error' : undefined}
              className="campo field-sizing-content min-h-[50dvh] resize-none whitespace-pre-wrap font-serif text-poema"
            />
            {errors.content && (
              <p id="texto-error" className="meta mt-2 text-tinta">
                {errors.content}
              </p>
            )}
          </div>

          <FeatherDivider className="mx-auto mt-14 h-4 w-48 text-gris" />

          <div className="mx-auto mt-10 grid max-w-xl gap-10">
            <TagsField
              tags={form.tags}
              input={form.tagInput}
              suggestions={tagSuggestions}
              error={errors.tags}
              onTagsChange={(tags) => set({ tags })}
              onInputChange={(tagInput) => set({ tagInput })}
            />

            <div>
              <label htmlFor="coleccion" className="meta block">
                Colección
              </label>
              <select
                id="coleccion"
                value={form.collection}
                onChange={(e) => set({ collection: e.target.value })}
                className="campo min-h-11"
              >
                <option value="">Ninguna</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
                <option value="new">Nueva colección…</option>
              </select>
              {form.collection === 'new' && (
                <div className="mt-3">
                  <label htmlFor="coleccion-nueva" className="meta block">
                    Título de la colección
                  </label>
                  <input
                    id="coleccion-nueva"
                    value={form.newCollectionTitle}
                    onChange={(e) => set({ newCollectionTitle: e.target.value })}
                    maxLength={80}
                    aria-invalid={!!errors.newCollectionTitle}
                    aria-describedby={errors.newCollectionTitle ? 'coleccion-error' : undefined}
                    className="campo"
                  />
                  {errors.newCollectionTitle && (
                    <p id="coleccion-error" className="meta mt-2 text-tinta">
                      {errors.newCollectionTitle}
                    </p>
                  )}
                </div>
              )}
            </div>

            <fieldset>
              <legend className="meta">Visibilidad</legend>
              {(
                [
                  ['public', 'Pública', 'aparece en Explorar y en tu página de autor'],
                  ['private', 'Privada', 'solo tú puedes leerla'],
                ] as const
              ).map(([value, label, hint]) => (
                <label key={value} className="flex min-h-11 items-center gap-3">
                  <input
                    type="radio"
                    name="visibilidad"
                    value={value}
                    checked={form.visibility === value}
                    onChange={() => set({ visibility: value })}
                    className="size-4 accent-tinta"
                  />
                  <span>
                    {label} <span className="meta">— {hint}</span>
                  </span>
                </label>
              ))}
            </fieldset>

            <IdentityField
              identity={form.identity}
              displayName={form.displayName}
              pseudonym={form.pseudonym}
              pseudonyms={pseudonyms}
              errors={errors}
              signedIn={signedIn}
              onChange={(patch) => set(patch)}
            />
          </div>
        </>
      )}

      <FeatherDivider className="mx-auto mt-14 h-4 w-48 text-gris" />

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {preview && (
          <button type="button" className="btn" onClick={() => setPreview(false)}>
            Seguir editando
          </button>
        )}
        {!isPublished && (
          <button type="button" className="btn" disabled={busy} onClick={() => submit('draft')}>
            Guardar borrador
          </button>
        )}
        {!preview && (
          <button
            type="button"
            className="btn"
            onClick={() => {
              if (form.content.trim()) {
                setErrors({})
                setProblem('')
                setPreview(true)
              } else {
                setErrors({ content: 'Escribe el poema para poder verlo.' })
              }
            }}
          >
            Vista previa
          </button>
        )}
        <button
          type="button"
          className="btn btn-primario"
          disabled={busy}
          onClick={() => submit(isPublished ? 'update' : 'publish')}
        >
          {busy ? 'Guardando…' : isPublished ? 'Guardar cambios' : 'Publicar poema'}
        </button>
      </div>

      {needAccount && !signedIn && (
        <div role="alert" className="mx-auto mt-8 max-w-md border-y border-linea py-6 text-center">
          <p className="font-serif text-2xl italic">Para publicar, entra en tu cuenta.</p>
          <p className="mt-2 text-ui">
            Tu poema no se pierde: sigue guardado en este navegador y lo encontrarás aquí al volver. La cuenta
            hace falta incluso para publicar como Anónimo, para que solo tú puedas editarlo o borrarlo.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link to={`/registro?volver=${encodeURIComponent(location.pathname)}`} className="btn btn-primario">
              Crear cuenta
            </Link>
            <Link to={`/entrar?volver=${encodeURIComponent(location.pathname)}`} className="btn">
              Entrar
            </Link>
          </div>
        </div>
      )}

      <div className="mt-4 min-h-12 text-center">
        {problem && (
          <p role="alert" className="text-ui">
            {problem}
          </p>
        )}
        <p role="status" className="meta">
          {status}
        </p>
      </div>

      {poem && (
        <p className="mt-6 text-center">
          <button type="button" className="meta inline-flex min-h-11 items-center hover:text-tinta" onClick={() => setConfirmDelete(true)}>
            Eliminar poema
          </button>
        </p>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="¿Eliminar este poema?"
        confirmLabel="Eliminar"
        busy={busy}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      >
        Se borrará para siempre, también de tu biblioteca y de sus colecciones. No se puede deshacer.
      </ConfirmDialog>
    </form>
  )
}
