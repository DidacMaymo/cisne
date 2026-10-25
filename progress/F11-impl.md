# F11 — Rendimiento: rutas con carga diferida

## Plan
- `React.lazy` para editor, ajustes, auth (SignIn/Recover/NewPassword) y pestañas privadas de Mi página; `Suspense` con `LoadState` dentro de `Layout` (cabecera y pie no desaparecen).
- Sacar `countWords`/límites a `src/data/words.ts` (sin Zod) y cargar `schemas` solo al comentar / en formularios diferidos.
- Carga diferida de `@supabase/supabase-js` + `data/supabase` tras un proxy en `src/data/index.ts`.

## Archivos tocados
- src/App.tsx — 8 páginas con `lazy`; lectura y `MyPageRedirect` siguen en el chunk inicial.
- src/components/layout/Layout.tsx — `Suspense` + `LoadState` alrededor de `<Outlet />`.
- src/pages/AuthorPage.tsx — `MyPoems`/`MyCollections`/`MyLibrary` con `lazy` + `Suspense`.
- src/pages/CollectionPage.tsx — `CollectionForm` (edición, solo dueña) con `lazy`.
- src/data/words.ts (nuevo) — `countWords`, `MAX_*_WORDS`; `schemas.ts` los reexporta.
- src/data/local/index.ts, ReportButton.tsx, VerseThread.tsx — importan de `words`; VerseThread hace `import()` de `schemas` al enviar.
- src/data/index.ts — en modo Supabase, `repos` es un Proxy que carga `supabase-js` + implementación en la primera llamada (todas las operaciones ya devuelven `Promise`). Si la carga falla se reintenta.

## Evidencia
- `npx tsc -b` OK · `npm run lint` OK · `npm test` 34/34 OK (no se tocó `supabase/`, no hay `test:db`).
- Chunk de entrada `index-*.js` (antes → después):
  - Sin Supabase (local): 467,54 KB (140,26 gzip) → 340,91 KB (106,06 gzip): **-27 %**.
  - Con Supabase (producción): 680,85 KB (195,02 gzip) → 323,54 KB (101,08 gzip): **-52 %**.
- Wrangler: nada que tocar; `dist/` con `not_found_handling: single-page-application` sirve los chunks con hash como estáticos.
- Probar en la UI (lo ejecuta el líder):
  1. Recargar en frío `/poema/:id`, `/explorar`, `/autor/:nombre`, `/coleccion/:id`, `/etiqueta/:tag`: sin parpadeos.
  2. Ir a `/escribir`: «Cargando…» entre cabecera y pie y luego el editor. Recargar en `/escribir`, `/entrar`, `/ajustes/perfil`, `/mi-pagina`.
  3. En Mi página cambiar de pestaña (Publicados/Borradores/Colecciones/Biblioteca) y editar una colección propia.
  4. Comentar un verso (valida con Zod diferido) y denunciar un poema.
  5. Con Supabase real (si se puede): sesión, guardar/apoyar y que la lista se refresque (`onDataChange`).

## Decisiones y dudas
- Criterio ≥30 %: en producción (con Supabase) se cumple de sobra; en modo local queda en 27 % porque su punto de partida ya era menor (467 KB, ya incluía Supabase por un efecto de módulo) y lo que queda es React, Router, repos locales y lectura. Lo dejo así: es el modo de desarrollo, no se despliega. Si el líder exige 30 % en local, habría que diferir también `CollectionPage`/`PoemPage` (no lo hago: son lectura).
- En local el build emite chunks de Supabase sin usar (no se descargan nunca).
- El proxy asume que todos los métodos de `Repositories` devuelven promesa (así es por interfaz). El listener de sesión de Supabase se registra al primer uso de `repos` (primer render que consulta la sesión), así que no se pierde ningún evento relevante.
- `index.html` no precarga los chunks diferidos; la primera visita a `/escribir` espera una descarga pequeña (Write 17 KB).

## Commit sugerido
perf(rutas): carga diferida de editor, ajustes, auth y Supabase

- React.lazy + Suspense (LoadState) en editor, ajustes, auth y pestañas privadas
- countWords/límites sin Zod en data/words.ts; Zod solo al comentar o en formularios
- supabase-js y su repositorio se descargan en la primera consulta
- entrada: 680,85 -> 323,54 KB con Supabase (467,54 -> 340,91 KB en local)

## Segunda vuelta (modo local ≥ 30 %)
Medido con `vite build --sourcemap` fuera del repo y sumando bytes por módulo del `.map`. Entrada local antes: 340,95 KB.

| Módulo (entrada local) | KB |
|---|---|
| react-dom | 204,8 |
| react-router | 39,9 |
| data/local/index.ts (+ store 1,0) | 15,5 |
| react + scheduler | 12,0 |
| CollectionPage / VerseThread / AuthorPage / Explore | 5,7 / 4,4 / 4,2 / 3,9 |
| AddToCollection / ReportButton / Home / PoemPage | 3,0 / 3,0 / 2,9 / 2,6 |

- Supabase, Zod y `dev-seed` ya NO estaban en la entrada (los chunks `index-TwTirdp1` 219 KB y `schemas` 88 KB se emiten pero no se descargan; `dev-seed` solo en DEV).
- Lo único diferible sin tocar lectura: el repositorio local (~16 KB). `src/data/index.ts` usa ahora el mismo proxy de carga diferida para ambos modos (`import('./local')`). No se difiere ninguna pantalla de lectura.
- Resultado entrada: local 467,54 → 323,31 KB (**-30,8 %**; gzip 100,99). Supabase 680,85 → 323,41 KB (**-52,5 %**; gzip 101,04).
- `npx tsc -b` OK · `npm run lint` OK · `npm test` 34/34 OK.
- Probar en la UI (modo local): primera carga de `/`, `/explorar`, `/poema/:id` muestra datos tras un instante (el repo local llega por import dinámico); guardar/apoyar/comentar siguen funcionando y refrescan.
- Nota: la "Decisión" anterior sobre el 27 % queda obsoleta.

## Tercera vuelta
- `src/App.tsx`: bloque `<Routes>` con la indentación original (el diff contra main solo toca imports y `lazy`).
- Proxy extraído sin cambiar comportamiento a `src/data/lazy.ts` (`memoizeLoader`, `lazyRepositories`); `src/data/index.ts` los usa.
- `src/data/lazy.test.ts` (3 casos): espera a la carga antes de llamar al método; carga única; si la carga falla, la siguiente llamada reintenta y funciona.
- `npx tsc -b` OK · `npm run lint` OK · `npm test` 37/37 OK.
