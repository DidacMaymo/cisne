# CISNE — plataforma minimalista de poesía en español

**Fuente de verdad del producto: [docs/BRIEF.md](docs/BRIEF.md).** Léelo entero antes de empezar. Este archivo dice cómo implementarlo; si algo choca con el brief en lo técnico, gana este archivo (stack y fases); en producto y diseño, gana el brief.

Esencia: *menos ruido, más poesía.* Cada pantalla tiene un propósito, cada botón hace algo real, cada adorno se justifica.

## Arquitectura

Un solo repositorio, dos piezas desplegadas por separado:

```
Navegador ──► Cloudflare Pages (HTML/JS/CSS estáticos de este repo)
    │
    └──────► Supabase (Postgres + Auth, API generada automáticamente)
```

- **Frontend**: SPA estática. Se compila (`npm run build` → `dist/`) y Cloudflare Pages la sirve gratis desde su CDN. No hay servidor propio.
- **Backend**: Supabase (plan gratuito). No hay código de servidor que desplegar: solo SQL (tablas + políticas RLS) versionado en `supabase/migrations/` dentro de este mismo repo. La seguridad vive en las políticas RLS de Postgres, no en el frontend.
- El frontend nunca habla con Supabase directamente desde los componentes: pasa por una **capa de repositorios** (`src/data/`) con interfaces. Ahora hay una implementación local; en la fase de backend se añade la de Supabase sin tocar la UI.

## Stack

- **Vite 6 + React + TypeScript (strict)** — SPA, sin SSR. Se queda en Vite 6: la máquina del usuario tiene Node 20.10 y no hay que exigir más.
- **React Router** para rutas. **Tailwind CSS v4** para estilos.
- **Zod** para validar formularios (y más tarde, datos que llegan de Supabase).
- Fuentes self-hosted con `@fontsource` (nada de Google Fonts en runtime).
- Sin librerías pesadas: nada de UI kits, ni gestores de estado globales salvo necesidad clara.
- Despliegue: Cloudflare Pages, build `npm run build`, output `dist`. Incluir `public/_redirects` con `/* /index.html 200` para que funcionen las rutas de la SPA.

## Simplificaciones respecto al brief (decididas por el usuario)

- **Sin imágenes subidas por usuarios**: ni foto de perfil ni portada de colección. Las colecciones usan siempre portada tipográfica generada. No se usa Supabase Storage. Quitar `avatar_url` y `cover_url` del modelo.
- Ante la duda entre dos soluciones, la más simple.
- **Inicio es una portada, sin poemas**: qué es CISNE (leer, descubrir, escribir) y dos llamadas, «Explorar poemas» y «Escribir un poema». Los poemas se descubren en **Explorar**: al azar por defecto (semilla nueva en cada visita, «Barajar de nuevo»), o recientes; con buscador y etiquetas.
- **Página de autor solo con palabras**: nombre (o pseudónimo), unas líneas de descripción y enlaces a sus redes (`Profile.links`, máx. 4). Debajo, sus colecciones públicas y sus poemas. Nunca fotos.
- **Hace falta cuenta para guardar y publicar** (con cualquier firma, también «Anónimo»: así cada poema tiene alguien que pueda editarlo o borrarlo). Se puede escribir sin cuenta; el texto se autoguarda en el navegador y sigue ahí al volver de entrar o registrarse. Favoritos y colecciones también necesitan cuenta.
- **Colecciones = poemarios y antologías**: pueden reunir poemas propios y de otros autores. Un poema anónimo o con pseudónimo **no aparece** en las colecciones públicas de su propio autor (delataría quién lo escribió).
- **Formato del poema**: cursiva, negrita, subrayado y tachado como marcas dentro del texto (`*`, `**`, `__`, `~~`; nunca cruzan un salto de línea), con botones y atajos en el editor. Se pintan con `src/lib/poem-markup.ts`; el texto guardado sigue siendo texto.
- **Tipografía por poema** (5, `src/lib/poem-fonts.ts`): Clásica (Cormorant Garamond), Libro (EB Garamond), Pantalla (Literata), Máquina (Courier Prime) y Clara (Atkinson Hyperlegible). Solo afectan al texto del poema; la interfaz no cambia.
- **Cisne negro**: casilla del editor para poemas con temas sensibles (+18). Se muestran en negativo (fondo tinta, texto blanco), tapados en los listados hasta pulsar «Mostrar el poema», y Explorar permite ocultarlos (preferencia guardada en el navegador).
- **Apoyar** (autor y poema): excepción decidida por el usuario a «sin contadores». El número es **privado por defecto** (Ajustes → Privacidad), nunca ordena ni destaca nada, y los poemas anónimos o con pseudónimo no muestran su número a nadie más que a su autor. No se puede apoyar lo propio.
- **Descripción del perfil**: hasta 150 palabras.
- **Dejar de apoyar**: *Ajustes → Apoyos* lista los autores y poemas que apoyas, con «Dejar de apoyar». Solo lo ve su dueño y no avisa a nadie.
- **Comentarios en los versos**: el autor los abre por poema (apagados por defecto; solo en poemas públicos). Al subrayar un fragmento aparece «Escribir comentario»; cada verso comentado lleva un puntito con su número en el margen derecho, fuera de las palabras. Se firman con el nombre público de quien comenta; los borra quien los escribió o el autor del poema. Cerrar los comentarios los oculta. Para teclado, «Comentar un verso» permite elegir el verso de una lista.
- **Separador**: `SwanDivider`, un trazo finísimo que termina en el cisne del emblema (sustituye al de la pluma).
- Hasta la fase 5 las cuentas son **locales** (un usuario por navegador, contraseña guardada solo como hash con sal) y la interfaz lo dice. «Recuperar contraseña» explica que llegará con el servidor.

