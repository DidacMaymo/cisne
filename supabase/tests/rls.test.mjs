// Prueba la migración de CISNE en PGlite con un «Supabase» mínimo simulado.
import { PGlite } from '@electric-sql/pglite'
import { readdirSync, readFileSync } from 'node:fs'

// Aplica todas las migraciones en orden.
const dir = new URL('../migrations/', import.meta.url)
const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()
let sql = files.map((f) => readFileSync(new URL(f, dir), 'utf8')).join('\n')

const stub = `
create schema extensions;
-- Diccionario y función que imitan a la extensión unaccent (no existe en PGlite).
create text search dictionary extensions.unaccent (template = pg_catalog.simple);
create function extensions.unaccent(regdictionary, text) returns text language sql immutable as
  $$ select translate($2, 'áéíóúüñÁÉÍÓÚÜÑàèìòù', 'aeiouunAEIOUUNaeiou') $$;
`
sql = sql.replace('create extension if not exists unaccent with schema extensions;', () => stub)

const db = new PGlite()
await db.exec(`
  create role anon nologin;
  create role authenticated nologin;
  create schema auth;
  grant usage on schema auth to anon, authenticated;
  grant usage on schema public to anon, authenticated;
  create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}');
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant execute on function auth.uid() to anon, authenticated;
  -- Como en Supabase: permisos por defecto sobre lo que se cree en public.
  alter default privileges in schema public grant all on tables to anon, authenticated;
  alter default privileges in schema public grant all on functions to anon, authenticated;
`)
await db.exec(sql)
console.log('✓ migración aplicada')

const ANA = '11111111-1111-1111-1111-111111111111'
const BEA = '22222222-2222-2222-2222-222222222222'
await db.exec(`
  insert into auth.users (id, email, raw_user_meta_data) values
    ('${ANA}', 'ana@x.test', '{"display_name":"Ana Lía"}'),
    ('${BEA}', 'bea@x.test', '{"display_name":"Bea Sol"}');
`)

let failures = 0
function check(name, ok, extra = '') {
  console.log(`${ok ? '✓' : '✗'} ${name}${extra ? ' — ' + extra : ''}`)
  if (!ok) failures++
}

async function as(user, fn) {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${user ?? ''}', false);`)
  await db.exec(user ? 'set role authenticated' : 'set role anon')
  try {
    return await fn()
  } finally {
    await db.exec('reset role')
  }
}
const q = async (text, params) => (await db.query(text, params)).rows
async function fails(text, params) {
  try {
    await db.query(text, params)
    return null
  } catch (e) {
    return e.message
  }
}

// Perfiles creados por el trigger, con nombres de cuenta únicos.
const profiles = await q('select id, account_name, display_name from public.profiles order by account_name')
check('perfiles creados al registrarse', profiles.length === 2, profiles.map((p) => p.account_name).join(', '))
check('nombre de cuenta único', profiles[0].account_name === 'ana-lia' && profiles[1].account_name === 'bea-sol')

// Ana publica: uno con su nombre, uno anónimo, uno privado, un borrador y uno con pseudónimo.
// Los dos últimos argumentos (fuente y Cisne negro) son opcionales aquí.
const save = (args) => {
  const full = [...args.slice(0, 9), args[9] ?? 'clasica', args[10] ?? false, args[11] ?? false]
  return q('select public.save_poem($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) as id', full).then((r) => r[0].id)
}
const ids = await as(ANA, async () => ({
  named: await save([null, 'Casa de agua', 'Mi casa era un río\n\nque no sabía irse', 'published', 'public', 'profile_name', null, ['#Nostalgia ', 'infancia'], null]),
  anon: await save([null, 'Secreto', 'Nadie sabrá que lo escribí', 'published', 'public', 'anonymous', null, ['nostalgia'], null]),
  priv: await save([null, 'Privado', 'Solo para mí', 'published', 'private', 'profile_name', null, ['diario-intimo'], null]),
  draft: await save([null, null, 'Borrador sin título', 'draft', 'public', 'profile_name', null, [], null]),
  pseudo: await save([null, 'Máscara', 'Con otro nombre', 'published', 'public', 'pseudonym', 'La Garza', [], null]),
  dark: await save([null, 'Noche', 'Un poema que duele', 'published', 'public', 'profile_name', null, [], null, 'maquina', true]),
}))
check('save_poem crea los poemas', Object.values(ids).every(Boolean))

