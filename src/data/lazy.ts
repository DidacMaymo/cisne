type Methods = Record<string, (...args: unknown[]) => unknown>
type Impl = Record<string, Methods>

/**
 * Carga la implementación una sola vez y la comparte. Si la carga falla, no
 * se queda cacheado el error: la siguiente llamada vuelve a intentarlo.
 */
export function memoizeLoader(load: () => Promise<unknown>): () => Promise<Impl> {
  let loading: Promise<Impl> | null = null
  return () => {
    loading ??= load()
      .then((r) => r as Impl)
      .catch((e) => {
        loading = null
        throw e
      })
    return loading
  }
}

/** Proxy con la forma de los repositorios: cada método espera a la carga y devuelve una promesa. */
export function lazyRepositories<T extends object>(loadImpl: () => Promise<Impl>): T {
  return new Proxy({} as T, {
    get: (_, group: string) =>
      new Proxy({}, {
        get:
          (_g, method: string) =>
          (...args: unknown[]) =>
            loadImpl().then((r) => r[group][method](...args)),
      }),
  })
}