## Skill de diseño

Si el skill `frontend-design` está instalado, cárgalo antes de cualquier trabajo de UI y síguelo. Si no lo está, sigue igualmente la sección "Identidad visual".

## Identidad visual (no negociable)

- Paleta única como tokens (`@theme` de Tailwind):
  `blanco #FFFFFF`, `tinta #111111`, `papel #F5F5F3`, `gris #888888`, `linea #E7E7E4`.
  Sin colores de acento, sin degradados, sin sombras marcadas, sin tarjetas con sombra.
- Tipografía: serif literaria para títulos, autores y poemas (elige entre Cormorant Garamond, EB Garamond o Newsreader); sans limpia para UI (Inter o Geist). **Pareja elegida: Cormorant Garamond (serif) + Inter (sans)**, self-hosted con `@fontsource`.
- Poema: columna estrecha (~32–38 ch), interlineado generoso, `white-space: pre-wrap` siempre. Saltos de línea y estrofas son sagrados en listado, lectura, vista previa y búsqueda.
- **Logotipo**: [brand/cisne-emblema.png](brand/cisne-emblema.png) — cisne de trazo fino cuyo cuerpo y cuello forman un corazón. Vectorízalo fielmente a SVG (`src/components/brand/SwanMark.tsx`, `currentColor`, solo trazos) y úsalo en logo, favicon, estados vacíos y marca final de poema. No lo sustituyas por otro cisne.
- El cisne aparece con moderación. Separador: trazo SVG finísimo que acaba en el cisne del emblema (`SwanDivider`).
- Transiciones discretas (≤200 ms) y respeto a `prefers-reduced-motion`.
- Mobile-first, sin scroll horizontal, objetivos táctiles ≥44 px, foco visible, contraste AA.

## Rutas

`/` inicio (portada) · `/explorar` · `/etiqueta/:tag` · `/poema/:id` · `/escribir` y `/escribir/:id` · `/autor/:accountName` · `/coleccion/:id` · `/mis/poemas` · `/mis/borradores` · `/mis/colecciones` (alias `/colecciones`) · `/mis/biblioteca` · `/ajustes/perfil` · `/ajustes/privacidad` · `/ajustes/apoyos` · `/ajustes/cuenta` · `/entrar` · `/registro` · `/recuperar` · 404 elegante.

## Fases

Esta es la lista de tareas del proyecto. Trabaja una fase cada vez. Al terminar cada una: `npm run build` y `npm run lint` sin errores, revisa en navegador a 375 px y a escritorio, **marca aquí la fase como hecha (`[x]`)**, haz commit y para para que el usuario revise.

### [x] Fase 1 — Base del proyecto e identidad
- Crear el proyecto Vite + React + TS + Tailwind + React Router en la raíz del repo.
- Tokens de color, tipografías, escala tipográfica y espaciados.
- `SwanMark` SVG, favicon, separador de pluma.
- Layout: cabecera de escritorio y navegación móvil compacta. Pie mínimo.
- `public/_redirects` y README con cómo arrancar y desplegar.

