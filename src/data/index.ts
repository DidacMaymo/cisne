import { createClient } from '@supabase/supabase-js'
import type { Repositories } from './repositories'
import { localRepositories } from './local'
import { supabaseRepositories } from './supabase'

const url = import.meta.env.VITE_SUPABASE_URL
// En proyectos antiguos de Supabase la clave pública se llama «anon key».
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Con las variables de Supabase, datos y cuentas reales. Sin ellas, modo
 * `local`: todo vive en este navegador (para desarrollar sin conexión).
 */
export const dataMode: 'local' | 'supabase' = url && key ? 'supabase' : 'local'

/** Punto único de acceso a los datos. */
export const repos: Repositories =
  dataMode === 'supabase' ? supabaseRepositories(createClient(url!, key!)) : localRepositories

export { onDataChange } from './events'
export type * from './types'
export type { CollectionInput, PoemInput } from './repositories'
