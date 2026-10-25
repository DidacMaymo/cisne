import { lazyRepositories, memoizeLoader } from './lazy'
import type { Repositories } from './repositories'

const url = import.meta.env.VITE_SUPABASE_URL
// En proyectos antiguos de Supabase la clave pública se llama «anon key».
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Con las variables de Supabase, datos y cuentas reales. Sin ellas, modo
 * `local`: todo vive en este navegador (para desarrollar sin conexión).
 */
export const dataMode: 'local' | 'supabase' = url && key ? 'supabase' : 'local'

/** Descarga la implementación (Supabase o local) la primera vez que hace falta, no al abrir la web. */
const loadImpl = memoizeLoader(() =>
  dataMode === 'supabase'
    ? Promise.all([import('@supabase/supabase-js'), import('./supabase')]).then(([{ createClient }, { supabaseRepositories }]) =>
        supabaseRepositories(createClient(url!, key!)),
      )
    : import('./local').then((m) => m.localRepositories),
)

/**
 * Mismas interfaces que `Repositories`, pero cada método espera a que se cargue
 * la implementación (todos devuelven una promesa).
 */
export const repos: Repositories = lazyRepositories<Repositories>(loadImpl)

export { onDataChange } from './events'
export type * from './types'
export type { CollectionInput, PoemInput } from './repositories'
