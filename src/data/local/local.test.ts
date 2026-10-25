import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PoemInput, Repositories } from '../repositories'

function memoryStorage() {
  const m = new Map<string, string>()
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
  }
}

const base: PoemInput = {
  title: 'Marea',
  content: 'sal en la lengua\nmarea alta',
  status: 'published',
  visibility: 'public',
  publicationIdentity: 'profile_name',
  font: 'clasica',
  sensitive: false,
  commentsEnabled: false,
  tags: [],
}

let repos: Repositories

beforeEach(async () => {
  vi.resetModules()
  vi.stubGlobal('localStorage', memoryStorage())
  vi.stubEnv('DEV', false) // sin poemas de ejemplo
  repos = (await import('./index')).localRepositories
  await repos.auth.signUp({ displayName: 'Lucía Pérez', email: 'l@x.es', password: 'secreto123' })
})

describe('repositorio local: visibilidad', () => {
  it('un poema publicado y público sale en listPublic y search', async () => {
    await repos.poems.save(base)
    expect(await repos.poems.listPublic()).toHaveLength(1)
    expect(await repos.poems.search({ q: 'marea', order: 'recent' })).toHaveLength(1)
  })

  it('un borrador no sale en listPublic ni en search', async () => {
    await repos.poems.save({ ...base, status: 'draft' })
    expect(await repos.poems.listPublic()).toHaveLength(0)
    expect(await repos.poems.search({ q: 'marea', order: 'recent' })).toHaveLength(0)
    expect(await repos.poems.search({ order: 'recent' })).toHaveLength(0)
  })

  it('un poema privado no sale en listPublic ni en search', async () => {
    await repos.poems.save({ ...base, visibility: 'private' })
    expect(await repos.poems.listPublic()).toHaveLength(0)
    expect(await repos.poems.search({ q: 'marea', order: 'recent' })).toHaveLength(0)
  })

  it('un poema privado deja de ser visible al salir de la sesión', async () => {
    const p = await repos.poems.save({ ...base, visibility: 'private' })
    await repos.auth.signOut()
    expect(await repos.poems.get(p.id)).toBeNull()
  })
})

describe('repositorio local: anonimato', () => {
  it('un poema anónimo no expone al autor', async () => {
    const p = await repos.poems.save({ ...base, publicationIdentity: 'anonymous' })
    const [view] = await repos.poems.listPublic()
    expect(view.authorName).toBe('Anónimo')
    expect(view.authorAccountName).toBeNull()
    expect(JSON.stringify(view)).not.toMatch(/Lucía|lucia/i)
    expect(await repos.poems.search({ q: 'lucia', order: 'recent' })).toHaveLength(0)
    const byAuthor = await repos.poems.listPublic({ authorAccountName: 'lucia-perez' })
    expect(byAuthor.map((x) => x.id)).not.toContain(p.id)
  })

  it('un poema con pseudónimo muestra solo el pseudónimo', async () => {
    await repos.poems.save({ ...base, publicationIdentity: 'pseudonym', displayedPseudonym: 'Gaviota' })
    const [view] = await repos.poems.listPublic()
    expect(view.authorName).toBe('Gaviota')
    expect(view.authorAccountName).toBeNull()
  })
})
