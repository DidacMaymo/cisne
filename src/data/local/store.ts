// Almacén local: un único objeto JSON en localStorage. Hace de "base de datos"
// del navegador hasta que llegue Supabase (fase 5).
import { emitDataChange } from '../events'
import type { Account, Collection, CollectionPoem, Favorite, Poem, Profile, Tag } from '../types'

export const LOCAL_USER_ID = 'local-user'
const KEY = 'cisne:local:v1'

/** Poema guardado: las etiquetas van por id, como en la tabla PoemTags. */
export type StoredPoem = Omit<Poem, 'tags' | 'collectionId'> & { tagIds: string[] }

/**
 * Cuenta local de este navegador. La contraseña se guarda solo como hash con
 * sal: es una simulación honesta hasta que Supabase Auth la sustituya.
 */
export type LocalAccount = Account & { salt: string; passwordHash: string }

export type Store = {
  account: LocalAccount | null
  signedIn: boolean
  profile: Profile
  poems: StoredPoem[]
  tags: Tag[]
  collections: Collection[]
  collectionPoems: CollectionPoem[]
  favorites: Favorite[]
  poemSupports: { userId: string; poemId: string; createdAt: string }[]
  /** `authorId` es el id del perfil apoyado. */
  authorSupports: { userId: string; authorId: string; createdAt: string }[]
  verseComments: {
    id: string
    poemId: string
    userId: string
    line: number
    quote: string
    body: string
    createdAt: string
  }[]
  reports: { userId: string; poemId: string; category: string; detail: string; createdAt: string }[]
  /** Direcciones /autor/... abandonadas: reservadas y sin redirección. */
  retiredAccountNames: string[]
}

export function fresh(): Store {
  const now = new Date().toISOString()
  return {
    account: null,
    signedIn: false,
    profile: {
      id: LOCAL_USER_ID,
      accountName: 'yo',
      displayName: '',
      supportVisibility: 'private',
      createdAt: now,
      updatedAt: now,
    },
    poems: [],
    tags: [],
    collections: [],
    collectionPoems: [],
    favorites: [],
    poemSupports: [],
    authorSupports: [],
    verseComments: [],
    reports: [],
    retiredAccountNames: [],
  }
}

/** Datos guardados con versiones anteriores: rellena los campos nuevos. */
function upgrade(s: Store): Store {
  return {
    ...s,
    profile: { ...s.profile, supportVisibility: s.profile.supportVisibility ?? 'private' },
    poems: s.poems.map((p) => ({
      ...p,
      font: p.font ?? 'clasica',
      sensitive: p.sensitive ?? false,
      commentsEnabled: p.commentsEnabled ?? false,
    })),
  }
}

let cache: Store | null = null

export function readStore(): Store {
  if (cache) return cache
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      cache = upgrade({ ...fresh(), ...(JSON.parse(raw) as Partial<Store>) })
      return cache
    }
  } catch {
    // almacenamiento no disponible o corrupto: se empieza de cero en memoria
  }
  cache = fresh()
  return cache
}

/** Aplica un cambio de forma atómica: si no se puede persistir, no cambia nada. */
export function commit(mutate: (draft: Store) => void): void {
  const next = structuredClone(readStore())
  mutate(next)
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    throw new Error('No se pudo guardar en este navegador. Tu texto no se ha perdido: inténtalo de nuevo.')
  }
  cache = next
  emitDataChange()
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      // Cambios desde otra pestaña.
      cache = null
      emitDataChange()
    }
  })
}
