# F25 — Comunidad de escritores (artículos)

## Plan
- Parser Markdown propio (`src/lib/markdown.ts`, árbol de datos → React, sin HTML crudo) y carga/frontmatter (`src/lib/comunidad.ts`), puros y testeados.
- UI: `/comunidad`, `/comunidad/:slug`, sección en la portada (entre las tres puertas y «Aquí solo hay palabras») y «Comunidad» en el pie. Nada en cabecera ni barra móvil.
- Worker: rutas `/comunidad` y `/comunidad/*`, head + JSON-LD `BlogPosting`, sitemap.
- Plantilla `_plantilla.md` y guía `docs/comunidad.md`.

## Archivos tocados
- Nuevos: `src/lib/markdown.ts`, `src/lib/comunidad.ts`, `src/lib/comunidad-content.ts` (único sitio con `import.meta.glob`), `src/components/comunidad/Markdown.tsx`, `src/pages/Comunidad.tsx`, `src/pages/ComunidadArticulo.tsx`, `content/comunidad/_plantilla.md`, `docs/comunidad.md`, `src/lib/comunidad.test.ts`.
- Editados: `src/App.tsx`, `src/pages/Home.tsx`, `src/components/layout/Footer.tsx`, `src/lib/seo.ts` (`COMMUNITY_META`, `articleMeta`), `worker/{routes,head,sitemap,index}.ts`, `worker/worker.test.ts`, `vite.config.ts`, `tsconfig.worker.json`, `wrangler.jsonc`.

## Evidencia
- `npx tsc -b` OK · `npm test` → 94 tests OK (~30 nuevos: parser, frontmatter, carga, Worker).
- `npm run lint` falla en esta máquina por `util.styleText is not a function` (ESLint 10 con Node 20.10, ajeno a la feature). Lo ejecuté con `npx eslint . -f json`: 0 avisos.
- `npx vite build` OK y emite `dist/comunidad.json` (`[]` sin artículos publicados). No se ejecutó `npm run test:db` (no se tocó `supabase/`).
- Probar en la UI (líder): poner temporalmente en `content/comunidad/` un artículo de prueba publicado (copia de la plantilla con `borrador: false`, sin commitear) y comprobar:
  1. Portada: bloque «Comunidad de escritores» con título/descripción/fecha y «Ver todas las entradas»; sin artículos publicados (y sin dev) no aparece. Pie: «Comunidad».
  2. `/comunidad` lista; clic → `/comunidad/<slug>` con tipografía de lectura, autor, fecha e invitación final a escribir. Slug inexistente → «Este verso no existe».
  3. `borrador: true` se ve en `npm run dev` (con etiqueta «borrador»), no tras `npm run build`.
  4. 375 px sin desbordes. Cabecera y barra móvil sin cambios.

## Decisiones y dudas
- **Worker y artículos (una sola fuente de verdad):** wrangler/esbuild no soporta `import.meta.glob`. Un plugin de Vite (`communityIndex` en `vite.config.ts`) usa el mismo `loadArticles` y emite `dist/comunidad.json` con los metadatos de los publicados; el Worker lo lee vía `ASSETS`. Un frontmatter inválido **rompe el build** (no se publica a medias). En dev/SPA el fichero inválido se omite con `console.warn`.
- Sin dependencias nuevas. Markdown propio: enlaces solo `http(s)`, `mailto:`, `/ruta` y `#`; otros (`javascript:`) quedan como texto. No hay `# h1` (el título viene del frontmatter).
- `/comunidad` solo entra en el sitemap si hay algún artículo publicado. El artículo/índice del Worker no necesita Supabase.
- Los borradores no están en `comunidad.json`, así que el Worker los trata como inexistentes (noindex).
- Sin artículos de ejemplo: los tests usan fixtures en línea. `content/comunidad/` solo contiene la plantilla (borrador por defecto al copiarla).
- Deuda: `.gitignore`/CI no cambian; `wrangler.jsonc` ahora enruta `/comunidad*` por el Worker (entra en producción con el merge).

## Segunda vuelta
- Citas (`src/lib/markdown.ts`): cada línea `>` conserva su salto mediante un nodo nuevo `{ t: 'br' }` (renderizado como `<br>` en `Markdown.tsx`, sin HTML crudo); una `>` vacía añade un segundo `<br>` (separa párrafos dentro de la misma cita).
- Test nuevo en `comunidad.test.ts` (versos + estrofa) y ajustado el de citas; `npm test` 95 OK, `npx tsc -b` OK, eslint sin salida (0 avisos).
- Formato: espacio en `src/App.tsx:48` y tras la coma en `tsconfig.worker.json:19`. `content/comunidad/` intacto.

## Commit sugerido
feat(comunidad): artículos en Markdown para la comunidad de escritores

- Sección en la portada, enlace en el pie, /comunidad y /comunidad/:slug
- Parser Markdown propio sin HTML crudo y carga con borradores
- Worker: head, JSON-LD BlogPosting y sitemap; plantilla y guía
