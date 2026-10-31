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

describe('repositorio local: «Mi página»', () => {
  it('listMine devuelve lo privado, anónimo y con pseudónimo; la vista pública del autor, solo lo suyo y público', async () => {
    const pub = await repos.poems.save(base)
    const priv = await repos.poems.save({ ...base, visibility: 'private' })
    const anon = await repos.poems.save({ ...base, publicationIdentity: 'anonymous' })
    const pseu = await repos.poems.save({ ...base, publicationIdentity: 'pseudonym', displayedPseudonym: 'Gaviota' })

    const mine = (await repos.poems.listMine('published')).map((p) => p.id)
    expect(mine).toEqual(expect.arrayContaining([pub.id, priv.id, anon.id, pseu.id]))
    expect(mine).toHaveLength(4)

    const publicView = (await repos.poems.listPublic({ authorAccountName: 'lucia-perez' })).map((p) => p.id)
    expect(publicView).toEqual([pub.id])
  })
})

describe('repositorio local: denuncias', () => {
  it('no se denuncia el poema propio', async () => {
    const p = await repos.poems.save(base)
    await expect(repos.reports.report(p.id, { category: 'odio' })).rejects.toThrow('propio')
  })

  it('«Otro motivo» exige texto y el texto admite 50 palabras', async () => {
    const p = await repos.poems.save(base)
    await expect(repos.reports.report(p.id, { category: 'otro' })).rejects.toThrow('motivo')
    await expect(
      repos.reports.report(p.id, { category: 'plagio', detail: Array(51).fill('a').join(' ') }),
    ).rejects.toThrow('50 palabras')
  })
})

describe('repositorio local: denuncias a poemas ajenos', () => {
  it('se denuncia un poema de ejemplo y la segunda vez dice «Ya has denunciado»', async () => {
    vi.resetModules()
    vi.stubEnv('DEV', true)
    const dev = (await import('./index')).localRepositories
    const [ajeno] = await dev.poems.listPublic()
    await dev.reports.report(ajeno.id, { category: 'plagio' })
    await expect(dev.reports.report(ajeno.id, { category: 'plagio' })).rejects.toThrow('Ya has denunciado')
  })
})

describe('repositorio local: nombre público', () => {
  it('rechaza reservados (también como pseudónimo) y el vacío', async () => {
    await expect(repos.profiles.updateMine({ displayName: 'CISNE' })).rejects.toThrow('reservado')
    await expect(repos.profiles.updateMine({ displayName: '  ' })).rejects.toThrow('vacío')
    await expect(repos.profiles.updateMine({ primaryPseudonym: 'Anónimo' })).rejects.toThrow('reservado')
    await expect(
      repos.poems.save({ ...base, publicationIdentity: 'pseudonym', displayedPseudonym: 'Sin nombre' }),
    ).rejects.toThrow('reservado')
  })

  it('el primer cambio es libre, la dirección lo sigue y la antigua no se encuentra', async () => {
    const p = await repos.profiles.updateMine({ displayName: 'Lucía del Mar' })
    expect(p.accountName).toBe('lucia-del-mar')
    expect(p.displayNameChangedAt).toBeTruthy()
    expect((await repos.auth.account())?.accountName).toBe('lucia-del-mar')
    expect(await repos.profiles.getPublicByAccountName('lucia-perez')).toBeNull()
    expect((await repos.profiles.getPublicByAccountName('lucia-del-mar'))?.displayName).toBe('Lucía del Mar')
  })

  it('un segundo cambio antes de 30 días dice cuándo podrá', async () => {
    await repos.profiles.updateMine({ displayName: 'Lucía del Mar' })
    await expect(repos.profiles.updateMine({ displayName: 'Otra Lucía' })).rejects.toThrow(/30 días.*a partir del \d+ de/)
  })

  it('solo cambiar mayúsculas es libre y no cambia la dirección', async () => {
    const p = await repos.profiles.updateMine({ displayName: 'LUCÍA PÉREZ' })
    expect(p.accountName).toBe('lucia-perez')
    expect(p.displayNameChangedAt).toBeUndefined()
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
