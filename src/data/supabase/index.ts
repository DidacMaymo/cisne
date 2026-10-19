// Implementación de los repositorios sobre Supabase. La seguridad real vive en
// las políticas RLS de la base de datos (supabase/migrations); aquí solo se
// traducen filas a los tipos del dominio.
import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { shuffleDiverse } from '../discover'
import { emitDataChange } from '../events'
import { isPoemFont } from '../../lib/poem-fonts'
import { normalizePoemText, normalizeTag } from '../normalize'
import type { Repositories } from '../repositories'
import type { Collection, CollectionView, Poem, PoemFont, PoemView, Profile, SupportState, Tag } from '../types'

// ───────────────────────────── Filas que llegan de la base de datos

const tagSchema = z.object({ id: z.string(), name: z.string(), normalizedName: z.string() })

/** Fila de la vista pública: nunca trae author_id. Se valida porque viene de fuera. */
const publicPoemSchema = z.object({
  id: z.string(),
  title: z.string().nullable(),
  content: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  published_at: z.string().nullable(),
  author_name: z.string(),
  author_account_name: z.string().nullable(),
  tags: z.array(tagSchema),
  collection: z.object({ id: z.string(), title: z.string() }).nullable(),
  font: z.string().transform((f): PoemFont => (isPoemFont(f) ? f : 'clasica')),
  sensitive: z.boolean(),
})

const supportStateSchema = z.object({
  supported: z.boolean(),
  count: z.number().nullable(),
  canSupport: z.boolean(),
})

const PUBLIC_COLS =
  'id, title, content, created_at, updated_at, published_at, author_name, author_account_name, tags, collection, font, sensitive'

type TagRow = { id: string; name: string; normalized_name: string }

type OwnPoemRow = {
  id: string
  author_id: string
  title: string | null
  content: string
  status: Poem['status']
  visibility: Poem['visibility']
  publication_identity: Poem['publicationIdentity']
  displayed_pseudonym: string | null
  font: PoemFont
  sensitive: boolean
  created_at: string
  updated_at: string
  published_at: string | null
  poem_tags: { tags: TagRow | null }[]
  collection_poems: { collection_id: string; collections: { id: string; title: string } | null }[]
}

const OWN_COLS = `id, author_id, title, content, status, visibility, publication_identity, displayed_pseudonym,
  font, sensitive, created_at, updated_at, published_at, poem_tags(tags(id, name, normalized_name)),
  collection_poems(collection_id, collections(id, title))`

type ProfileRow = {
  id: string
  account_name: string
  display_name: string
  primary_pseudonym: string | null
  bio: string | null
  links: string[] | null
  support_visibility: Profile['supportVisibility']
  created_at: string
  updated_at: string
}

type CollectionRow = {
  id: string
  owner_id: string
  title: string
  description: string | null
  visibility: Collection['visibility']
  created_at: string
  updated_at: string
}

type PublicCollectionRow = Omit<CollectionRow, 'owner_id'> & {
  owner_name: string
  owner_account_name: string | null
  poem_count: number
}

// ───────────────────────────── Traducción a tipos del dominio

const toTag = (t: TagRow): Tag => ({ id: t.id, name: t.name, normalizedName: t.normalized_name })

