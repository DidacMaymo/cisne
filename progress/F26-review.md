# Review — F26

**Veredicto:** APPROVED

## Aceptación
- [x] Filtro en runtime con fecha Madrid, función única → `comunidad.ts` `madridToday/isPublished/visibleArticles`; usada por SPA (`comunidad-content.ts listArticles`, evaluada en cada render) y Worker (`head.ts articleHead`, `sitemap.ts`). Tests: `comunidad.test.ts` (víspera, mismo día, 23:30Z invierno y verano, borrador).
- [x] `comunidad.json` incluye programados, excluye borradores → `vite.config.ts` sin cambios (`loadArticles(files,false)` + `toMeta`).
- [x] Portada (`Home.tsx`, `latest` ahora dentro del componente, no al cargar el módulo), `/comunidad`, `/comunidad/<slug>` (`getArticle` filtra → NotFound), head/JSON-LD (`articleHead` → `notFoundHead` noindex), sitemap (`/comunidad` solo si hay publicados). Test `worker.test.ts` programado/víspera/día.
- [x] Caché: `/comunidad*` `max-age=300` (index.ts:92), sitemap 1800. Máx. 30 min < 1 h. Esas rutas pasan siempre por el Worker (`run_worker_first`).
- [x] `docs/comunidad.md` apartado «Programar un artículo» (incluye aviso del bundle).
- [x] `./init.sh` → `[OK] Entorno listo` (RLS 87 casos, tests unitarios OK).

## Checkpoints
- R1 Alcance: [x]
- R2 Arquitectura: [x]
- R3 Diseño y accesibilidad: [x]
- R4 Tests: [x]
- R5 Build: [x]
- R6 Higiene: [x]

## Comprobaciones del contexto
- Los 3 artículos existentes tienen `fecha: 2026-10-30` ≤ hoy (2026-10-31) → siguen visibles en todas las vías.
- Ninguna vía de listado/ruta usa ya la lista sin filtrar (grep de `allArticles`: solo variable local ya filtrada en `Comunidad.tsx`).
- Sin cambios de privacidad en Supabase/RLS.

## Observaciones (no bloquean)
- `/comunidad.json` es un asset público: quien conozca la URL ve título y descripción de los programados, y el cuerpo viaja en el bundle JS. Es inherente al diseño (documentado en docs); no sirve para ocultar contenido sensible.
- Si el Worker falla (`catch`) o el asset no es HTML, la respuesta usa las cabeceras del asset, no las de 300 s; irrelevante para la visibilidad, que no depende del Worker en la SPA.
- Smoke test en navegador pendiente (del líder).
