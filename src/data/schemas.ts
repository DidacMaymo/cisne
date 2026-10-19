import { z } from 'zod'

// Validación del formulario del editor. Los borradores solo exigen texto; al
// publicar también se valida la identidad con la que se firma.
const base = z.object({
  title: z.string().trim().max(120, 'El título admite hasta 120 caracteres.'),
  content: z
    .string()
    .refine((v) => v.trim().length > 0, 'Escribe el poema antes de guardarlo.')
    .refine((v) => v.length <= 20000, 'El poema es demasiado largo (máximo 20 000 caracteres).'),
  tags: z.array(z.string()).max(10, 'Usa como máximo 10 etiquetas.'),
  visibility: z.enum(['public', 'private']),
  identity: z.enum(['profile_name', 'pseudonym', 'anonymous']),
  displayName: z.string().trim(),
  pseudonym: z.string().trim(),
  collection: z.string(),
  newCollectionTitle: z.string().trim(),
  font: z.enum(['clasica', 'libro', 'pantalla', 'maquina', 'clara']),
  sensitive: z.boolean(),
})

type Form = z.infer<typeof base>

function checkCollection(v: Form, ctx: z.RefinementCtx) {
  if (v.collection === 'new' && v.newCollectionTitle.length < 1) {
    ctx.addIssue({ code: 'custom', path: ['newCollectionTitle'], message: 'Ponle un título a la colección nueva.' })
  }
  if (v.newCollectionTitle.length > 80) {
    ctx.addIssue({ code: 'custom', path: ['newCollectionTitle'], message: 'El título admite hasta 80 caracteres.' })
  }
}

export const draftSchema = base.superRefine(checkCollection)

export const publishSchema = base.superRefine((v, ctx) => {
  checkCollection(v, ctx)
  if (v.identity === 'profile_name' && v.displayName.length < 2) {
    ctx.addIssue({
      code: 'custom',
      path: ['displayName'],
      message: 'Escribe tu nombre público (al menos 2 caracteres) o elige firmar de otra forma.',
    })
  }
  if (v.identity === 'pseudonym' && (v.pseudonym.length < 2 || v.pseudonym.length > 40)) {
    ctx.addIssue({
      code: 'custom',
      path: ['pseudonym'],
      message: 'El pseudónimo debe tener entre 2 y 40 caracteres.',
    })
  }
})

export type PoemFormValues = Form
export type FieldErrors = Partial<Record<keyof Form, string>>

export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {}
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof Form
    if (!(key in out)) out[key] = issue.message
  }
  return out
}

export const collectionSchema = z.object({
  title: z.string().trim().min(1, 'Ponle un título a la colección.').max(80, 'El título admite hasta 80 caracteres.'),
  description: z.string().trim().max(400, 'La descripción admite hasta 400 caracteres.'),
  visibility: z.enum(['public', 'private']),
})

export const MAX_BIO_WORDS = 150

export function countWords(text: string): number {
  const t = text.trim()
  return t ? t.split(/\s+/).length : 0
}

const httpUrl = z
  .string()
  .trim()
  .refine((v) => {
    try {
      const u = new URL(v)
      return u.protocol === 'https:' || u.protocol === 'http:'
    } catch {
      return false
    }
  }, 'Escribe un enlace completo, que empiece por https://')

export const profileSchema = z.object({
  displayName: z.string().trim().min(2, 'Tu nombre público necesita al menos 2 caracteres.').max(60, 'Hasta 60 caracteres.'),
  primaryPseudonym: z.string().trim().max(40, 'Hasta 40 caracteres.'),
  bio: z
    .string()
    .trim()
    .refine((v) => countWords(v) <= MAX_BIO_WORDS, `La descripción admite hasta ${MAX_BIO_WORDS} palabras.`),
  links: z.array(httpUrl).max(4, 'Como máximo 4 enlaces.'),
})

const email = z.string().trim().email('Escribe un email válido.')

export const signUpSchema = z.object({
  displayName: z.string().trim().min(2, 'Al menos 2 caracteres.').max(60, 'Hasta 60 caracteres.'),
  email,
  password: z.string().min(8, 'La contraseña necesita al menos 8 caracteres.'),
})

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Escribe tu contraseña.'),
})

/** Errores de Zod como { campo: mensaje }, con índices de lista como `links.0`. */
export function toErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.')
    if (!(key in out)) out[key] = issue.message
  }
  return out
}