// Lectura pública (anon).
await as(null, async () => {
  const pub = await q('select * from public.public_poems order by title')
  check('público: solo publicados y públicos', pub.length === 4, pub.map((p) => p.title).join(', '))
  const anon = pub.find((p) => p.title === 'Secreto')
  check('anónimo: sin autor ni enlace', anon.author_name === 'Anónimo' && anon.author_account_name === null)
  check('la vista no expone author_id', !('author_id' in anon))
  const pseudo = pub.find((p) => p.title === 'Máscara')
  check('pseudónimo sin enlace al perfil', pseudo.author_name === 'La Garza' && pseudo.author_account_name === null)
  const named = pub.find((p) => p.title === 'Casa de agua')
  check('saltos de línea intactos', named.content === 'Mi casa era un río\n\nque no sabía irse')
  check('etiquetas normalizadas', JSON.stringify(named.tags.map((t) => t.normalizedName)) === '["infancia","nostalgia"]')
  check('anon no lee la tabla poems', (await q('select * from public.poems')).length === 0)
  check('anon no lee perfiles (pseudónimo privado)', (await q('select * from public.profiles')).length === 0)
  const tags = await q('select normalized_name from public.public_tags order by 1')
  check('etiquetas de poemas privados no se publican', !tags.some((t) => t.normalized_name === 'diario-intimo'))
  const s1 = await q(`select title from public.search_public_poems('RIO', null)`)
  check('búsqueda sin tildes ni mayúsculas', s1.length === 1 && s1[0].title === 'Casa de agua')
  const s2 = await q(`select title from public.search_public_poems('', 'nostalgia')`)
  check('filtro por etiqueta', s2.length === 2)
  const s3 = await q(`select title from public.search_public_poems('ana lia', null)`)
  check('búsqueda por autor no destapa anónimos', s3.length > 0 && !s3.some((x) => ['Secreto', 'Máscara'].includes(x.title)))
  const s4 = await q(`select title from public.search_public_poems('solo para mi', null)`)
  check('la búsqueda no encuentra privados', s4.length === 0)
  const [dark] = await q(`select font, sensitive from public.public_poems where title = 'Noche'`)
  check('fuente y Cisne negro en la vista', dark.font === 'maquina' && dark.sensitive === true)
  const all = await q(`select title from public.search_public_poems('', null, 500, true)`)
  const safe = await q(`select title from public.search_public_poems('', null, 500, false)`)
  check('filtro Cisne negro', all.some((x) => x.title === 'Noche') && !safe.some((x) => x.title === 'Noche'))
  const st = (await q('select public.poem_support_state($1) as s', [ids.named]))[0].s
  check('anon ve el estado sin número (privado por defecto)', st.count === null && st.supported === false)
  check('anon no puede apoyar', !!(await fails('select public.toggle_poem_support($1)', [ids.named])))
  const priv = (await q('select public.poem_support_state($1) as s', [ids.priv]))[0].s
  check('un privado ajeno no se puede apoyar', priv.canSupport === false)
  check('anon no puede guardar poemas', !!(await fails(`select public.save_poem(null,null,'x','published','public','anonymous',null,'{}',null,'clasica',false,false)`)))
})

