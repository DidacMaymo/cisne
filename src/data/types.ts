// Modelo del dominio (brief §17). Los nombres de campo siguen las tablas de
// Supabase de la fase 5, pero en camelCase.

export type Visibility = 'public' | 'private'
export type PoemStatus = 'draft' | 'published'
export type PublicationIdentity = 'profile_name' | 'pseudonym' | 'anonymous'
/** Tipografía elegida para leer el poema (ver src/lib/poem-fonts.ts). */
export type PoemFont = 'clasica' | 'libro' | 'pantalla' | 'maquina' | 'clara'

export type Profile = {
  id: string
  accountName: string
  displayName: string
  primaryPseudonym?: string
  /** Cuándo cambió por última vez el nombre público (lo pone la BD). Sin valor: aún no lo ha cambiado. */
  displayNameChangedAt?: string
  bio?: string
  /** Enlaces a redes o web personal. Solo texto: aquí no hay fotografías. */
  links?: string[]
  birthDate?: string
  gender?: string
  pronouns?: string
  location?: string
  literaryInterests?: string[]
  /** Si los demás pueden ver cuánta gente te apoya. Privado por defecto. */
  supportVisibility: Visibility
  createdAt: string
  updatedAt: string
}

/** Lo único de un perfil que puede ver cualquiera. */
export type PublicProfile = Pick<Profile, 'accountName' | 'displayName' | 'bio' | 'links'>

/** Datos privados de la cuenta. El email nunca se muestra en público. */
export type Account = {
  email: string
  accountName: string
  createdAt: string
}

export type Session = { accountName: string; displayName: string }

export type Tag = {
  id: string
  name: string
  normalizedName: string
}

/** Poema tal y como lo ve su autor (editor). */
export type Poem = {
  id: string
  authorId: string
  title?: string
  content: string
  status: PoemStatus
  visibility: Visibility
  publicationIdentity: PublicationIdentity
  displayedPseudonym?: string
  font: PoemFont
  /** «Cisne negro»: toca temas sensibles (+18). */
  sensitive: boolean
  /** Si quien lee puede comentar sus versos. */
  commentsEnabled: boolean
  tags: Tag[]
  collectionId?: string
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

/**
 * Poema tal y como se muestra en la interfaz. No lleva `authorId`: la
 * identidad pública ya viene resuelta (y es «Anónimo» sin enlace cuando toca).
 */
export type PoemView = {
  id: string
  title?: string
  content: string
  authorName: string
  /** `null` si el poema es anónimo o va firmado con pseudónimo. */
  authorAccountName: string | null
  tags: Tag[]
  collection: { id: string; title: string } | null
  font: PoemFont
  sensitive: boolean
  commentsEnabled: boolean
  status: PoemStatus
  visibility: Visibility
  isOwner: boolean
  createdAt: string
  updatedAt: string
  publishedAt: string | null
}

export type Collection = {
  id: string
  ownerId: string
  title: string
  description?: string
  visibility: Visibility
  createdAt: string
  updatedAt: string
}

/** Colección tal y como se muestra: con su portada tipográfica y sus poemas. */
export type CollectionView = Collection & {
  ownerName: string
  /** `null` si el dueño aún no tiene página de autor. */
  ownerAccountName: string | null
  isOwner: boolean
  poemCount: number
}

export type CollectionPoem = {
  collectionId: string
  poemId: string
  position: number
}

/** Apoyo a un poema o a un autor. El número solo se ve si su autor lo hace público. */
export type SupportState = {
  supported: boolean
  /** `null` cuando el autor lo mantiene privado (y no eres tú). */
  count: number | null
  /** No se puede apoyar lo propio, ni a un autor sin página pública. */
  canSupport: boolean
}

/** Comentario anclado a un verso de un poema. */
export type VerseComment = {
  id: string
  /** Índice del verso (línea del texto, desde 0). */
  line: number
  /** Fragmento que se subrayó al comentar. */
  quote: string
  body: string
  authorName: string
  authorAccountName: string | null
  createdAt: string
  /** Quien lo escribió o el autor del poema pueden borrarlo. */
  canDelete: boolean
}

/** Lo que apoya el usuario actual, para poder retirarlo desde sus ajustes. */
export type MySupports = {
  authors: { accountName: string; displayName: string }[]
  /** `available` es falso si el poema dejó de ser público: su texto ya no se muestra. */
  poems: { id: string; title: string; authorName: string; available: boolean }[]
}

export type Favorite = {
  userId: string
  poemId: string
  createdAt: string
}
