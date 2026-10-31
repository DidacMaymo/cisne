# F26 — Programar artículos de la Comunidad por fecha

## Plan
- Funciones puras en `src/lib/comunidad.ts` (`madridToday`, `isPublished`, `visibleArticles`, `now` inyectable), compartidas por SPA y Worker.
- SPA: filtrar al consultar (no al compilar) vía `listArticles()`; marca «programado» en dev.
- Worker: `articleHead` y `buildSitemap` usan `isPublished`; cabeceras de caché.
- Tests y apartado en `docs/comunidad.md`.

## Archivos tocados
- src/lib/comunidad.ts — `madridToday` (Intl en-CA, Europe/Madrid), `isPublished`, `visibleArticles`
- src/lib/comunidad-content.ts — `allArticles` -> `listArticles()` (filtra en cada llamada); `getArticle` respeta el filtro
- src/pages/Home.tsx, Comunidad.tsx, ComunidadArticulo.tsx — usan `listArticles()`; marca «programado» (dev)
- worker/head.ts, worker/sitemap.ts — filtran con `isPublished` (parámetro `now` opcional)
- worker/index.ts — `Cache-Control: public, max-age=300` en `/comunidad*`; sitemap 3600 -> 1800
- src/lib/comunidad.test.ts, worker/worker.test.ts — víspera, mismo día, cambio de día Madrid/UTC (invierno y verano), borrador, sitemap y head
- docs/comunidad.md — apartado «Programar un artículo»

## Evidencia
- `npx tsc -b` OK · `npm run lint` OK · `npm test` 101 verdes (7 casos nuevos)
- `comunidad.json` ya incluía los programados (solo excluye borradores): no hizo falta tocar `vite.config.ts`.
- Probar en la UI (lo ejecuta el líder):
  1. Con un artículo de fecha de mañana (fixture temporal, no commitear): en dev sale en `/comunidad` y en el propio artículo con «· programado».
  2. `npm run build` + preview: no sale en portada ni `/comunidad`; `/comunidad/<slug>` da «no encontrado». (Worker/sitemap solo en producción o `wrangler dev`.)
  3. Con fecha de hoy o pasada: aparece en todos.

## Decisiones y dudas
- Los textos de los programados van dentro del bundle JS (sitio estático): ocultos en la UI, no secretos. Anotado en docs.
- En una pestaña abierta de un día para otro, el filtro se reevalúa al renderizar/navegar (no hay temporizador).
- Enlaces internos a un programado: llevan a NotFound hasta su día (sin cambios de código).

## Commit sugerido
feat(comunidad): programar artículos por fecha

- Filtro en tiempo de ejecución con la fecha de Madrid (SPA y Worker)
- Caché de /comunidad* 5 min y sitemap 30 min
- Tests de víspera, mismo día y cambio de día; docs
