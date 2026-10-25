import { lazy, Suspense } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { useSession } from '../hooks/useSession'
import { repos } from '../data'
import { CollectionCard } from '../components/CollectionCard'
import { EmptyState } from '../components/EmptyState'
import { LoadState } from '../components/LoadState'
import { PoemList } from '../components/PoemList'
import { SupportButton } from '../components/SupportButton'
import { SwanDivider } from '../components/brand/SwanDivider'
import { useQuery } from '../hooks/useQuery'
import { linkLabel } from '../lib/links'

const MyCollections = lazy(() => import('./MyCollections').then((m) => ({ default: m.MyCollections })))
const MyLibrary = lazy(() => import('./MyLibrary').then((m) => ({ default: m.MyLibrary })))
const MyPoems = lazy(() => import('./MyPoems').then((m) => ({ default: m.MyPoems })))

const tabs = [
  { id: 'publicados', label: 'Publicados' },
  { id: 'borradores', label: 'Borradores' },
  { id: 'colecciones', label: 'Colecciones' },
  { id: 'biblioteca', label: 'Biblioteca' },
] as const
type Tab = (typeof tabs)[number]['id']

/** Página de autor: solo palabras. Nombre, unas líneas, sus enlaces y lo que escribe. */
export function AuthorPage() {
  const { accountName = '' } = useParams()
  const [params] = useSearchParams()
  const { session, loading: sessionLoading } = useSession()
  const flash = (useLocation().state as { flash?: string } | null)?.flash
  const ver = params.get('ver')
  // Solo su dueño ve las pestañas; `?ver=publica` es la vista pública, como la ven los demás.
  const isOwnerView = !!session && session.accountName === accountName && ver !== 'publica'
  const tab: Tab = tabs.find((t) => t.id === ver)?.id ?? 'publicados'
  const { data, error, loading } = useQuery(async () => {
    const profile = await repos.profiles.getPublicByAccountName(accountName)
    if (!profile) return { profile, poems: [], collections: [] }
    const [poems, collections] = await Promise.all([
      repos.poems.listPublic({ authorAccountName: accountName }),
      repos.collections.listPublicByOwner(accountName),
    ])
    return { profile, poems, collections }
  }, [accountName])

  if (loading || error || sessionLoading) return <LoadState loading={loading || sessionLoading} error={error} />
  if (!data?.profile) {
    return (
      <>
        <h1 className="sr-only">Autor no encontrado</h1>
        <EmptyState title="No encontramos a este autor.">
          <Link to="/explorar" className="enlace">
            Seguir explorando
          </Link>
        </EmptyState>
      </>
    )
  }

  const { profile, poems, collections } = data
  const links = profile.links ?? []
  return (
    <>
      <header className="mx-auto max-w-pagina py-4 text-center">
        <h1 className="text-balance font-serif text-5xl md:text-6xl">{profile.displayName}</h1>
        {profile.bio && (
          <p className="mx-auto mt-5 max-w-[48ch] whitespace-pre-line text-pretty font-serif text-xl italic leading-relaxed">
            {profile.bio}
          </p>
        )}
        {links.length > 0 && (
          <ul aria-label="Enlaces" className="mt-4 flex flex-wrap justify-center gap-x-6">
            {links.map((url) => (
              <li key={url}>
                <a
                  href={url}
                  target="_blank"
                  rel="me noopener noreferrer"
                  className="meta inline-flex min-h-11 items-center underline-offset-4 hover:text-tinta hover:underline"
                >
                  {linkLabel(url)}
                  <span className="sr-only"> (se abre en otra pestaña)</span>
                </a>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-2 flex justify-center">
          <SupportButton kind="author" accountName={profile.accountName} name={profile.displayName} />
        </div>
        {isOwnerView && (
          <p className="mt-2 flex flex-wrap justify-center gap-x-6">
            <Link
              to="?ver=publica"
              className="meta inline-flex min-h-11 items-center underline-offset-4 hover:text-tinta hover:underline"
            >
              Ver como lo ven los demás
            </Link>
            <Link
              to="/ajustes/perfil"
              className="meta inline-flex min-h-11 items-center underline-offset-4 hover:text-tinta hover:underline"
            >
              Ajustes
            </Link>
          </p>
        )}
        <SwanDivider className="mx-auto mt-8 h-6 w-48 text-gris" />
      </header>

      {isOwnerView && (
        <>
          {flash && (
            <p role="status" className="meta mb-6 text-center">
              {flash}
            </p>
          )}
          <nav aria-label="Tu página" className="mb-8 flex flex-wrap justify-center gap-x-3 sm:gap-x-8">
            {tabs.map((t) => (
              <Link
                key={t.id}
                to={`?ver=${t.id}`}
                aria-current={t.id === tab ? 'page' : undefined}
                className={`inline-flex min-h-11 items-center border-b text-meta sm:text-ui hover:text-tinta ${
                  t.id === tab ? 'border-tinta text-tinta' : 'border-transparent text-gris'
                }`}
              >
                {t.label}
              </Link>
            ))}
          </nav>
          <div className="mx-auto max-w-pagina">
            <Suspense fallback={<LoadState loading />}>
              {tab === 'publicados' && <MyPoems status="published" />}
              {tab === 'borradores' && <MyPoems status="draft" />}
              {tab === 'colecciones' && <MyCollections />}
              {tab === 'biblioteca' && <MyLibrary />}
            </Suspense>
          </div>
        </>
      )}

      {!isOwnerView && !!session && session.accountName === accountName && (
        <p className="mb-6 text-center">
          <Link to="?ver=publicados" className="enlace">
            Volver a mi página
          </Link>
        </p>
      )}

      {!isOwnerView && collections.length > 0 && (
        <section aria-labelledby="colecciones" className="mx-auto mt-6 max-w-pagina">
          <h2 id="colecciones" className="meta text-center">
            Colecciones
          </h2>
          <ul className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3">
            {collections.map((c) => (
              <li key={c.id}>
                <CollectionCard collection={c} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {!isOwnerView && (
        <section aria-labelledby="poemas" className="mt-14">
          <h2 id="poemas" className="meta mb-6 text-center">
            Poemas
          </h2>
          {poems.length === 0 ? (
            <EmptyState title="Todavía no hay poemas publicados." />
          ) : (
            <PoemList poems={poems} />
          )}
        </section>
      )}
    </>
  )
}
