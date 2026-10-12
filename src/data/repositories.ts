// Interfaces de repositorio. La UI solo conoce esto; hoy hay una implementación
// local (localStorage) y en la fase 5 se añade la de Supabase sin tocar la UI.
import type {
  Collection,
  Poem,
  PoemStatus,
  PoemView,
  Profile,
  PublicationIdentity,
  PublicProfile,
  Tag,
  Visibility,
} from './types'

export type PoemInput = {
  /** Sin id se crea; con id se edita (solo poemas propios). */
  id?: string
  title?: string
  content: string
  status: PoemStatus
  visibility: Visibility
  publicationIdentity: PublicationIdentity
  displayedPseudonym?: string
  /** Nombres de etiqueta; el repositorio los normaliza y deduplica. */
  tags: string[]
  collectionId?: string
}

export interface PoemRepository {
  /** Poemas publicados y públicos, los más nuevos primero. */
  listPublic(filter?: { tag?: string; authorAccountName?: string }): Promise<PoemView[]>
  /** Mezcla diversa y estable durante un día (`seed`), con máximo 2 por autor. */
  discover(seed: number, limit: number): Promise<PoemView[]>
  /** Un poema, solo si es público o del usuario actual. */
  get(id: string): Promise<PoemView | null>
  /** Un poema propio, completo, para el editor. */
  getOwn(id: string): Promise<Poem | null>
  listMine(status: PoemStatus): Promise<PoemView[]>
  related(id: string, limit: number): Promise<PoemView[]>
  save(input: PoemInput): Promise<Poem>
  remove(id: string): Promise<void>
}

export interface ProfileRepository {
  getMine(): Promise<Profile>
  updateMine(patch: Partial<Pick<Profile, 'displayName' | 'primaryPseudonym' | 'bio'>>): Promise<Profile>
  getPublicByAccountName(accountName: string): Promise<PublicProfile | null>
  /** Pseudónimos que el usuario ya ha usado, para sugerirlos. */
  listPseudonyms(): Promise<string[]>
}

export interface TagRepository {
  /** Etiquetas existentes (públicas y propias), para sugerencias. */
  suggest(): Promise<Tag[]>
}

export interface CollectionRepository {
  listMine(): Promise<Collection[]>
  create(input: { title: string }): Promise<Collection>
}

export interface FavoriteRepository {
  listIds(): Promise<string[]>
  /** Devuelve `true` si el poema queda guardado. */
  toggle(poemId: string): Promise<boolean>
}

export type Repositories = {
  poems: PoemRepository
  profiles: ProfileRepository
  tags: TagRepository
  collections: CollectionRepository
  favorites: FavoriteRepository
}
