import { firstLine } from '../../lib/poem-text'
import { countWords } from '../schemas'
import { shuffleDiverse } from '../discover'
import { foldText, normalizePoemText, normalizeTag, slugify } from '../normalize'
import type { Repositories } from '../repositories'
import type { Collection, CollectionView, Poem, PoemView, Profile, Session, Tag } from '../types'
import { commit, fresh, LOCAL_USER_ID, readStore, type Store, type StoredPoem } from './store'

type World = Store & { profiles: Profile[] }

/** Datos del usuario + (solo en desarrollo) los de ejemplo, que no se persisten. */
async function world(): Promise<World> {
  const s = readStore()
  const seed = import.meta.env.DEV ? (await import('../dev-seed')).devSeed : null
  return {
    ...s,
    profiles: [s.profile, ...(seed?.profiles ?? [])],
    poems: [...s.poems, ...(seed?.poems ?? [])],
    tags: [...s.tags, ...(seed?.tags ?? [])],
    collections: [...s.collections, ...(seed?.collections ?? [])],
    collectionPoems: [...s.collectionPoems, ...(seed?.collectionPoems ?? [])],
  }
}

/** Id del usuario con sesión, o `null`. */
const me = (s: Store) => (s.signedIn ? LOCAL_USER_ID : null)

function requireMe(s: Store): string {
  const id = me(s)
  if (!id) throw new Error('Necesitas entrar en tu cuenta para hacer esto.')
  return id
}

const isPublic = (p: StoredPoem) => p.status === 'published' && p.visibility === 'public'
const isMine = (w: World, p: { authorId?: string; ownerId?: string }) =>
  !!me(w) && (p.authorId ?? p.ownerId) === me(w)
const canView = (w: World, p: StoredPoem) => isPublic(p) || isMine(w, p)
const byRecent = (a: StoredPoem, b: StoredPoem) =>
  (b.publishedAt ?? b.updatedAt).localeCompare(a.publishedAt ?? a.updatedAt)

function tagsOf(w: World, p: StoredPoem): Tag[] {
  return p.tagIds.map((id) => w.tags.find((t) => t.id === id)).filter((t): t is Tag => !!t)
}

function authorOf(w: World, p: StoredPoem): { name: string; account: string | null } {
  const profile = w.profiles.find((x) => x.id === p.authorId)
  if (p.publicationIdentity === 'anonymous') return { name: 'Anónimo', account: null }
  if (p.publicationIdentity === 'pseudonym') {
    return { name: p.displayedPseudonym || 'Anónimo', account: null }
  }
  return {
    name: profile?.displayName || profile?.accountName || 'Anónimo',
    account: profile?.displayName ? profile.accountName : null,
  }
}

/**
 * Un poema firmado con pseudónimo o anónimo no puede aparecer en una colección
 * pública de su propio autor: delataría quién lo escribió.
 */
const revealsAuthor = (c: Collection, p: StoredPoem) =>
  p.authorId === c.ownerId && p.publicationIdentity !== 'profile_name'

/** Poemas de una colección que puede ver quien mira, en orden. */
function poemsIn(w: World, c: Collection): StoredPoem[] {
  const owner = isMine(w, c)
  return w.collectionPoems
    .filter((cp) => cp.collectionId === c.id)
    .sort((a, b) => a.position - b.position)
    .map((cp) => w.poems.find((p) => p.id === cp.poemId))
    .filter((p): p is StoredPoem => !!p)
    .filter((p) => (owner ? canView(w, p) : isPublic(p) && !revealsAuthor(c, p)))
}

function collectionView(w: World, c: Collection): CollectionView {
  const owner = w.profiles.find((p) => p.id === c.ownerId)
  return {
    ...c,
    ownerName: owner?.displayName || 'Sin nombre',
    ownerAccountName: owner?.displayName ? owner.accountName : null,
    isOwner: isMine(w, c),
    poemCount: poemsIn(w, c).length,
  }
}