// Bea: no ve lo privado de Ana, no puede tocarlo.
await as(BEA, async () => {
  check('Bea no ve poemas de Ana en la tabla', (await q('select * from public.poems')).length === 0)
  check('Bea no puede editar el poema de Ana', !!(await fails(
    `select public.save_poem($1,'hack','x','published','public','profile_name',null,'{}',null,'clasica',false,false)`, [ids.named])))
  const del = await db.query('delete from public.poems where id = $1', [ids.named])
  check('Bea no puede borrar el poema de Ana', del.affectedRows === 0)
  check('Bea no ve el perfil de Ana', (await q('select * from public.profiles where id = $1', [ANA])).length === 0)
  check('Bea puede guardar un poema público', !(await fails('insert into public.favorites (poem_id) values ($1)', [ids.named])))
  check('Bea no puede guardar uno privado', !!(await fails('insert into public.favorites (poem_id) values ($1)', [ids.priv])))
  check('Bea no puede guardar un borrador', !!(await fails('insert into public.favorites (poem_id) values ($1)', [ids.draft])))
  check('favorito con user_id ajeno rechazado', !!(await fails('insert into public.favorites (user_id, poem_id) values ($1, $2)', [ANA, ids.anon])))
  // Antología de Bea con el anónimo de Ana: aquí sí puede salir (no delata a nadie).
  const [{ id: col }] = await q(`insert into public.collections (title, visibility) values ('Antología', 'public') returning id`)
  await q('select public.add_poem_to_collection($1, $2)', [col, ids.anon])
  await q('select public.add_poem_to_collection($1, $2)', [col, ids.named])
  check('Bea no puede añadir un privado', !!(await fails('select public.add_poem_to_collection($1, $2)', [col, ids.priv])))
  await q('select public.move_collection_poem($1, $2, -1)', [col, ids.named])
  const order = await q('select poem_id from public.collection_poems where collection_id = $1 order by position', [col])
  check('reordenar colección', order[0].poem_id === ids.named)
  check('Bea no puede cambiar su nombre de cuenta', !!(await fails(`update public.profiles set account_name = 'otra' where id = $1`, [BEA])))
  // Apoyos
  check('Bea apoya un poema de Ana', (await q('select public.toggle_poem_support($1) as on', [ids.named]))[0].on === true)
  check('Bea apoya a Ana', (await q(`select public.toggle_author_support('ana-lia') as on`))[0].on === true)
  check('Bea no puede apoyarse a sí misma', !!(await fails(`select public.toggle_author_support('bea-sol')`)))
  check('Bea no puede apoyar un privado', !!(await fails('select public.toggle_poem_support($1)', [ids.priv])))
  const bst = (await q('select public.poem_support_state($1) as s', [ids.named]))[0].s
  check('Bea ve que apoya, sin ver el número (privado)', bst.supported === true && bst.count === null)
  check('Bea no puede insertar apoyos a mano', !!(await fails('insert into public.poem_supports (poem_id) values ($1)', [ids.anon])))
  check('Bea no ve quién más apoya', (await q('select * from public.poem_supports where user_id <> $1', [BEA])).length === 0)
  // Descripción: hasta 150 palabras.
  const words = (n) => Array.from({ length: n }, () => 'verso').join(' ')
  check('bio de 150 palabras: sí', !(await fails('update public.profiles set bio = $1 where id = $2', [words(150), BEA])))
  check('bio de 151 palabras: no', !!(await fails('update public.profiles set bio = $1 where id = $2', [words(151), BEA])))
  check('Bea sí puede editar su bio', !(await fails(`update public.profiles set bio = 'hola' where id = $1`, [BEA])))
})

// Colección pública de Ana con su anónimo: el anónimo no debe aparecer.
await as(ANA, async () => {
  const [{ id: col }] = await q(`insert into public.collections (title, visibility) values ('Mis poemas', 'public') returning id`)
  for (const id of [ids.named, ids.anon, ids.priv]) await q('select public.add_poem_to_collection($1, $2)', [col, id])
  await as(null, async () => {
    const shown = await q('select title from public.public_collection_poems where collection_id = $1', [col])
    check('colección pública del autor oculta su anónimo y su privado', shown.length === 1 && shown[0].title === 'Casa de agua')
    const [c] = await q('select poem_count, owner_account_name from public.public_collections where id = $1', [col])
    check('recuento coherente', c.poem_count === 1)
    const [p] = await q('select collection from public.public_poems where id = $1', [ids.anon])
    check('el anónimo no dice «Del poemario»', p.collection === null)
    const [n] = await q('select collection from public.public_poems where id = $1', [ids.named])
    check('el firmado sí', n.collection?.title === 'Mis poemas')
  })
})
await as(ANA, async () => {
  // Publicar fija fecha; editar la conserva.
  const [{ published_at: first }] = await q('select published_at from public.poems where id = $1', [ids.named])
  await save([ids.named, 'Casa de agua', 'Mi casa era un río', 'published', 'public', 'profile_name', null, [], null])
  const [{ published_at: again }] = await q('select published_at from public.poems where id = $1', [ids.named])
  check('editar conserva la fecha de publicación', +first === +again)
})

