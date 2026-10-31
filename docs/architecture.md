# Arquitectura

## Visión general

```
Navegador ──► Cloudflare Pages  (dist/: HTML/JS/CSS estáticos de este repo)
    │
    └──────► Supabase  (Postgres + Auth; API REST/RPC generada a partir del esquema)
```

| En un monolito Spring | En CISNE |
|---|---|
| Controllers + Services + JPA | La API que Supabase genera a partir de tablas, vistas y funciones SQL |
| `@PreAuthorize` / Spring Security | **RLS** (Row Level Security): políticas en Postgres que deciden fila a fila quién lee o escribe. Se aplican aunque alguien llame a la API a mano |
| Lógica de negocio en un `@Service` transaccional | Funciones SQL (`save_poem`, `add_verse_comment`…) llamadas por RPC |
| Thymeleaf | React en el navegador |
| Interfaz `Repository` + implementaciones | Igual: `src/data/repositories.ts` + `local/` y `supabase/` |
| Flyway | `supabase/migrations/` |

## Frontend

```
src/
  main.tsx, App.tsx      arranque y rutas (React Router)
  pages/                 una pantalla por ruta
  components/            piezas reutilizables (editor/, comments/, layout/, brand/)
  hooks/                 useQuery, useSession, useSavedIds
  lib/                   lógica pura: formato, enlaces, texto y marcado del poema, fuentes
  data/
    types.ts             tipos del dominio
    repositories.ts      interfaces (contrato único para la UI)
    index.ts             elige implementación: supabase si hay variables, si no local
    local/               implementación sobre localStorage (+ dev-seed en desarrollo)
    supabase/            implementación con @supabase/supabase-js
    normalize.ts, discover.ts, schemas.ts, events.ts
  styles/index.css       tokens de diseño (@theme) y estilos base
```

**Regla de oro**: si cambia una interfaz de `repositories.ts`, se actualizan
**las dos** implementaciones (`local` y `supabase`) en la misma feature. El
modo local debe imitar las reglas de privacidad de la BD (lo privado no sale,
lo anónimo no revela autor).

Datos de ejemplo: `src/data/dev-seed.ts`, firmados como "Ejemplo de
desarrollo" y solo cargados con `import.meta.env.DEV`. En producción nunca.

## Rutas

`/` inicio · `/explorar` · `/etiqueta/:tag` · `/poema/:id` · `/escribir` ·
`/escribir/:id` · `/autor/:accountName` · `/coleccion/:id` ·
`/colecciones` = `/mis/colecciones` · `/mis/poemas` · `/mis/borradores` ·
`/mis/biblioteca` · `/ajustes/perfil` · `/ajustes/cuenta` ·
`/ajustes/privacidad` · `/ajustes/apoyos` · `/entrar` · `/registro` ·
`/recuperar` · `/nueva-contrasena` · 404.

Las privadas van envueltas en `RequireSession`. `wrangler.jsonc`
(`not_found_handling: single-page-application`) hace que funcionen al recargar en Cloudflare.

## Backend (Supabase)

Migraciones en orden:

1. `20261018120000_init.sql` — tablas base, vistas públicas, búsqueda, RLS, funciones.
2. `20261019120000_fuentes_cisne_negro_apoyos.sql` — fuente del poema, «Cisne negro» (sensible), apoyos.
3. `20261020120000_comentarios_y_apoyos.sql` — comentarios en los versos, dejar de apoyar.
4. `20261101120000_denunciar_poema.sql` — denuncias.
5. `20261102120000_nombres_unicos.sql` — nombre público único (triggers), 1 cambio/30 días, dirección que lo sigue, direcciones retiradas (`retired_account_names`, sin acceso), pseudónimos sin suplantación.

### Modelo

| Tabla | Qué guarda |
|---|---|
| `profiles` | 1:1 con `auth.users`. Nombre de cuenta, nombre visible, pseudónimo, bio, enlaces, visibilidad de apoyos. El email solo vive en `auth.users` |
| `poems` | `status` (`draft`/`published`), `visibility` (`public`/`private`), `publication_identity` (`profile_name`/`pseudonym`/`anonymous`), `displayed_pseudonym`, fuente, `sensitive`, `comments_enabled` |
| `tags`, `poem_tags` | Etiquetas normalizadas (`normalized_name` único) |
| `collections`, `collection_poems` | Colecciones con orden (`position`). Borrar una colección no borra poemas |
| `favorites` | Biblioteca privada |
| `poem_supports`, `author_supports` | Apoyos |
| `verse_comments` | Comentarios anclados a un verso (máx. 50 palabras) |
| `reports` | Denuncias. Solo se insertan por `report_poem` (una por persona y poema); se leen en el panel de Supabase |

### Seguridad

- **RLS en todas las tablas.** Las tablas solo las lee su dueño.
- **Lo público se lee por vistas `public_*`** (`public_poems`,
  `public_profiles`, `public_collections`, `public_collection_poems`,
  `public_tags`, `public_verse_comments`) y funciones
  (`search_public_poems`, `poem_support_state`…). Son `security definer` a
  propósito: filtran ellas mismas `status='published' AND visibility='public'`.
- **Anonimato**: `public_poems` no expone `author_id` ni enlaza al perfil
  cuando el poema es anónimo o con pseudónimo. Las colecciones públicas no
  muestran los poemas anónimos de su dueño (lo delatarían).
- Escrituras complejas por RPC (`save_poem`, `add_poem_to_collection`,
  `move_collection_poem`, `add_verse_comment`, `delete_my_account`…).
- `supabase/tests/rls.test.mjs` aplica todas las migraciones en PGlite
  (Postgres embebido) con un Supabase mínimo simulado y comprueba los casos
  con dos usuarias, Ana y Bea.

## Configuración

| Variable | Dónde | Qué |
|---|---|---|
| `VITE_SUPABASE_URL` | `.env.local` / Cloudflare Pages | URL del proyecto |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `.env.local` / Cloudflare Pages | Clave pública (`sb_publishable_…`; antes `anon`) |

Las `VITE_*` se incrustan **al compilar**: cambiar una exige recompilar.
Sin ellas → modo local.