function toView(w: World, p: StoredPoem): PoemView {
  const author = authorOf(w, p)
  const isOwner = isMine(w, p)
  // «Del poemario…»: solo colecciones del propio autor y sin romper su anonimato.
  const col = w.collectionPoems
    .filter((cp) => cp.poemId === p.id)
    .map((cp) => w.collections.find((c) => c.id === cp.collectionId))
    .find(
      (c): c is Collection =>
        !!c && c.ownerId === p.authorId && (isOwner || (c.visibility === 'public' && !revealsAuthor(c, p))),
    )
  return {
    id: p.id,
    title: p.title,
    content: p.content,
    authorName: author.name,
    authorAccountName: author.account,
    tags: tagsOf(w, p),
    collection: col ? { id: col.id, title: col.title } : null,
    font: p.font,
    sensitive: p.sensitive,
    commentsEnabled: p.commentsEnabled,
    status: p.status,
    visibility: p.visibility,
    isOwner,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    publishedAt: p.publishedAt ?? null,
  }
}

function toOwnPoem(w: World, p: StoredPoem): Poem {
  const { tagIds: _tagIds, ...rest } = p
  void _tagIds
  const own = w.collectionPoems.find(
    (cp) => cp.poemId === p.id && w.collections.some((c) => c.id === cp.collectionId && c.ownerId === p.authorId),
  )
  return { ...rest, tags: tagsOf(w, p), collectionId: own?.collectionId }
}

function ensureTag(s: Store, raw: string): string | null {
  const normalized = normalizeTag(raw)
  if (!normalized) return null
  const found = s.tags.find((t) => t.normalizedName === normalized)
  if (found) return found.id
  const tag: Tag = { id: crypto.randomUUID(), name: normalized, normalizedName: normalized }
  s.tags.push(tag)
  return tag.id
}

function ownCollection(s: Store, id: string): Collection {
  const userId = requireMe(s)
  const c = s.collections.find((x) => x.id === id && x.ownerId === userId)
  if (!c) throw new Error('Esa colección ya no existe.')
  return c
}

/** Vuelve a numerar las posiciones 0..n de una colección. */
function renumber(s: Store, collectionId: string) {
  s.collectionPoems
    .filter((cp) => cp.collectionId === collectionId)
    .sort((a, b) => a.position - b.position)
    .forEach((cp, i) => (cp.position = i))
}

