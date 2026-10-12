import type { Repositories } from './repositories'
import { localRepositories } from './local'

/** Punto único de acceso a los datos. En la fase 5 aquí se elegirá Supabase. */
export const repos: Repositories = localRepositories

export { onDataChange } from './local/store'
export type * from './types'
export type { PoemInput } from './repositories'
