import { describe, expect, it, vi } from 'vitest'
import { lazyRepositories, memoizeLoader } from './lazy'

describe('lazyRepositories', () => {
  it('espera a que la implementación esté cargada antes de llamar al método', async () => {
    let resolve!: (v: unknown) => void
    const load = vi.fn(() => new Promise((r) => (resolve = r)))
    const method = vi.fn((a: unknown) => `hola ${a}`)
    const repos = lazyRepositories<{ poems: { get: (a: string) => Promise<string> } }>(memoizeLoader(load))

    const p = repos.poems.get('x')
    await Promise.resolve()
    expect(method).not.toHaveBeenCalled()
    resolve({ poems: { get: method } })
    expect(await p).toBe('hola x')
    expect(method).toHaveBeenCalledWith('x')
  })

  it('carga una sola vez aunque haya varias llamadas', async () => {
    const load = vi.fn(() => Promise.resolve({ g: { m: () => 1 } }))
    const repos = lazyRepositories<{ g: { m: () => Promise<number> } }>(memoizeLoader(load))
    await Promise.all([repos.g.m(), repos.g.m()])
    await repos.g.m()
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('si la carga falla, la siguiente llamada reintenta y funciona', async () => {
    const load = vi
      .fn()
      .mockRejectedValueOnce(new Error('red caída'))
      .mockResolvedValueOnce({ g: { m: () => 'ok' } })
    const repos = lazyRepositories<{ g: { m: () => Promise<string> } }>(memoizeLoader(load))

    await expect(repos.g.m()).rejects.toThrow('red caída')
    expect(await repos.g.m()).toBe('ok')
    expect(load).toHaveBeenCalledTimes(2)
  })
})
