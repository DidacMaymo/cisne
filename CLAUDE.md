# CISNE — plataforma minimalista de poesía en español

**Fuente de verdad del producto: [docs/BRIEF.md](docs/BRIEF.md).** Léelo entero antes de empezar. Este archivo dice cómo implementarlo; si algo choca con el brief en lo técnico, gana este archivo (stack y fases); en producto y diseño, gana el brief.

Esencia: *menos ruido, más poesía.* Cada pantalla tiene un propósito, cada botón hace algo real, cada adorno se justifica.

## Arquitectura

Un solo repositorio, dos piezas desplegadas por separado:

```
Navegador ──► Cloudflare Pages (HTML/JS/CSS estáticos de este repo)
    │
    └──────► Supabase (Postgres + Auth + Storage, API generada automáticamente)
```

- **Frontend**: SPA estática. Se compila (`npm run build` → `dist/`) y Cloudflare Pages la sirve gratis desde su CDN. No hay servidor propio.
- **Backend**: Supabase (plan gratuito). No hay código de servidor que desplegar: solo SQL (tablas + políticas RLS) versionado en `supabase/migrations/` dentro de este mismo repo. La seguridad vive en las políticas RLS de Postgres, no en el frontend.
- El frontend nunca habla con Supabase directamente desde los componentes: pasa por una **capa de repositorios** (`src/data/`) con interfaces. Ahora hay una implementación local; en la fase de backend se añade la de Supabase sin tocar la UI.

## Stack

- **Vite + React + TypeScript (strict)** — SPA, sin SSR.
- **React Router** para rutas. **Tailwind CSS v4** para estilos.
- **Zod** para validar formularios (y más tarde, datos que llegan de Supabase).
- Fuentes self-hosted con `@fontsource` (nada de Google Fonts en runtime).
- Sin librerías pesadas: nada de UI kits, ni gestores de estado globales salvo necesidad clara.
- Despliegue: Cloudflare Pages, build `npm run build`, output `dist`. Incluir `public/_redirects` con `/* /index.html 200` para que funcionen las rutas de la SPA.

## Skill de diseño

Si el skill `frontend-design` está instalado, cárgalo antes de cualquier trabajo de UI y síguelo. Si no lo está, sigue igualmente la sección "Identidad visual".

## Identidad visual (no negociable)

- Paleta única como tokens (`@theme` de Tailwind):
  `blanco #FFFFFF`, `tinta #111111`, `papel #F5F5F3`, `gris #888888`, `linea #E7E7E4`.
  Sin colores de acento, sin degradados, sin sombras marcadas, sin tarjetas con sombra.
- Tipografía: serif literaria para títulos, autores y poemas (elige entre Cormorant Garamond, EB Garamond o Newsreader); sans limpia para UI (Inter o Geist). Documenta aquí la pareja elegida.
- Poema: columna estrecha (~32–38 ch), interlineado generoso, `white-space: pre-wrap` siempre. Saltos de línea y estrofas son sagrados en listado, lectura, vista previa y búsqueda.
- **Logotipo**: [brand/cisne-emblema.png](brand/cisne-emblema.png) — cisne de trazo fino cuyo cuerpo y cuello forman un corazón. Vectorízalo fielmente a SVG (`src/components/brand/SwanMark.tsx`, `currentColor`, solo trazos) y úsalo en logo, favicon, estados vacíos y marca final de poema. No lo sustituyas por otro cisne.
- El cisne aparece con moderación. Separador de pluma: trazo SVG finísimo reutilizable.
- Transiciones discretas (≤200 ms) y respeto a `prefers-reduced-motion`.
- Mobile-first, sin scroll horizontal, objetivos táctiles ≥44 px, foco visible, contraste AA.

## Rutas

`/` inicio (Recientes / Descubrir) · `/explorar` · `/etiqueta/:tag` · `/poema/:id` · `/escribir` y `/escribir/:id` · `/autor/:accountName` · `/coleccion/:id` · `/mis/poemas` · `/mis/borradores` · `/mis/colecciones` · `/mis/biblioteca` · `/ajustes/perfil` · `/ajustes/privacidad` · `/ajustes/cuenta` · `/entrar` · `/registro` · `/recuperar` · 404 elegante.