### [ ] Fase 2 — Lectura (con datos locales)
- Capa `src/data/`: tipos del dominio (Poem, Profile, Collection, Tag…) siguiendo el modelo del brief §17, interfaces de repositorio e implementación `local` sobre `localStorage`.
- Poemas de ejemplo en `src/data/dev-seed.ts`, **firmados como "Ejemplo de desarrollo"** y solo cargados en modo desarrollo (`import.meta.env.DEV`). En producción el inicio muestra el estado vacío («Toda obra empieza con una primera palabra.»).
- Inicio con Recientes/Descubrir, componente de poema en listado, página de lectura tipo libro, poemas relacionados discretos, compartir enlace.

### [ ] Fase 3 — Escritura
- Editor sin distracciones: título, texto, etiquetas (normalizadas, con sugerencias), colección, visibilidad, identidad (nombre / pseudónimo / anónimo, crear pseudónimo inline).
- Guardar borrador · Vista previa · **Publicar poema**. Autosave del texto en `localStorage` para no perder nada. Confirmación discreta. Editar y eliminar con diálogo de confirmación.

### [ ] Fase 4 — Colecciones, explorar, biblioteca, perfil
- [x] Colecciones: crear, editar, ordenar poemas, portada tipográfica generada, visibilidad, añadir desde cualquier poema («A una colección»).
- [x] Explorar: al azar o recientes, buscador (título, texto, autor, etiqueta, sin distinguir tildes) y etiquetas. Nunca ordenar por favoritos ni mostrar contadores.
- [x] Biblioteca de guardados. Página de autor solo texto. Ajustes de perfil y de cuenta (cerrar sesión, eliminar cuenta). Sesión local y cuenta obligatoria para publicar.
- [x] Ajustes de privacidad: quién ve cuánta gente te apoya.

### [ ] Fase 5 — Backend Supabase (otro día)
- Migraciones SQL en `supabase/migrations/`: tablas del brief §17 + `reports`. `poems.status` (`draft|published`), `visibility` (`public|private`), `publication_identity` (`profile_name|pseudonym|anonymous`). Índices, FKs, `tags.normalized_name` único, full-text `spanish` + `unaccent`.
- **RLS en todas las tablas.** Público = `status='published' AND visibility='public'`. Borradores, privados, favoritos y colecciones privadas solo para su dueño.
- Lectura pública vía vista `public_poems` que **no expone `author_id` ni el perfil cuando el poema es anónimo**.
- Implementación `supabase` de los repositorios; Auth real (registro, entrar, salir, recuperar contraseña, rutas protegidas, eliminar cuenta). Eliminar la implementación local o dejarla solo para desarrollo.
- Solo la clave pública va al frontend (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`; en proyectos antiguos se llama `anon key`). Nunca la `secret`/`service_role`.
- Antes de empezar esta fase, pide al usuario la URL del proyecto y la clave pública; no inventes valores.
- Estado: hechas las migraciones (`supabase/migrations/`, aplicar en orden; probadas con `npm run test:db`), la implementación `src/data/supabase/` (se activa sola si existen las variables `VITE_SUPABASE_*`; sin ellas, modo local) y la auth en la UI (confirmar email, recuperar, `/nueva-contrasena`). **Falta**: que el usuario cree el proyecto y pase URL + clave, y probarlo de punta a punta contra Supabase real. Guía: [docs/SUPABASE.md](docs/SUPABASE.md).

### [ ] Fase 6 — Revisión
- Criterios de aceptación del brief §22 completos, probando con dos usuarios que lo privado y lo anónimo no se filtran. Accesibilidad con teclado, rendimiento, móvil.

## Fuera de alcance

Chat, mensajes, seguidores, rankings, contadores visibles (salvo el de «Apoyar», opcional y privado por defecto), insignias, notificaciones, vídeo, imágenes como contenido, popups, paneles de admin visibles. En la duda, no se añade.

## Notas

- Textos de interfaz en español, tono sobrio y literario.
- El usuario viene de monolitos Java: cuando introduzcas un concepto nuevo del stack (RLS, SPA, despliegue en Pages…), explícalo en una frase.