// Bea borra su cuenta: desaparece todo lo suyo.
// Ana ve sus números aunque sean privados; al hacerlos públicos, los ven todos.
await as(ANA, async () => {
  const s = (await q('select public.poem_support_state($1) as s', [ids.named]))[0].s
  check('la autora ve su número aunque sea privado', s.count === 1 && s.canSupport === false)
  await q(`update public.profiles set support_visibility = 'public' where id = $1`, [ANA])
})
await as(null, async () => {
  const p = (await q('select public.poem_support_state($1) as s', [ids.named]))[0].s
  const a = (await q(`select public.author_support_state('ana-lia') as s`))[0].s
  check('público: número del poema visible', p.count === 1)
  check('público: número del autor visible', a.count === 1)
  const an = (await q('select public.poem_support_state($1) as s', [ids.anon]))[0].s
  check('un anónimo nunca muestra su número', an.count === null)
})

// Comentarios en los versos.
const comments = await as(ANA, async () => ({
  open: await save([null, 'Abierto', 'primer verso\nsegundo verso', 'published', 'public', 'profile_name', null, [], null, 'clasica', false, true]),
  closedPriv: await save([null, 'Cerrado', 'nada', 'published', 'private', 'profile_name', null, [], null, 'clasica', false, true]),
}))
let beaComment
await as(BEA, async () => {
  beaComment = (await q(`select public.add_verse_comment($1, 1, 'segundo', 'Qué bonito') as id`, [comments.open]))[0].id
  check('Bea comenta un verso', !!beaComment)
  check('no se comenta un verso que no existe', !!(await fails(`select public.add_verse_comment($1, 5, '', 'x')`, [comments.open])))
  check('no se comenta un poema con comentarios cerrados', !!(await fails(`select public.add_verse_comment($1, 0, '', 'x')`, [ids.named])))
  check('no se comenta un poema privado', !!(await fails(`select public.add_verse_comment($1, 0, '', 'x')`, [comments.closedPriv])))
  const words = (n) => Array.from({ length: n }, () => 'verso').join(' ')
  check('comentario de 50 palabras: sí', !(await fails(`select public.add_verse_comment($1, 0, '', $2)`, [comments.open, words(50)])))
  check('comentario de 51 palabras: no', !!(await fails(`select public.add_verse_comment($1, 0, '', $2)`, [comments.open, words(51)])))
  check('comentario vacío rechazado', !!(await fails(`select public.add_verse_comment($1, 0, '', '   ')`, [comments.open])))
  check('Bea no lee la tabla de comentarios', (await q('select * from public.verse_comments')).length === 0)
  const [c] = await q('select * from public.public_verse_comments where id = $1', [beaComment])
  check('la vista muestra autor y que Bea puede borrar el suyo', c.author_name === 'Bea Sol' && c.can_delete === true && c.line === 1)
  check('la vista no expone user_id', !('user_id' in c))
  // Dejar de apoyar desde los ajustes.
  const mine = (await q('select public.my_supports() as s'))[0].s
  check('Bea lista lo que apoya', mine.authors.length === 1 && mine.poems.length === 1 && mine.poems[0].available === true)
  await q('select public.unsupport_poem($1)', [ids.named])
  await q(`select public.unsupport_author('ana-lia')`)
  const after = (await q('select public.my_supports() as s'))[0].s
  check('Bea deja de apoyar poema y autora', after.authors.length === 0 && after.poems.length === 0)
})
await as(null, async () => {
  const [c] = await q('select can_delete from public.public_verse_comments where id = $1', [beaComment])
  check('anon ve el comentario sin poder borrarlo', c.can_delete === false)
  check('anon no puede comentar', !!(await fails(`select public.add_verse_comment($1, 0, '', 'x')`, [comments.open])))
})
await as(ANA, async () => {
  const [c] = await q('select can_delete from public.public_verse_comments where id = $1', [beaComment])
  check('la autora del poema puede borrar cualquier comentario', c.can_delete === true)
  await q('select public.delete_verse_comment($1)', [beaComment])
  check('comentario borrado', (await q('select * from public.public_verse_comments where id = $1', [beaComment])).length === 0)
})
// Bea no puede borrar un comentario de Ana en un poema de Ana.
const anaComment = await as(ANA, async () =>
  (await q(`select public.add_verse_comment($1, 0, '', 'Nota de la autora') as id`, [comments.open]))[0].id,
)
await as(BEA, async () => {
  check('no se borran comentarios ajenos de poemas ajenos', !!(await fails('select public.delete_verse_comment($1)', [anaComment])))
})
// Cerrar los comentarios los oculta (no los borra).
await as(ANA, () =>
  save([comments.open, 'Abierto', 'primer verso\nsegundo verso', 'published', 'public', 'profile_name', null, [], null, 'clasica', false, false]),
)
await as(null, async () => {
  check('cerrar comentarios los oculta', (await q('select * from public.public_verse_comments where id = $1', [anaComment])).length === 0)
})