function toProfile(r: ProfileRow): Profile {
  return {
    id: r.id,
    accountName: r.account_name,
    displayName: r.display_name,
    primaryPseudonym: r.primary_pseudonym ?? undefined,
    bio: r.bio ?? undefined,
    links: r.links ?? [],
    supportVisibility: r.support_visibility,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

function publicView(row: unknown): PoemView {
  const r = publicPoemSchema.parse(row)
  return {
    id: r.id,
    title: r.title ?? undefined,
    content: r.content,
    authorName: r.author_name,
    authorAccountName: r.author_account_name,
    tags: r.tags,
    collection: r.collection,
    font: r.font,
    sensitive: r.sensitive,
    status: 'published',
    visibility: 'public',
    isOwner: false,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    publishedAt: r.published_at,
  }
}

function ownTags(r: OwnPoemRow): Tag[] {
  return r.poem_tags
    .map((pt) => pt.tags)
    .filter((t): t is TagRow => !!t)
    .map(toTag)
    .sort((a, b) => a.normalizedName.localeCompare(b.normalizedName, 'es'))
}

function ownView(r: OwnPoemRow, me: Profile): PoemView {
  const named = r.publication_identity === 'profile_name'
  const authorName =
    r.publication_identity === 'anonymous'
      ? 'Anónimo'
      : r.publication_identity === 'pseudonym'
        ? r.displayed_pseudonym || 'Anónimo'
        : me.displayName || 'Anónimo'
  const col = r.collection_poems.map((cp) => cp.collections).find((c) => !!c) ?? null
  return {
    id: r.id,
    title: r.title ?? undefined,
    content: r.content,
    authorName,
    authorAccountName: named && me.displayName ? me.accountName : null,
    tags: ownTags(r),
    collection: col,
    font: isPoemFont(r.font) ? r.font : 'clasica',
    sensitive: r.sensitive,
    status: r.status,
    visibility: r.visibility,
    isOwner: true,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    publishedAt: r.published_at,
  }
}

function ownPoem(r: OwnPoemRow): Poem {
  return {
    id: r.id,
    authorId: r.author_id,
    title: r.title ?? undefined,
    content: r.content,
    status: r.status,
    visibility: r.visibility,
    publicationIdentity: r.publication_identity,
    displayedPseudonym: r.displayed_pseudonym ?? undefined,
    font: isPoemFont(r.font) ? r.font : 'clasica',
    sensitive: r.sensitive,
    tags: ownTags(r),
    collectionId: r.collection_poems[0]?.collection_id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    publishedAt: r.published_at ?? undefined,
  }
}

function toCollection(r: CollectionRow): Collection {
  return {
    id: r.id,
    ownerId: r.owner_id,
    title: r.title,
    description: r.description ?? undefined,
    visibility: r.visibility,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

function publicCollectionView(r: PublicCollectionRow): CollectionView {
  return {
    id: r.id,
    ownerId: '',
    title: r.title,
    description: r.description ?? undefined,
    visibility: r.visibility,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    ownerName: r.owner_name,
    ownerAccountName: r.owner_account_name,
    isOwner: false,
    poemCount: r.poem_count,
  }
}

// ───────────────────────────── Errores

type DbError = { message: string; code?: string } | null

/** Convierte un error de Supabase en un mensaje para la persona. */
function fail(error: DbError): void {
  if (!error) return
  // Los RAISE EXCEPTION de nuestras funciones SQL ya vienen escritos en español.
  if (error.code === 'P0001') throw new Error(error.message)
  if (/fetch|network/i.test(error.message)) {
    throw new Error('No hay conexión con CISNE. Revisa tu red e inténtalo de nuevo; tu texto no se ha perdido.')
  }
  console.error(error)
  throw new Error('No se pudo completar. Inténtalo de nuevo en unos segundos.')
}

function authFail(error: DbError): void {
  if (!error) return
  const byCode: Record<string, string> = {
    invalid_credentials: 'El email o la contraseña no coinciden.',
    email_not_confirmed: 'Confirma tu email: te enviamos un enlace al crear la cuenta.',
    user_already_exists: 'Ya existe una cuenta con ese email.',
    email_exists: 'Ya existe una cuenta con ese email.',
    weak_password: 'Esa contraseña es demasiado débil. Prueba con una más larga.',
    same_password: 'La nueva contraseña debe ser distinta de la anterior.',
    over_email_send_rate_limit: 'Hemos enviado demasiados correos. Espera unos minutos.',
    over_request_rate_limit: 'Demasiados intentos. Espera unos minutos.',
  }
  const known = error.code && byCode[error.code]
  if (known) throw new Error(known)
  fail(error)
}

const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

const blankProfile = (): Profile => {
  const now = new Date().toISOString()
  return { id: '', accountName: '', displayName: '', supportVisibility: 'private', createdAt: now, updatedAt: now }
}

// ───────────────────────────── Repositorios

export function supabaseRepositories(sb: SupabaseClient): Repositories {
  type Me = { id: string; email: string; createdAt: string; profile: Profile }

  // Usuario actual y su perfil, en caché hasta el próximo cambio de datos o de sesión.
  let meCache: Promise<Me | null> | null = null
  function me(): Promise<Me | null> {
    meCache ??= (async () => {
      const { data } = await sb.auth.getSession()
      const user = data.session?.user
      if (!user) return null
      const { data: row, error } = await sb.from('profiles').select('*').eq('id', user.id).maybeSingle()
      fail(error)
      if (!row) return null
      return { id: user.id, email: user.email ?? '', createdAt: user.created_at, profile: toProfile(row) }
    })().catch((e) => {
      meCache = null
      throw e
    })
    return meCache
  }
  async function requireMe(): Promise<Me> {
    const m = await me()
    if (!m) throw new Error('Necesitas entrar en tu cuenta para hacer esto.')
    return m
  }
  function changed() {
    meCache = null
    emitDataChange()
  }

  sb.auth.onAuthStateChange((event) => {
    if (event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') return
    // Fuera del callback: Supabase recomienda no lanzar consultas dentro.
    window.setTimeout(changed, 0)
  })

  async function ownRows(filter: { ids?: string[]; status?: Poem['status'] }, m: Me): Promise<OwnPoemRow[]> {
    let q = sb.from('poems').select(OWN_COLS).eq('author_id', m.id)
    if (filter.ids) q = q.in('id', filter.ids)
    if (filter.status) q = q.eq('status', filter.status)
    const { data, error } = await q.order('updated_at', { ascending: false })
    fail(error)
    return (data ?? []) as unknown as OwnPoemRow[]
  }

  /** Vistas de varios poemas por id, en el orden pedido: los míos completos, el resto públicos. */
  async function viewsByIds(ids: string[]): Promise<PoemView[]> {
    if (ids.length === 0) return []
    const m = await me()
    const [own, pub] = await Promise.all([
      m ? ownRows({ ids }, m) : Promise.resolve([]),
      sb.from('public_poems').select(PUBLIC_COLS).in('id', ids),
    ])
    fail(pub.error)
    const byId = new Map<string, PoemView>()
    for (const row of pub.data ?? []) {
      const v = publicView(row)
      byId.set(v.id, v)
    }
    for (const row of own) byId.set(row.id, ownView(row, m!.profile))
    return ids.map((id) => byId.get(id)).filter((v): v is PoemView => !!v)
  }

  async function listPublicRows(filter?: { tag?: string; authorAccountName?: string }) {
    let q = sb.from('public_poems').select(PUBLIC_COLS)
    if (filter?.tag) q = q.contains('tags', JSON.stringify([{ normalizedName: normalizeTag(filter.tag) }]))
    if (filter?.authorAccountName) q = q.eq('author_account_name', filter.authorAccountName)
    const { data, error } = await q.order('published_at', { ascending: false }).limit(500)
    fail(error)
    return (data ?? []).map(publicView)
  }

  function ownCollectionView(r: CollectionRow & { collection_poems?: { count: number }[] }, m: Me): CollectionView {
    return {
      ...toCollection(r),
      ownerName: m.profile.displayName || 'Sin nombre',
      ownerAccountName: m.profile.displayName ? m.profile.accountName : null,
      isOwner: true,
      poemCount: r.collection_poems?.[0]?.count ?? 0,
    }
  }

  const repos: Repositories = {
    auth: {
      async current() {
        const m = await me()
        return m ? { accountName: m.profile.accountName, displayName: m.profile.displayName } : null
      },

      async account() {
        const m = await me()
        return m ? { email: m.email, accountName: m.profile.accountName, createdAt: m.createdAt } : null
      },

      async signUp({ displayName, email, password }) {
        const { data, error } = await sb.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { display_name: displayName.trim() }, emailRedirectTo: `${window.location.origin}/` },
        })
        authFail(error)
        // Con la confirmación por email activa, un email ya registrado no da
        // error (para no revelar cuentas) pero llega sin identidades.
        if (data.user && data.user.identities?.length === 0) throw new Error('Ya existe una cuenta con ese email.')
        if (!data.session) return null
        changed()
        return repos.auth.current()
      },

      async signIn({ email, password }) {
        const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password })
        authFail(error)
        changed()
        const s = await repos.auth.current()
        if (!s) throw new Error('No encontramos tu perfil. Escríbenos si el problema sigue.')
        return s
      },

      async signOut() {
        const { error } = await sb.auth.signOut()
        authFail(error)
        changed()
      },

      async requestPasswordReset(email) {
        const { error } = await sb.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/nueva-contrasena`,
        })
        authFail(error)
      },

      async updatePassword(password) {
        const { error } = await sb.auth.updateUser({ password })
        authFail(error)
      },

      async deleteAccount() {
        await requireMe()
        const { error } = await sb.rpc('delete_my_account')
        fail(error)
        // La cuenta ya no existe en el servidor: basta con olvidar la sesión aquí.
        await sb.auth.signOut({ scope: 'local' })
        changed()
      },
    },

    poems: {
      listPublic: listPublicRows,

      async search({ q, tag, order, seed = 0, includeSensitive = true }) {
        const { data, error } = await sb.rpc('search_public_poems', {
          q: q ?? '',
          tag: tag ? normalizeTag(tag) : null,
          include_sensitive: includeSensitive,
        })
        fail(error)
        const views = ((data ?? []) as unknown[]).map(publicView)
        return order === 'recent' ? views : shuffleDiverse(views, (v) => v.authorName, seed)
      },

      async get(id) {
        if (!isUuid(id)) return null
        const m = await me()
        if (m) {
          const [own] = await ownRows({ ids: [id] }, m)
          if (own) return ownView(own, m.profile)
        }
        const { data, error } = await sb.from('public_poems').select(PUBLIC_COLS).eq('id', id).maybeSingle()
        fail(error)
        return data ? publicView(data) : null
      },

      async getOwn(id) {
        const m = await me()
        if (!m || !isUuid(id)) return null
        const [own] = await ownRows({ ids: [id] }, m)
        return own ? ownPoem(own) : null
      },

      async listMine(status) {
        const m = await me()
        if (!m) return []
        return (await ownRows({ status }, m)).map((r) => ownView(r, m.profile))
      },

      async related(id, limit) {
        const base = await repos.poems.get(id)
        const mine = new Set(base?.tags.map((t) => t.normalizedName))
        if (mine.size === 0) return []
        return (await listPublicRows())
          .filter((p) => p.id !== id)
          .map((p) => ({ p, shared: p.tags.filter((t) => mine.has(t.normalizedName)).length }))
          .filter((x) => x.shared > 0)
          .sort((a, b) => b.shared - a.shared)
          .slice(0, limit)
          .map((x) => x.p)
      },

      async save(input) {
        await requireMe()
        const { data, error } = await sb.rpc('save_poem', {
          p_id: input.id ?? null,
          p_title: input.title ?? null,
          p_content: normalizePoemText(input.content),
          p_status: input.status,
          p_visibility: input.visibility,
          p_identity: input.publicationIdentity,
          p_pseudonym: input.displayedPseudonym ?? null,
          p_tags: input.tags,
          p_collection_id: input.collectionId ?? null,
          p_font: input.font,
          p_sensitive: input.sensitive,
        })
        fail(error)
        changed()
        const saved = await repos.poems.getOwn(data as string)
        if (!saved) throw new Error('Se guardó, pero no pudimos volver a cargarlo. Recarga la página.')
        return saved
      },

      async remove(id) {
        await requireMe()
        const { error, count } = await sb.from('poems').delete({ count: 'exact' }).eq('id', id)
        fail(error)
        if (!count) throw new Error('No encontramos ese poema entre los tuyos.')
        changed()
      },
    },

    profiles: {
      async getMine() {
        return (await me())?.profile ?? blankProfile()
      },

      async updateMine(patch) {
        const m = await requireMe()
        const row: Record<string, unknown> = {}
        if ('displayName' in patch) row.display_name = patch.displayName ?? ''
        if ('primaryPseudonym' in patch) row.primary_pseudonym = patch.primaryPseudonym || null
        if ('bio' in patch) row.bio = patch.bio || null
        if ('links' in patch) row.links = patch.links ?? []
        if ('supportVisibility' in patch) row.support_visibility = patch.supportVisibility ?? 'private'
        const { error } = await sb.from('profiles').update(row).eq('id', m.id)
        fail(error)
        changed()
        return (await requireMe()).profile
      },

      async getPublicByAccountName(accountName) {
        const { data, error } = await sb
          .from('public_profiles')
          .select('account_name, display_name, bio, links')
          .eq('account_name', accountName)
          .maybeSingle()
        fail(error)
        if (!data) return null
        return {
          accountName: data.account_name,
          displayName: data.display_name,
          bio: data.bio ?? undefined,
          links: data.links ?? [],
        }
      },

      async listPseudonyms() {
        const m = await me()
        if (!m) return []
        const { data, error } = await sb
          .from('poems')
          .select('displayed_pseudonym')
          .eq('author_id', m.id)
          .not('displayed_pseudonym', 'is', null)
        fail(error)
        const used = (data ?? []).map((r) => r.displayed_pseudonym as string)
        return [...new Set([m.profile.primaryPseudonym, ...used].filter((x): x is string => !!x))]
      },
    },

    tags: {
      async suggest() {
        const m = await me()
        const [pub, own] = await Promise.all([
          sb.from('public_tags').select('id, name, normalized_name'),
          // Con RLS, la tabla solo devuelve las etiquetas de mis poemas.
          m ? sb.from('tags').select('id, name, normalized_name') : Promise.resolve({ data: [], error: null }),
        ])
        fail(pub.error)
        fail(own.error)
        const byName = new Map<string, Tag>()
        for (const t of [...(pub.data ?? []), ...(own.data ?? [])] as TagRow[]) byName.set(t.normalized_name, toTag(t))
        return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name, 'es'))
      },
    },

    collections: {
      async listMine() {
        const m = await me()
        if (!m) return []
        const { data, error } = await sb
          .from('collections')
          .select('*, collection_poems(count)')
          .eq('owner_id', m.id)
          .order('updated_at', { ascending: false })
        fail(error)
        return (data ?? []).map((r) => ownCollectionView(r, m))
      },

      async listPublicByOwner(accountName) {
        const { data, error } = await sb
          .from('public_collections')
          .select('*')
          .eq('owner_account_name', accountName)
          .order('updated_at', { ascending: false })
        fail(error)
        return (data ?? []).map((r) => publicCollectionView(r as PublicCollectionRow))
      },

      async get(id) {
        if (!isUuid(id)) return null
        const m = await me()
        if (m) {
          const { data: own, error } = await sb.from('collections').select('*').eq('id', id).maybeSingle()
          fail(error)
          if (own) {
            const { data: entries, error: e2 } = await sb
              .from('collection_poems')
              .select('poem_id')
              .eq('collection_id', id)
              .order('position')
            fail(e2)
            const poems = await viewsByIds((entries ?? []).map((e) => e.poem_id as string))
            return { collection: { ...ownCollectionView(own, m), poemCount: poems.length }, poems }
          }
        }
        const [col, entries] = await Promise.all([
          sb.from('public_collections').select('*').eq('id', id).maybeSingle(),
          sb.from('public_collection_poems').select(PUBLIC_COLS).eq('collection_id', id).order('position'),
        ])
        fail(col.error)
        fail(entries.error)
        if (!col.data) return null
        return {
          collection: publicCollectionView(col.data as PublicCollectionRow),
          poems: (entries.data ?? []).map(publicView),
        }
      },

      async create({ title, description, visibility }) {
        await requireMe()
        const { data, error } = await sb
          .from('collections')
          .insert({ title: title.trim(), description: description?.trim() || null, visibility })
          .select()
          .single()
        fail(error)
        changed()
        return toCollection(data)
      },

      async update(id, { title, description, visibility }) {
        await requireMe()
        const { data, error } = await sb
          .from('collections')
          .update({ title: title.trim(), description: description?.trim() || null, visibility })
          .eq('id', id)
          .select()
          .maybeSingle()
        fail(error)
        if (!data) throw new Error('Esa colección ya no existe.')
        changed()
        return toCollection(data)
      },

      async remove(id) {
        await requireMe()
        const { error, count } = await sb.from('collections').delete({ count: 'exact' }).eq('id', id)
        fail(error)
        if (!count) throw new Error('Esa colección ya no existe.')
        changed()
      },

      async containing(poemId) {
        if (!(await me())) return []
        const { data, error } = await sb.from('collection_poems').select('collection_id').eq('poem_id', poemId)
        fail(error)
        return (data ?? []).map((r) => r.collection_id as string)
      },

      async addPoem(collectionId, poemId) {
        await requireMe()
        const { error } = await sb.rpc('add_poem_to_collection', { p_collection: collectionId, p_poem: poemId })
        fail(error)
        changed()
      },

      async removePoem(collectionId, poemId) {
        await requireMe()
        const { error } = await sb
          .from('collection_poems')
          .delete()
          .eq('collection_id', collectionId)
          .eq('poem_id', poemId)
        fail(error)
        changed()
      },

      async movePoem(collectionId, poemId, delta) {
        await requireMe()
        const { error } = await sb.rpc('move_collection_poem', {
          p_collection: collectionId,
          p_poem: poemId,
          p_delta: delta,
        })
        fail(error)
        changed()
      },
    },

    favorites: {
      async listIds() {
        if (!(await me())) return []
        const { data, error } = await sb.from('favorites').select('poem_id')
        fail(error)
        return (data ?? []).map((r) => r.poem_id as string)
      },

      async list() {
        if (!(await me())) return []
        const { data, error } = await sb.from('favorites').select('poem_id').order('created_at', { ascending: false })
        fail(error)
        return viewsByIds((data ?? []).map((r) => r.poem_id as string))
      },

      async toggle(poemId) {
        const m = await requireMe()
        const { data: has, error } = await sb.from('favorites').select('poem_id').eq('poem_id', poemId).maybeSingle()
        fail(error)
        const res = has
          ? await sb.from('favorites').delete().eq('user_id', m.id).eq('poem_id', poemId)
          : await sb.from('favorites').insert({ poem_id: poemId })
        fail(res.error)
        changed()
        return !has
      },
    },

    supports: {
      async poem(poemId) {
        if (!isUuid(poemId)) return { supported: false, count: null, canSupport: false }
        const { data, error } = await sb.rpc('poem_support_state', { p: poemId })
        fail(error)
        return supportStateSchema.parse(data) satisfies SupportState
      },

      async togglePoem(poemId) {
        await requireMe()
        const { data, error } = await sb.rpc('toggle_poem_support', { p: poemId })
        fail(error)
        changed()
        return data as boolean
      },

      async author(accountName) {
        const { data, error } = await sb.rpc('author_support_state', { account: accountName })
        fail(error)
        return supportStateSchema.parse(data) satisfies SupportState
      },

      async toggleAuthor(accountName) {
        await requireMe()
        const { data, error } = await sb.rpc('toggle_author_support', { account: accountName })
        fail(error)
        changed()
        return data as boolean
      },
    },
  }
  return repos
}
