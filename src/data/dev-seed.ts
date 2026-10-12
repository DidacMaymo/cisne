// DATOS DE EJEMPLO SOLO PARA DESARROLLO. Se cargan únicamente con
// `import.meta.env.DEV` y nunca se guardan en el almacenamiento del usuario.
// Los textos son inventados para probar la interfaz: no son obras de nadie.
import type { Profile, Tag } from './types'
import type { StoredPoem } from './local/store'

const SEED_AUTHOR = 'seed-author'

const profile: Profile = {
  id: SEED_AUTHOR,
  accountName: 'ejemplo',
  displayName: 'Ejemplo de desarrollo',
  bio: 'Poemas de ejemplo para desarrollo. No son obras reales.',
  createdAt: '2026-01-01T10:00:00.000Z',
  updatedAt: '2026-01-01T10:00:00.000Z',
}

const tagNames = [
  'nostalgia',
  'infancia',
  'amor',
  'desamor',
  'duelo',
  'soledad',
  'naturaleza',
  'libertad',
  'esperanza',
  'vida',
  'melancolía',
]
const tags: Tag[] = tagNames.map((name) => ({ id: `seed-tag-${name}`, name, normalizedName: name }))
const tagIds = (...names: string[]) => names.map((n) => `seed-tag-${n}`)

type Draft = {
  n: number
  author?: string
  anonymous?: boolean
  title?: string
  content: string
  tags: string[]
  date: string
}

const drafts: Draft[] = [
  {
    n: 1,
    title: 'Casa de agua',
    tags: ['nostalgia', 'infancia'],
    date: '2026-10-10T09:00:00.000Z',
    content: `Mi casa era un río
que no sabía irse.
Las puertas se abrían hacia dentro
como las manos de quien perdona.

Hoy la busco en los charcos,
en el eco de una cuchara,
en la lluvia que aprende mi nombre
y lo olvida cada tarde.`,
  },
  {
    n: 2,
    tags: ['amor', 'desamor'],
    date: '2026-10-08T21:30:00.000Z',
    content: `No te escribo para que vuelvas.
Te escribo para que la noche
tenga dónde apoyar la cabeza.

Hay palabras que no piden nada:
se quedan junto a la lámpara
como un perro viejo.`,
  },
  {
    n: 3,
    title: 'Mapa de la ausencia',
    tags: ['duelo', 'soledad'],
    date: '2026-10-05T18:00:00.000Z',
    content: `Aquí estuvo tu abrigo.
Aquí, la silla que giraba
cuando te reías de mí.

Dibujo la casa con el dedo
sobre el polvo de la mesa:
la cocina, el pasillo,
la ventana donde el sol
te buscaba por costumbre.

Nadie ha movido nada.
Y sin embargo todo
queda un poco más lejos
cada mañana.`,
  },
  {
    n: 4,
    title: 'Lo que dice el mar',
    tags: ['naturaleza', 'libertad'],
    date: '2026-10-02T07:15:00.000Z',
    content: `El mar no explica.
Llega, se retira,
deja en la arena
una página en blanco.

Aprendo de él
a no pedir permiso
para volver.`,
  },
  {
    n: 5,
    title: 'Pequeña oración',
    tags: ['esperanza', 'vida'],
    date: '2026-09-28T12:00:00.000Z',
    content: `Que la luz de mañana
sea una mesa puesta.
Que el pan alcance.
Que alguien diga mi nombre
sin ninguna prisa.`,
  },
  {
    n: 6,
    author: 'seed-anon-1',
    anonymous: true,
    title: 'Tres de la madrugada',
    tags: ['soledad', 'melancolía'],
    date: '2026-10-09T03:00:00.000Z',
    content: `A estas horas el frigorífico
es el único que habla.
Yo le contesto con la luz abierta,
con el vaso, con la espalda.

Afuera, un coche
cruza la ciudad entera
sin encontrar a nadie.`,
  },
  {
    n: 7,
    author: 'seed-anon-2',
    anonymous: true,
    title: 'Después',
    tags: ['duelo', 'esperanza'],
    date: '2026-10-01T16:45:00.000Z',
    content: `Después de todo
queda el patio,
la ropa tendida,
una gallina que no sabe nada.

Y queda también
esta manera torpe
de seguir.`,
  },
  {
    n: 8,
    title: 'Rutina',
    tags: ['vida', 'melancolía'],
    date: '2026-09-25T08:00:00.000Z',
    content: `Lunes: el café, el tren, la luz de neón.
Martes: el tren, la luz, el café.
Miércoles: alguien sonríe en el andén
y por un momento
la semana tiene ventanas.`,
  },
]

const poems: StoredPoem[] = drafts.map((d) => ({
  id: `seed-poem-${d.n}`,
  authorId: d.author ?? SEED_AUTHOR,
  title: d.title,
  content: d.content,
  status: 'published',
  visibility: 'public',
  publicationIdentity: d.anonymous ? 'anonymous' : 'profile_name',
  tagIds: tagIds(...d.tags),
  createdAt: d.date,
  updatedAt: d.date,
  publishedAt: d.date,
}))

export const devSeed = { profiles: [profile], tags, poems }