// Denuncias.
await as(null, async () => {
  check('anon no puede denunciar', !!(await fails(`select public.report_poem($1, 'odio')`, [ids.named])))
  check('anon no puede insertar en reports', !!(await fails(`insert into public.reports (poem_id, reason) values ($1, 'x')`, [ids.named])))
})
await as(BEA, async () => {
  const words = (n) => Array.from({ length: n }, () => 'palabra').join(' ')
  check('Bea no puede insertar en reports a mano', !!(await fails(`insert into public.reports (reporter_id, poem_id, reason) values ($1, $2, 'x')`, [BEA, ids.named])))
  check('motivo desconocido rechazado', !!(await fails(`select public.report_poem($1, 'spam')`, [ids.named])))
  check('«Otro motivo» exige texto', !!(await fails(`select public.report_poem($1, 'otro', '  ')`, [ids.named])))
  check('el texto admite 50 palabras, no 51', !!(await fails(`select public.report_poem($1, 'otro', $2)`, [ids.named, words(51)])))
  check('no se denuncia un privado ajeno', !!(await fails(`select public.report_poem($1, 'odio')`, [ids.priv])))
  check('no se denuncia un borrador ajeno', !!(await fails(`select public.report_poem($1, 'odio')`, [ids.draft])))
  check('Bea denuncia un poema público', !(await fails(`select public.report_poem($1, 'plagio', $2)`, [ids.named, words(50)])))
  const again = await fails(`select public.report_poem($1, 'odio')`, [ids.named])
  check('denunciar dos veces: mensaje claro', !!again && again.includes('Ya has denunciado'), again ?? '')
  check('Bea denuncia otro poema con «Otro motivo»', !(await fails(`select public.report_poem($1, 'otro', 'Me parece mal')`, [ids.anon])))
  check('Bea no puede leer reports', (await q('select * from public.reports').catch(() => [])).length === 0)
})
await as(ANA, async () => {
  const own = await fails(`select public.report_poem($1, 'odio')`, [ids.named])
  check('no se denuncia el poema propio', !!own && own.includes('propio'), own ?? '')
  check('Ana no puede leer reports', (await q('select * from public.reports').catch(() => [])).length === 0)
})
{
  const rows = await q('select category, reason, reporter_id from public.reports order by created_at, reason')
  check('las denuncias quedan legibles para el panel', rows.length === 2 && rows.some((r) => r.reason === 'Otro motivo — Me parece mal' && r.category === 'otro'))
}

