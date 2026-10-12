// Modelo del dominio (brief §17). Los nombres de campo siguen las tablas de
// Supabase de la fase 5, pero en camelCase.

export type Visibility = 'public' | 'private'
export type PoemStatus = 'draft' | 'published'
export type PublicationIdentity = 'profile_name' | 'pseudonym' | 'anonymous'

export type Profile = {
  id: string
  accountName: string
  displayName: string
  primaryPseudonym?: string
  bio?: string
  avatarUrl?: string
  birthDate?: string
  gender?: string
  pronouns?: string
  location?: string
  websiteUrl?: string
  literaryInterests?: string[]
  createdAt: string
  updatedAt: string
}

/** Lo único de un perfil que puede ver cualquiera. */
export type PublicProfile = Pick<Profile, 'accountName' | 'displayName' | 'bio'>

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
  coverUrl?: string
  visibility: Visibility
  createdAt: string
  updatedAt: string
}

export type CollectionPoem = {
  collectionId: string
  poemId: string
  position: number
}

export type Favorite = {
  userId: string
  poemId: string
  createdAt: string
}
