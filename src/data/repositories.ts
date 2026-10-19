// Interfaces de repositorio. La UI solo conoce esto; hoy hay una implementación
// local (localStorage) y en la fase 5 se añade la de Supabase sin tocar la UI.
import type {
  Account,
  Collection,
  CollectionView,
  Poem,
  PoemStatus,
  PoemView,
  Profile,
  PublicationIdentity,
  MySupports,
  PoemFont,
  PublicProfile,
  Session,
  SupportState,
  Tag,
  VerseComment,
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
  font: PoemFont
  sensitive: boolean
  commentsEnabled: boolean
  /** Nombres de etiqueta; el repositorio los normaliza y deduplica. */
  tags: string[]
  /** Colección propia a la que añadirlo (si aún no está). */
  collectionId?: string
}

export type PoemSearch = {
  /** Texto libre: busca en título, versos, autor y etiquetas. */
  q?: string
  tag?: string
  /** `random` baraja con `seed`; `recent` ordena por fecha. */
  order: 'random' | 'recent'
  seed?: number
  /** `false` oculta los poemas «Cisne negro». */
  includeSensitive?: boolean
}

export interface AuthRepository {
  /** Sesión actual, o `null` si nadie ha entrado. */
  current(): Promise<Session | null>
  account(): Promise<Account | null>
  /** `null` si hay que confirmar el email antes de entrar. */
  signUp(input: { displayName: string; email: string; password: string }): Promise<Session | null>
  signIn(input: { email: string; password: string }): Promise<Session>
  signOut(): Promise<void>
  /** Envía un enlace para elegir otra contraseña. */
  requestPasswordReset(email: string): Promise<void>
  /** Cambia la contraseña de la sesión actual (también tras abrir ese enlace). */
  updatePassword(password: string): Promise<void>
  /** Borra la cuenta y todo lo suyo: poemas, colecciones y biblioteca. */
  deleteAccount(): Promise<void>
}

export interface PoemRepository {
  /** Poemas publicados y públicos, los más nuevos primero. */
  listPublic(filter?: { tag?: string; authorAccountName?: string }): Promise<PoemView[]>
  /** Búsqueda pública para Explorar. */
  search(query: PoemSearch): Promise<PoemView[]>
  /** Un poema, solo si es público o del usuario actual. */
  get(id: string): Promise<PoemView | null>
  /** Un poema propio, completo, para el editor. */
  getOwn(id: string): Promise<Poem | null>
  listMine(status: PoemStatus): Promise<PoemView[]>
  related(id: string, limit: number): Promise<PoemView[]>
  save(input: PoemInput): Promise<Poem>
  remove(id: string): Promise<void>
}

export type ProfilePatch = Partial<
  Pick<Profile, 'displayName' | 'primaryPseudonym' | 'bio' | 'links' | 'supportVisibility'>
>

export interface ProfileRepository {
  getMine(): Promise<Profile>
  updateMine(patch: ProfilePatch): Promise<Profile>
  getPublicByAccountName(accountName: string): Promise<PublicProfile | null>
  /** Pseudónimos que el usuario ya ha usado, para sugerirlos. */
  listPseudonyms(): Promise<string[]>
}

export interface TagRepository {
  /** Etiquetas existentes (públicas y propias), para sugerencias. */
  suggest(): Promise<Tag[]>
}

export type CollectionInput = { title: string; description?: string; visibility: Visibility }

export interface CollectionRepository {
  listMine(): Promise<CollectionView[]>
  /** Colecciones públicas de un autor, para su página. */
  listPublicByOwner(accountName: string): Promise<CollectionView[]>
  /** Una colección, solo si es pública o propia, con sus poemas en orden. */
  get(id: string): Promise<{ collection: CollectionView; poems: PoemView[] } | null>
  create(input: CollectionInput): Promise<Collection>
  update(id: string, input: CollectionInput): Promise<Collection>
  /** Borra la colección; los poemas siguen existiendo. */
  remove(id: string): Promise<void>
  /** Ids de mis colecciones que contienen el poema. */
  containing(poemId: string): Promise<string[]>
  addPoem(collectionId: string, poemId: string): Promise<void>
  removePoem(collectionId: string, poemId: string): Promise<void>
  /** Mueve un poema una posición arriba (-1) o abajo (+1). */
  movePoem(collectionId: string, poemId: string, delta: -1 | 1): Promise<void>
}

export interface FavoriteRepository {
  listIds(): Promise<string[]>
  list(): Promise<PoemView[]>
  /** Devuelve `true` si el poema queda guardado. */
  toggle(poemId: string): Promise<boolean>
}

export interface SupportRepository {
  poem(poemId: string): Promise<SupportState>
  /** Devuelve `true` si queda apoyado. */
  togglePoem(poemId: string): Promise<boolean>
  author(accountName: string): Promise<SupportState>
  toggleAuthor(accountName: string): Promise<boolean>
  /** Autores y poemas que apoyo. */
  listMine(): Promise<MySupports>
  unsupportPoem(poemId: string): Promise<void>
  unsupportAuthor(accountName: string): Promise<void>
}

export interface CommentRepository {
  /** Comentarios de un poema público con los comentarios abiertos. */
  list(poemId: string): Promise<VerseComment[]>
  add(poemId: string, input: { line: number; quote: string; body: string }): Promise<void>
  remove(commentId: string): Promise<void>
}

export type Repositories = {
  auth: AuthRepository
  poems: PoemRepository
  profiles: ProfileRepository
  tags: TagRepository
  collections: CollectionRepository
  favorites: FavoriteRepository
  supports: SupportRepository
  comments: CommentRepository
}