## Fases

Trabaja una fase cada vez. Al terminar cada una: `npm run build` y `npm run lint` sin errores, revisa en navegador a 375 px y a escritorio, haz commit y para para que el usuario revise.

### Fase 1 — Base del proyecto e identidad
- Crear el proyecto Vite + React + TS + Tailwind + React Router en la raíz del repo.
- Tokens de color, tipografías, escala tipográfica y espaciados.
- `SwanMark` SVG, favicon, separador de pluma.
- Layout: cabecera de escritorio y navegación móvil compacta. Pie mínimo.
- `public/_redirects` y README con cómo arrancar y desplegar.

### Fase 2 — Lectura (con datos locales)
- Capa `src/data/`: tipos del dominio (Poem, Profile, Collection, Tag…) siguiendo el modelo del brief §17, interfaces de repositorio e implementación `local` sobre `localStorage`.
- Poemas de ejemplo en `src/data/dev-seed.ts`, **firmados como "Ejemplo de desarrollo"** y solo cargados en modo desarrollo (`import.meta.env.DEV`). En producción el inicio muestra el estado vacío («Toda obra empieza con una primera palabra.»).
- Inicio con Recientes/Descubrir, componente de poema en listado, página de lectura tipo libro, poemas relacionados discretos, compartir enlace.

### Fase 3 — Escritura
- Editor sin distracciones: título, texto, etiquetas (normalizadas, con sugerencias), colección, visibilidad, identidad (nombre / pseudónimo / anónimo, crear pseudónimo inline).
- Guardar borrador · Vista previa · **Publicar poema**. Autosave del texto en `localStorage` para no perder nada. Confirmación discreta. Editar y eliminar con diálogo de confirmación.

### Fase 4 — Colecciones, explorar, biblioteca, perfil
- Colecciones: crear, editar, ordenar poemas, portada tipográfica generada, visibilidad.
- Explorar: buscador (título, texto, autor, etiqueta) y filtros discretos.
- Biblioteca de guardados. Perfil público tipo página de autor. Ajustes de perfil, privacidad y cuenta (pantallas completas; en esta fase operan sobre el repositorio local).
- "Descubrir": mezcla con semilla diaria entre poemas públicos, máximo 1–2 por autor. Nunca ordenar por favoritos ni mostrar contadores.

### Fase 5 — Backend Supabase (otro día)
- Migraciones SQL en `supabase/migrations/`: tablas del brief §17 + `reports`. `poems.status` (`draft|published`), `visibility` (`public|private`), `publication_identity` (`profile_name|pseudonym|anonymous`). Índices, FKs, `tags.normalized_name` único, full-text `spanish` + `unaccent`.
- **RLS en todas las tablas.** Público = `status='published' AND visibility='public'`. Borradores, privados, favoritos y colecciones privadas solo para su dueño.
- Lectura pública vía vista `public_poems` que **no expone `author_id` ni el perfil cuando el poema es anónimo**.
- Implementación `supabase` de los repositorios; Auth real (registro, entrar, salir, recuperar contraseña, rutas protegidas, eliminar cuenta). Eliminar la implementación local o dejarla solo para desarrollo.
- Solo la `anon key` va al frontend (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Nunca la `service_role`.

### Fase 6 — Revisión
- Criterios de aceptación del brief §22 completos, probando con dos usuarios que lo privado y lo anónimo no se filtran. Accesibilidad con teclado, rendimiento, móvil.

## Fuera de alcance

Chat, mensajes, seguidores, rankings, contadores visibles, insignias, notificaciones, vídeo, imágenes como contenido, popups, paneles de admin visibles. En la duda, no se añade.

## Notas

- Textos de interfaz en español, tono sobrio y literario.
- El usuario viene de monolitos Java: cuando introduzcas un concepto nuevo del stack (RLS, SPA, despliegue en Pages…), explícalo en una frase.
