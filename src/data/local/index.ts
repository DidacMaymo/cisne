import { pickDiverse } from '../discover'
import { normalizePoemText, normalizeTag } from '../normalize'
import type { Repositories } from '../repositories'
import type { Collection, Poem, PoemView, Profile, Tag } from '../types'
import { commit, LOCAL_USER_ID, readStore, type Store, type StoredPoem } from './store'

type World = Store & { profiles: Profile[] }

/** Datos del usuario + (solo en desarrollo) los poemas de ejemplo, que no se persisten. */
async function world(): Promise<World> {
  const s = readStore()
  const seed = import.meta.env.DEV ? (await import('../dev-seed')).devSeed : null
  return {
    ...s,
    profiles: [s.profile, ...(seed?.profiles ?? [])],
    poems: [...s.poems, ...(seed?.poems ?? [])],
    tags: [...s.tags, ...(seed?.tags ?? [])],
  }
}

const isPublic = (p: StoredPoem) => p.status === 'published' && p.visibility === 'public'
const canView = (p: StoredPoem) => isPublic(p) || p.authorId === LOCAL_USER_ID
const byRecent = (a: StoredPoem, b: StoredPoem) =>
  (b.publishedAt ?? b.updatedAt).localeCompare(a.publishedAt ?? a.updatedAt)

function tagsOf(w: World, p: StoredPoem): Tag[] {
  return p.tagIds.map((id) => w.tags.find((t) => t.id === id)).filter((t): t is Tag => !!t)
}

function collectionIdOf(w: World, poemId: string): string | undefined {
  return w.collectionPoems.find((cp) => cp.poemId === poemId)?.collectionId
}

function authorOf(w: World, p: StoredPoem): { name: string; account: string | null } {
  const profile = w.profiles.find((x) => x.id === p.authorId)
  if (p.publicationIdentity === 'anonymous') return { name: 'Anónimo', account: null }
  if (p.publicationIdentity === 'pseudonym') {
    return { name: p.displayedPseudonym || 'Anónimo', account: null }
  }
  return {
    name: profile?.displayName || profile?.accountName || 'Anónimo',
    account: profile?.accountName ?? null,
  }
}