async function hash(salt: string, password: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${password}`))
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function session(s: Store): Session | null {
  return s.signedIn ? { accountName: s.profile.accountName, displayName: s.profile.displayName } : null
}

export const localRepositories: Repositories = {
  auth: {
    async current() {
      return session(readStore())
    },

    async account() {
      const s = readStore()
      if (!s.signedIn || !s.account) return null
      const { email, accountName, createdAt } = s.account
      return { email, accountName, createdAt }
    },

    async signUp({ displayName, email, password }) {
      const w = await world()
      if (w.account) throw new Error('En este navegador ya hay una cuenta. Entra con ella.')
      const taken = new Set(w.profiles.filter((p) => p.id !== LOCAL_USER_ID).map((p) => p.accountName))
      const base = slugify(displayName) || 'autor'
      let accountName = base
      for (let n = 2; taken.has(accountName); n++) accountName = `${base}-${n}`
      const salt = crypto.randomUUID()
      const passwordHash = await hash(salt, password)
      const now = new Date().toISOString()
      commit((s) => {
        s.account = { email: email.trim().toLowerCase(), accountName, createdAt: now, salt, passwordHash }
        s.signedIn = true
        s.profile = { ...s.profile, accountName, displayName: displayName.trim(), updatedAt: now }
      })
      return session(readStore())!
    },

    async signIn({ email, password }) {
      const s = readStore()
      const a = s.account
      if (!a || a.email !== email.trim().toLowerCase() || a.passwordHash !== (await hash(a.salt, password))) {
        throw new Error('El email o la contraseña no coinciden.')
      }
      commit((d) => {
        d.signedIn = true
      })
      return session(readStore())!
    },

    async signOut() {
      commit((s) => {
        s.signedIn = false
      })
    },

    async requestPasswordReset() {
      throw new Error('En esta versión de prueba no se envían correos.')
    },

    async updatePassword(password) {
      const salt = crypto.randomUUID()
      const passwordHash = await hash(salt, password)
      commit((s) => {
        requireMe(s)
        if (s.account) s.account = { ...s.account, salt, passwordHash }
      })
    },

    async deleteAccount() {
      requireMe(readStore())
      commit((s) => Object.assign(s, fresh()))
    },
  },

  poems: {
    async listPublic(filter) {
      const w = await world()
      const tag = filter?.tag ? normalizeTag(filter.tag) : null
      return w.poems
        .filter(isPublic)
        .filter((p) => !tag || tagsOf(w, p).some((t) => t.normalizedName === tag))
        .filter((p) => {
          if (!filter?.authorAccountName) return true
          // Bajo el perfil de una cuenta solo salen los poemas firmados con su nombre.
          return authorOf(w, p).account === filter.authorAccountName
        })
        .sort(byRecent)
        .map((p) => toView(w, p))
    },

    async search({ q, tag, order, seed = 0, includeSensitive = true }) {
      const w = await world()
      const words = foldText(q ?? '').split(/\s+/).filter(Boolean)
      const tagName = tag ? normalizeTag(tag) : null
      const found = w.poems.filter(isPublic).filter((p) => {
        if (!includeSensitive && p.sensitive) return false
        const tags = tagsOf(w, p)
        if (tagName && !tags.some((t) => t.normalizedName === tagName)) return false
        if (words.length === 0) return true
        const haystack = foldText(
          [p.title ?? '', p.content, authorOf(w, p).name, ...tags.map((t) => t.normalizedName)].join(' '),
        )
        return words.every((word) => haystack.includes(word))
      })
      const ordered = order === 'recent' ? found.sort(byRecent) : shuffleDiverse(found, (p) => p.authorId, seed)
      return ordered.map((p) => toView(w, p))
    },

    async get(id) {
      const w = await world()
      const p = w.poems.find((x) => x.id === id)
      return p && canView(w, p) ? toView(w, p) : null
    },

    async getOwn(id) {
      const w = await world()
      const p = w.poems.find((x) => x.id === id && isMine(w, x))
      return p ? toOwnPoem(w, p) : null
    },

    async listMine(status) {
      const w = await world()
      return w.poems
        .filter((p) => isMine(w, p) && p.status === status)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map((p) => toView(w, p))
    },

    async related(id, limit) {
      const w = await world()
      const base = w.poems.find((p) => p.id === id)
      if (!base) return []
      const mine = new Set(tagsOf(w, base).map((t) => t.normalizedName))
      if (mine.size === 0) return []
      return w.poems
        .filter((p) => p.id !== id && isPublic(p))
        .map((p) => ({ p, shared: tagsOf(w, p).filter((t) => mine.has(t.normalizedName)).length }))
        .filter((x) => x.shared > 0)
        .sort((a, b) => b.shared - a.shared || byRecent(a.p, b.p))
        .slice(0, limit)
        .map((x) => toView(w, x.p))
    },

    async save(input) {
      const savedId = input.id ?? crypto.randomUUID()
      const now = new Date().toISOString()
      commit((s) => {
        const userId = requireMe(s)
        let existing: StoredPoem | undefined
        if (input.id) {
          existing = s.poems.find((p) => p.id === input.id && p.authorId === userId)
          if (!existing) throw new Error('No encontramos ese poema entre los tuyos.')
        }
        const tagIds = [...new Set(input.tags.map((t) => ensureTag(s, t)).filter((id): id is string => !!id))]
        const pseudonym =
          input.publicationIdentity === 'pseudonym' ? input.displayedPseudonym?.trim() || undefined : undefined
        const poem: StoredPoem = {
          id: savedId,
          authorId: userId,
          title: input.title?.trim() || undefined,
          content: normalizePoemText(input.content),
          status: input.status,
          visibility: input.visibility,
          publicationIdentity: input.publicationIdentity,
          displayedPseudonym: pseudonym,
          font: input.font,
          sensitive: input.sensitive,
          commentsEnabled: input.commentsEnabled,
          tagIds,
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
          publishedAt: input.status === 'published' ? (existing?.publishedAt ?? now) : undefined,
        }
        s.poems = existing ? s.poems.map((p) => (p.id === poem.id ? poem : p)) : [...s.poems, poem]

        if (input.collectionId) {
          const target = ownCollection(s, input.collectionId)
          if (!s.collectionPoems.some((cp) => cp.collectionId === target.id && cp.poemId === poem.id)) {
            const position = s.collectionPoems.filter((cp) => cp.collectionId === target.id).length
            s.collectionPoems.push({ collectionId: target.id, poemId: poem.id, position })
          }
        }
      })
      const w = await world()
      return toOwnPoem(w, w.poems.find((p) => p.id === savedId)!)
    },

    async remove(id) {
      commit((s) => {
        const userId = requireMe(s)
        if (!s.poems.some((p) => p.id === id && p.authorId === userId)) {
          throw new Error('No encontramos ese poema entre los tuyos.')
        }
        s.poems = s.poems.filter((p) => p.id !== id)
        s.favorites = s.favorites.filter((f) => f.poemId !== id)
        s.poemSupports = s.poemSupports.filter((x) => x.poemId !== id)
        s.verseComments = s.verseComments.filter((x) => x.poemId !== id)
        s.collectionPoems = s.collectionPoems.filter((cp) => cp.poemId !== id)
      })
    },
  },

  profiles: {
    async getMine() {
      return readStore().profile
    },

    async updateMine(patch) {
      commit((s) => {
        requireMe(s)
        s.profile = { ...s.profile, ...patch, updatedAt: new Date().toISOString() }
      })
      return readStore().profile
    },

    async getPublicByAccountName(accountName) {
      const w = await world()
      const p = w.profiles.find((x) => x.accountName === accountName)
      // Una cuenta sin nombre público todavía no tiene página de autor.
      if (!p || !p.displayName) return null
      return { accountName: p.accountName, displayName: p.displayName, bio: p.bio, links: p.links }
    },

    async listPseudonyms() {
      const s = readStore()
      if (!me(s)) return []
      const used = s.poems.map((p) => p.displayedPseudonym).filter((x): x is string => !!x)
      return [...new Set([s.profile.primaryPseudonym, ...used].filter((x): x is string => !!x))]
    },
  },

  tags: {
    async suggest() {
      const w = await world()
      const used = new Map<string, Tag>()
      for (const p of w.poems.filter((x) => canView(w, x))) {
        for (const t of tagsOf(w, p)) if (!used.has(t.normalizedName)) used.set(t.normalizedName, t)
      }
      return [...used.values()].sort((a, b) => a.name.localeCompare(b.name, 'es'))
    },
  },

  collections: {
    async listMine() {
      const w = await world()
      return w.collections
        .filter((c) => isMine(w, c))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map((c) => collectionView(w, c))
    },

    async listPublicByOwner(accountName) {
      const w = await world()
      const owner = w.profiles.find((p) => p.accountName === accountName)
      if (!owner) return []
      return w.collections
        .filter((c) => c.ownerId === owner.id && c.visibility === 'public')
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map((c) => collectionView(w, c))
    },

    async get(id) {
      const w = await world()
      const c = w.collections.find((x) => x.id === id)
      if (!c || (c.visibility === 'private' && !isMine(w, c))) return null
      return { collection: collectionView(w, c), poems: poemsIn(w, c).map((p) => toView(w, p)) }
    },

    async create({ title, description, visibility }) {
      const now = new Date().toISOString()
      let collection: Collection | undefined
      commit((s) => {
        collection = {
          id: crypto.randomUUID(),
          ownerId: requireMe(s),
          title: title.trim(),
          description: description?.trim() || undefined,
          visibility,
          createdAt: now,
          updatedAt: now,
        }
        s.collections.push(collection)
      })
      return collection!
    },

    async update(id, { title, description, visibility }) {
      let updated: Collection | undefined
      commit((s) => {
        const c = ownCollection(s, id)
        c.title = title.trim()
        c.description = description?.trim() || undefined
        c.visibility = visibility
        c.updatedAt = new Date().toISOString()
        updated = c
      })
      return updated!
    },

    async remove(id) {
      commit((s) => {
        ownCollection(s, id)
        s.collections = s.collections.filter((c) => c.id !== id)
        s.collectionPoems = s.collectionPoems.filter((cp) => cp.collectionId !== id)
      })
    },

    async containing(poemId) {
      const s = readStore()
      const userId = me(s)
      if (!userId) return []
      return s.collectionPoems
        .filter((cp) => cp.poemId === poemId && s.collections.some((c) => c.id === cp.collectionId && c.ownerId === userId))
        .map((cp) => cp.collectionId)
    },

    async addPoem(collectionId, poemId) {
      const w = await world()
      const poem = w.poems.find((p) => p.id === poemId)
      if (!poem || !canView(w, poem)) throw new Error('Ese poema ya no está disponible.')
      commit((s) => {
        const c = ownCollection(s, collectionId)
        if (s.collectionPoems.some((cp) => cp.collectionId === c.id && cp.poemId === poemId)) return
        const position = s.collectionPoems.filter((cp) => cp.collectionId === c.id).length
        s.collectionPoems.push({ collectionId: c.id, poemId, position })
        c.updatedAt = new Date().toISOString()
      })
    },

    async removePoem(collectionId, poemId) {
      commit((s) => {
        const c = ownCollection(s, collectionId)
        s.collectionPoems = s.collectionPoems.filter((cp) => !(cp.collectionId === c.id && cp.poemId === poemId))
        renumber(s, c.id)
        c.updatedAt = new Date().toISOString()
      })
    },

    async movePoem(collectionId, poemId, delta) {
      commit((s) => {
        const c = ownCollection(s, collectionId)
        renumber(s, c.id)
        const list = s.collectionPoems.filter((cp) => cp.collectionId === c.id).sort((a, b) => a.position - b.position)
        const i = list.findIndex((cp) => cp.poemId === poemId)
        const j = i + delta
        if (i === -1 || j < 0 || j >= list.length) return
        ;[list[i].position, list[j].position] = [list[j].position, list[i].position]
        c.updatedAt = new Date().toISOString()
      })
    },
  },

  favorites: {
    async listIds() {
      const s = readStore()
      const userId = me(s)
      return userId ? s.favorites.filter((f) => f.userId === userId).map((f) => f.poemId) : []
    },

    async list() {
      const w = await world()
      const userId = me(w)
      if (!userId) return []
      return w.favorites
        .filter((f) => f.userId === userId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((f) => w.poems.find((p) => p.id === f.poemId))
        .filter((p): p is StoredPoem => !!p && canView(w, p))
        .map((p) => toView(w, p))
    },

    async toggle(poemId) {
      let saved = false
      commit((s) => {
        const userId = requireMe(s)
        const has = s.favorites.some((f) => f.userId === userId && f.poemId === poemId)
        saved = !has
        s.favorites = has
          ? s.favorites.filter((f) => !(f.userId === userId && f.poemId === poemId))
          : [...s.favorites, { userId, poemId, createdAt: new Date().toISOString() }]
      })
      return saved
    },
  },

  supports: {
    async poem(poemId) {
      const w = await world()
      const p = w.poems.find((x) => x.id === poemId)
      if (!p || !canView(w, p)) return { supported: false, count: null, canSupport: false }
      const userId = me(w)
      const mine = p.authorId === userId
      const author = w.profiles.find((x) => x.id === p.authorId)
      // Sin firma, el número nunca se publica: podría señalar a quien lo escribió.
      const visible =
        mine || (isPublic(p) && p.publicationIdentity === 'profile_name' && author?.supportVisibility === 'public')
      const all = w.poemSupports.filter((x) => x.poemId === poemId)
      return {
        supported: !!userId && all.some((x) => x.userId === userId),
        count: visible ? all.length : null,
        canSupport: isPublic(p) && !mine,
      }
    },

    async togglePoem(poemId) {
      const w = await world()
      const p = w.poems.find((x) => x.id === poemId)
      let on = false
      commit((s) => {
        const userId = requireMe(s)
        if (!p || !isPublic(p)) throw new Error('Ese poema ya no está disponible.')
        if (p.authorId === userId) throw new Error('No puedes apoyar tus propios poemas.')
        const has = s.poemSupports.some((x) => x.userId === userId && x.poemId === poemId)
        on = !has
        s.poemSupports = has
          ? s.poemSupports.filter((x) => !(x.userId === userId && x.poemId === poemId))
          : [...s.poemSupports, { userId, poemId, createdAt: new Date().toISOString() }]
      })
      return on
    },

    async author(accountName) {
      const w = await world()
      const author = w.profiles.find((x) => x.accountName === accountName && x.displayName)
      if (!author) return { supported: false, count: null, canSupport: false }
      const userId = me(w)
      const self = author.id === userId
      const all = w.authorSupports.filter((x) => x.authorId === author.id)
      return {
        supported: !!userId && all.some((x) => x.userId === userId),
        count: self || author.supportVisibility === 'public' ? all.length : null,
        canSupport: !self,
      }
    },

    async toggleAuthor(accountName) {
      const w = await world()
      const author = w.profiles.find((x) => x.accountName === accountName && x.displayName)
      let on = false
      commit((s) => {
        const userId = requireMe(s)
        if (!author) throw new Error('No encontramos a este autor.')
        if (author.id === userId) throw new Error('No puedes apoyarte a ti mismo.')
        const has = s.authorSupports.some((x) => x.userId === userId && x.authorId === author.id)
        on = !has
        s.authorSupports = has
          ? s.authorSupports.filter((x) => !(x.userId === userId && x.authorId === author.id))
          : [...s.authorSupports, { userId, authorId: author.id, createdAt: new Date().toISOString() }]
      })
      return on
    },

    async listMine() {
      const w = await world()
      const userId = me(w)
      if (!userId) return { authors: [], poems: [] }
      const authors = w.authorSupports
        .filter((x) => x.userId === userId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((x) => w.profiles.find((p) => p.id === x.authorId))
        .filter((p): p is Profile => !!p?.displayName)
        .map((p) => ({ accountName: p.accountName, displayName: p.displayName }))
      const poems = w.poemSupports
        .filter((x) => x.userId === userId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((x) => w.poems.find((p) => p.id === x.poemId))
        .filter((p): p is StoredPoem => !!p)
        .map((p) =>
          isPublic(p)
            ? { id: p.id, title: p.title ?? firstLine(p.content), authorName: authorOf(w, p).name, available: true }
            : { id: p.id, title: 'Un poema que ya no es público', authorName: '', available: false },
        )
      return { authors, poems }
    },

    async unsupportPoem(poemId) {
      commit((s) => {
        const userId = requireMe(s)
        s.poemSupports = s.poemSupports.filter((x) => !(x.userId === userId && x.poemId === poemId))
      })
    },

    async unsupportAuthor(accountName) {
      const w = await world()
      const author = w.profiles.find((x) => x.accountName === accountName)
      commit((s) => {
        const userId = requireMe(s)
        s.authorSupports = s.authorSupports.filter((x) => !(x.userId === userId && x.authorId === author?.id))
      })
    },
  },

  comments: {
    async list(poemId) {
      const w = await world()
      const p = w.poems.find((x) => x.id === poemId)
      if (!p || !isPublic(p) || !p.commentsEnabled) return []
      const userId = me(w)
      return w.verseComments
        .filter((c) => c.poemId === poemId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .map((c) => {
          const author = w.profiles.find((x) => x.id === c.userId)
          return {
            id: c.id,
            line: c.line,
            quote: c.quote,
            body: c.body,
            authorName: author?.displayName || 'Sin nombre',
            authorAccountName: author?.displayName ? author.accountName : null,
            createdAt: c.createdAt,
            canDelete: !!userId && (c.userId === userId || p.authorId === userId),
          }
        })
    },

    async add(poemId, { line, quote, body }) {
      const w = await world()
      const p = w.poems.find((x) => x.id === poemId)
      commit((s) => {
        const userId = requireMe(s)
        if (!p || !isPublic(p) || !p.commentsEnabled) throw new Error('Este poema no admite comentarios.')
        if (!Number.isInteger(line) || line < 0 || line >= p.content.split('\n').length) {
          throw new Error('Ese verso ya no existe. Recarga la página.')
        }
        const text = body.trim()
        if (!text || text.length > 600 || countWords(text) > 50) {
          throw new Error('El comentario admite hasta 50 palabras.')
        }
        s.verseComments.push({
          id: crypto.randomUUID(),
          poemId,
          userId,
          line,
          quote: quote.trim().slice(0, 200),
          body: text,
          createdAt: new Date().toISOString(),
        })
      })
    },

    async remove(commentId) {
      const w = await world()
      commit((s) => {
        const userId = requireMe(s)
        const c = s.verseComments.find((x) => x.id === commentId)
        const poem = c && w.poems.find((p) => p.id === c.poemId)
        if (!c || (c.userId !== userId && poem?.authorId !== userId)) {
          throw new Error('No puedes borrar este comentario.')
        }
        s.verseComments = s.verseComments.filter((x) => x.id !== commentId)
      })
    },
  },
}