// Nombres públicos únicos, reservados, límite de 30 días y direcciones retiradas (F27).
const CARLA = '33333333-3333-3333-3333-333333333333'
const DANI = '44444444-4444-4444-4444-444444444444'
await db.exec(`
  insert into auth.users (id, email, raw_user_meta_data) values
    ('${CARLA}', 'carla@x.test', '{"display_name":"  ANA   LIA "}'),
    ('${DANI}', 'dani@x.test', '{"display_name":"Cisne"}');
`)
{
  const rows = await q('select id, display_name, account_name from public.profiles where id in ($1, $2)', [CARLA, DANI])
  check('alta con nombre ya usado (otras mayúsculas, sin tilde) o reservado: perfil sin nombre, registro intacto',
    rows.length === 2 && rows.every((r) => r.display_name === '' && /^autor(-\d+)?$/.test(r.account_name)))
}
const nameOf = async (id) => (await q('select display_name, account_name, display_name_changed_at as at from public.profiles where id = $1', [id]))[0]

await as(BEA, async () => {
  const setName = (name) => fails('update public.profiles set display_name = $1 where id = $2', [name, BEA])
  check('nombre ya usado por otra persona: rechazado', (await setName('Ana Lía')) !== null)
  check('…también con otras mayúsculas y sin tildes', (await setName('  ANA  lia ')) !== null)
  const msg = await setName('ANA LIA')
  check('mensaje claro de nombre ocupado', !!msg && msg.includes('ya lo usa otra persona'), msg ?? '')
  for (const r of ['CISNE', 'Anónimo', 'sin   NOMBRE', 'Administración', 'Equipo de Cisne']) {
    check(`nombre reservado «${r}» rechazado`, ((await setName(r)) ?? '').includes('reservado'))
  }
  check('el nombre no puede quedar vacío', !!(await setName('   ')))
  check('Bea no puede escribir la fecha del último cambio',
    !!(await fails(`update public.profiles set display_name_changed_at = null where id = $1`, [BEA])))
  const own = await nameOf(BEA)
  check('tras los rechazos su nombre y su fecha siguen igual', own.display_name === 'Bea Sol' && own.at === null)
  // Solo cambian mayúsculas: mismo nombre, no cuenta como cambio.
  check('cambiar solo mayúsculas es libre', !(await setName('BEA SOL')) && (await nameOf(BEA)).at === null)
})
await as(ANA, async () => {
  const setName = (name) => fails('update public.profiles set display_name = $1 where id = $2', [name, ANA])
  check('Ana no puede escribir account_name ni la fecha',
    !!(await fails(`update public.profiles set account_name = 'x' where id = $1`, [ANA])) &&
      !!(await fails(`update public.profiles set display_name_changed_at = now() where id = $1`, [ANA])))
  check('el primer cambio de nombre es libre', !(await setName('Ana Marea')))
  const a = await nameOf(ANA)
  check('la dirección sigue al nombre y la BD pone la fecha', a.account_name === 'ana-marea' && a.at !== null)
  const again = await setName('Ana Otra')
  check('segundo cambio inmediato: rechazado con la fecha', !!again && again.includes('30 días') && /\d{1,2} de \w+ de \d{4}/.test(again), again ?? '')
  check('la tabla de direcciones retiradas no se lee',
    !!(await fails('select * from public.retired_account_names')))
  check('ni se escribe', !!(await fails(`insert into public.retired_account_names (account_name, user_id) values ('zz', $1)`, [ANA])))
})
await as(null, async () => {
  check('la dirección antigua da «no encontrado»', (await q(`select * from public.public_profiles where account_name = 'ana-lia'`)).length === 0)
  check('la nueva funciona', (await q(`select * from public.public_profiles where account_name = 'ana-marea'`)).length === 1)
  check('anon no lee retired_account_names', !!(await fails('select * from public.retired_account_names')))
  const [p] = await q(`select author_account_name from public.public_poems where title = 'Casa de agua'`)
  check('los poemas enlazan a la dirección nueva', p.author_account_name === 'ana-marea')
})
// Pasados 30 días puede volver a cambiarlo; la dirección anterior sigue reservada.
await db.exec(`update public.profiles set display_name_changed_at = now() - interval '31 days' where id = '${ANA}'`)
await as(ANA, async () => {
  check('pasados 30 días puede cambiarlo otra vez', !(await fails('update public.profiles set display_name = $1 where id = $2', ['Ana del Mar', ANA])))
  check('y su dirección cambia otra vez', (await nameOf(ANA)).account_name === 'ana-del-mar')
})
await as(BEA, async () => {
  // El nombre «Ana Lía» ya está libre, pero la dirección ana-lia sigue reservada para siempre.
  check('Bea puede usar el nombre que Ana dejó', !(await fails('update public.profiles set display_name = $1 where id = $2', ['Ana Lía', BEA])))
  const b = await nameOf(BEA)
  check('pero no la dirección antigua de Ana (reservada)', b.account_name === 'ana-lia-2' && b.at !== null, b.account_name)
  check('y no puede volver a cambiar hasta pasados 30 días', !!(await fails('update public.profiles set display_name = $1 where id = $2', ['Bea Sol', BEA])))
})
await as(null, async () => {
  check('la dirección retirada no redirige ni aparece para nadie', (await q(`select * from public.public_profiles where account_name in ('ana-marea', 'ana-lia')`)).length === 0)
})
// Primer nombre de quien se registró sin él: libre y no estrena el plazo.
await as(CARLA, async () => {
  check('quien no tenía nombre puede elegir uno', !(await fails('update public.profiles set display_name = $1 where id = $2', ['Carla Río', CARLA])))
  const c = await nameOf(CARLA)
  check('elegir el primer nombre no cuenta como cambio', c.at === null && c.account_name === 'carla-rio')
  check('el primer cambio real después sigue libre', !(await fails('update public.profiles set display_name = $1 where id = $2', ['Carla Mar', CARLA])))
})
// Duplicados preexistentes: se respetan y no rompen nada.
await db.exec(`alter table public.profiles disable trigger profiles_name_guard`)
await db.exec(`update public.profiles set display_name = 'Carla Mar' where id = '${DANI}'`)
await db.exec(`alter table public.profiles enable trigger profiles_name_guard`)
await as(DANI, async () => {
  check('un duplicado preexistente puede seguir editando su perfil', !(await fails(`update public.profiles set bio = 'hola', display_name = 'Carla Mar' where id = $1`, [DANI])))
  check('pero no puede pasar a otro nombre ocupado', !!(await fails('update public.profiles set display_name = $1 where id = $2', ['Ana del Mar', DANI])))
})

