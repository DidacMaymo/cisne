# Convenciones

> Producto y diseño completos en `docs/BRIEF.md`. Esto es lo que un agente
> necesita tener presente al escribir código. Esencia: *menos ruido, más
> poesía.* Cada pantalla tiene un propósito, cada botón hace algo real, cada
> adorno se justifica.

## Identidad visual (no negociable)

- **Paleta única**, tokens en `src/styles/index.css` (`@theme`):
  `blanco #FFFFFF`, `tinta #111111`, `papel #F5F5F3`, `gris #888888`,
  `linea #E7E7E4`. Usa las clases de Tailwind de esos tokens (`text-tinta`,
  `border-linea`…), nunca colores sueltos. Sin colores de acento, sin
  degradados, sin sombras marcadas, sin tarjetas con sombra.
- **Tipografía**: Cormorant Garamond (`font-serif`: títulos, autores, poemas)
  + Inter (`font-sans`: interfaz). Fuentes de poema elegibles: `font-libro`,
  `font-pantalla`, `font-maquina`, `font-clara`. Todas self-hosted con
  `@fontsource`; nada de Google Fonts en runtime.
- **Escala**: usa los tokens `text-meta`, `text-ui`, `text-poema`,
  `text-titulo`, `text-portada` y los anchos `max-w-poema`, `max-w-pagina`,
  `max-w-ancho`. No inventes tamaños nuevos sin motivo.
- **Poemas**: saltos de línea y estrofas son sagrados en listado, lectura,
  vista previa y búsqueda (`white-space: pre-wrap`, componente `PoemText`).
- **Cisne**: el emblema es `src/components/brand/SwanMark.tsx` (vectorizado de
  `brand/cisne-emblema.png`). No se sustituye por otro cisne. Aparece con
  moderación: logo, favicon, estados vacíos, final de poema, separador
  (`SwanDivider`).
- **Movimiento**: transiciones ≤ 200 ms y siempre respetando
  `prefers-reduced-motion`.
- **Móvil primero**: sin scroll horizontal a 375 px, objetivos táctiles
  ≥ 44 px, foco visible, contraste AA, formularios con `<label>`. Los estados
  de error no dependen solo del color.

## Simplificaciones decididas por el usuario

- **Sin imágenes subidas por usuarios**: ni foto de perfil ni portada. Las
  colecciones usan portada tipográfica (`CollectionCover`). No se usa Supabase
  Storage.
- Ante la duda entre dos soluciones, la más simple.

## Fuera de alcance

Chat, mensajes privados, seguidores, rankings, insignias, gamificación,
notificaciones, vídeo, imágenes como contenido, popups, paneles de admin
visibles. En la duda, no se añade.

> Excepción decidida: los **apoyos** muestran su número solo a quien los
> recibe (o a todos si el autor lo elige en *Privacidad*). Nunca se ordena por
> apoyos ni favoritos.

## TypeScript / React

- TypeScript `strict`. Nada de `any` (tampoco implícito); si un dato viene de
  fuera (Supabase, `localStorage`), valídalo o tipa la fila.
- Componentes funcionales, un componente por fichero, nombre en PascalCase
  igual al fichero. Páginas en `src/pages/`, piezas reutilizables en
  `src/components/` (subcarpeta si es de un dominio: `editor/`, `comments/`,
  `layout/`, `brand/`).
- **La UI solo habla con los datos a través de `repos`** (`src/data/index.ts`).
  Nunca importes `@supabase/supabase-js` ni `localStorage` desde una página o
  componente.
- Carga de datos con `useQuery` (se refresca sola con `onDataChange`). Las
  mutaciones llaman al repositorio, que emite `emitDataChange()`.
- Lógica pura (normalizar, formatear, barajar, parsear el marcado del poema)
  en `src/lib/` o `src/data/*.ts`, sin React, para poder testearla.
- Validación de formularios con Zod (`src/data/schemas.ts`).
- Sin dependencias nuevas salvo que la feature lo diga. Nada de UI kits ni
  gestores de estado globales.
- Comentarios en español, breves, explicando el *porqué*. Sin código
  comentado ni `console.log` de depuración.

## SQL / Supabase

- Cada cambio de esquema = **migración nueva** en `supabase/migrations/`,
  nombre `AAAAMMDDHHMMSS_descripcion.sql`. Nunca editar una ya aplicada.
- Toda tabla nueva: `enable row level security` + políticas explícitas.
  Lectura pública solo a través de vistas `public_*` o funciones
  `security definer` que filtran ellas mismas.
- Operaciones con varias tablas o reglas de negocio → función SQL (`save_poem`,
  `add_verse_comment`…) llamada por RPC, no varias llamadas sueltas desde el
  navegador.
- Nombres en inglés y `snake_case` en SQL; las políticas llevan nombre
  descriptivo en español (`"mi biblioteca: leer"`).
- **Anonimato**: nada público expone `author_id`, `user_id` ni el perfil de un
  poema anónimo o con pseudónimo.

## Textos

Interfaz en español, tono sobrio y literario, frases cortas. Los errores dicen
qué pasó y qué hacer, sin culpar ("No se pudo guardar. Tu texto sigue aquí;
inténtalo de nuevo.").