function toView(w: World, p: StoredPoem): PoemView {
  const author = authorOf(w, p)
  const cid = collectionIdOf(w, p.id)
  const col = cid ? w.collections.find((c) => c.id === cid) : undefined
  const isOwner = p.authorId === LOCAL_USER_ID
  return {
    id: p.id,
    title: p.title,
    content: p.content,
    authorName: author.name,
    authorAccountName: author.account,
    tags: tagsOf(w, p),
    collection: col && (col.visibility === 'public' || isOwner) ? { id: col.id, title: col.title } : null,
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
  return { ...rest, tags: tagsOf(w, p), collectionId: collectionIdOf(w, p.id) }
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

export const localRepositories: Repositories = {
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
          const a = authorOf(w, p)
          return a.account === filter.authorAccountName
        })
        .sort(byRecent)
        .map((p) => toView(w, p))
    },

    async discover(seed, limit) {
      const w = await world()
      return pickDiverse(w.poems.filter(isPublic), (p) => p.authorId, seed, 2)
        .slice(0, limit)
        .map((p) => toView(w, p))
    },

    async get(id) {
      const w = await world()
      const p = w.poems.find((x) => x.id === id)
      return p && canView(p) ? toView(w, p) : null
    },

    async getOwn(id) {
      const w = await world()
      const p = w.poems.find((x) => x.id === id && x.authorId === LOCAL_USER_ID)
      return p ? toOwnPoem(w, p) : null
    },

    async listMine(status) {
      const w = await world()
      return w.poems
        .filter((p) => p.authorId === LOCAL_USER_ID && p.status === status)
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
        let existing: StoredPoem | undefined
        if (input.id) {
          existing = s.poems.find((p) => p.id === input.id && p.authorId === LOCAL_USER_ID)
          if (!existing) throw new Error('No encontramos ese poema entre los tuyos.')
        }
        const tagIds = [...new Set(input.tags.map((t) => ensureTag(s, t)).filter((id): id is string => !!id))]
        const pseudonym =
          input.publicationIdentity === 'pseudonym' ? input.displayedPseudonym?.trim() || undefined : undefined
        const poem: StoredPoem = {
          id: savedId,
          authorId: LOCAL_USER_ID,
          title: input.title?.trim() || undefined,
          content: normalizePoemText(input.content),
          status: input.status,
          visibility: input.visibility,
          publicationIdentity: input.publicationIdentity,
          displayedPseudonym: pseudonym,
          tagIds,
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
          publishedAt: input.status === 'published' ? (existing?.publishedAt ?? now) : undefined,
        }
        s.poems = existing ? s.poems.map((p) => (p.id === poem.id ? poem : p)) : [...s.poems, poem]

        // El editor maneja una sola colección por poema.
        s.collectionPoems = s.collectionPoems.filter((cp) => cp.poemId !== poem.id)
        if (input.collectionId) {
          const target = s.collections.find((c) => c.id === input.collectionId && c.ownerId === LOCAL_USER_ID)
          if (!target) throw new Error('La colección elegida ya no existe.')
          const position = s.collectionPoems.filter((cp) => cp.collectionId === target.id).length
          s.collectionPoems.push({ collectionId: target.id, poemId: poem.id, position })
        }
      })
      const w = await world()
      return toOwnPoem(w, w.poems.find((p) => p.id === savedId)!)
    },

    async remove(id) {
      commit((s) => {
        if (!s.poems.some((p) => p.id === id && p.authorId === LOCAL_USER_ID)) {
          throw new Error('No encontramos ese poema entre los tuyos.')
        }
        s.poems = s.poems.filter((p) => p.id !== id)
        s.favorites = s.favorites.filter((f) => f.poemId !== id)
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
        s.profile = { ...s.profile, ...patch, updatedAt: new Date().toISOString() }
      })
      return readStore().profile
    },

    async getPublicByAccountName(accountName) {
      const w = await world()
      const p = w.profiles.find((x) => x.accountName === accountName)
      if (!p) return null
      // Una cuenta sin nombre público todavía no tiene página de autor.
      if (!p.displayName) return null
      return { accountName: p.accountName, displayName: p.displayName, bio: p.bio }
    },

    async listPseudonyms() {
      const s = readStore()
      const used = s.poems.map((p) => p.displayedPseudonym).filter((x): x is string => !!x)
      return [...new Set([s.profile.primaryPseudonym, ...used].filter((x): x is string => !!x))]
    },
  },

  tags: {
    async suggest() {
      const w = await world()
      const used = new Map<string, Tag>()
      for (const p of w.poems.filter((x) => isPublic(x) || x.authorId === LOCAL_USER_ID)) {
        for (const t of tagsOf(w, p)) if (!used.has(t.normalizedName)) used.set(t.normalizedName, t)
      }
      return [...used.values()].sort((a, b) => a.name.localeCompare(b.name, 'es'))
    },
  },

  collections: {
    async listMine() {
      return readStore().collections.filter((c) => c.ownerId === LOCAL_USER_ID)
    },

    async create({ title }) {
      const now = new Date().toISOString()
      const collection: Collection = {
        id: crypto.randomUUID(),
        ownerId: LOCAL_USER_ID,
        title: title.trim(),
        visibility: 'private',
        createdAt: now,
        updatedAt: now,
      }
      commit((s) => {
        s.collections.push(collection)
      })
      return collection
    },
  },

  favorites: {
    async listIds() {
      return readStore()
        .favorites.filter((f) => f.userId === LOCAL_USER_ID)
        .map((f) => f.poemId)
    },

    async toggle(poemId) {
      let saved = false
      commit((s) => {
        const has = s.favorites.some((f) => f.userId === LOCAL_USER_ID && f.poemId === poemId)
        saved = !has
        s.favorites = has
          ? s.favorites.filter((f) => !(f.userId === LOCAL_USER_ID && f.poemId === poemId))
          : [...s.favorites, { userId: LOCAL_USER_ID, poemId, createdAt: new Date().toISOString() }]
      })
      return saved
    },
  },
}