// Pseudónimos: libres, pero no el nombre público de otra persona ni uno reservado.
await as(BEA, async () => {
  const withPseudo = (name, id = null) =>
    fails(`select public.save_poem($1,'t','x','published','public','pseudonym',$2,'{}',null,'clasica',false,false)`, [id, name])
  const taken = await withPseudo('  ANA del mar ')
  check('poema con el nombre público de otra persona como pseudónimo: rechazado', !!taken && taken.includes('nombre público de otra persona'), taken ?? '')
  check('también como borrador', !!(await fails(`select public.save_poem(null,'t','x','draft','public','pseudonym','Ana del Mar','{}',null,'clasica',false,false)`)))
  check('pseudónimo reservado rechazado', ((await withPseudo('Anónimo')) ?? '').includes('reservado'))
  check('pseudónimo libre aceptado', !(await withPseudo('La Garza')))
  check('el mismo pseudónimo se puede repetir entre poemas', !(await withPseudo('La Garza')))
  check('pseudónimo habitual con nombre ajeno: rechazado', !!(await fails('update public.profiles set primary_pseudonym = $1 where id = $2', ['ana DEL mar', BEA])))
  check('pseudónimo habitual reservado: rechazado', !!(await fails('update public.profiles set primary_pseudonym = $1 where id = $2', ['Cisneverso', BEA])))
  check('pseudónimo habitual libre: aceptado', !(await fails('update public.profiles set primary_pseudonym = $1 where id = $2', ['Gaviota', BEA])))
})

await as(BEA, () => q('select public.delete_my_account()'))
const left = await q(`select (select count(*) from public.profiles where id = $1)::int as p,
  (select count(*) from public.collections where owner_id = $1)::int as c,
  (select count(*) from public.favorites where user_id = $1)::int as f`, [BEA])
check('borrar cuenta borra perfil, colecciones y favoritos', left[0].p === 0 && left[0].c === 0 && left[0].f === 0)

console.log(failures ? `\n${failures} comprobaciones fallaron` : '\nTodo correcto')
process.exit(failures ? 1 : 0)
