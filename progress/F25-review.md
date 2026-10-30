# Review — F25 (segunda vuelta)

**Veredicto:** APPROVED

`./init.sh` -> `[OK] Entorno listo` (lint, build, 87 casos RLS, tests unitarios, higiene OK).

## Aceptación
- [x] Frontmatter, slug, orden → `comunidad.ts` + tests
- [x] Markdown "y nada más" con tests → citas ahora conservan saltos: nodo `br` (`markdown.ts:124-125`), render en `Markdown.tsx:10`, tests en `comunidad.test.ts:109-121` (cita larga y versos/estrofa); párrafos normales siguen uniendo con espacio
- [x] Portada y pie (`Home.tsx`, `Footer.tsx`; UI: paso manual, del líder)
- [x] `/comunidad`, `/comunidad/:slug`, NotFound, invitación final
- [x] SEO Worker (head, BlogPosting, sitemap sin borradores) → `worker.test.ts`
- [x] Plantilla ignorada y `docs/comunidad.md`
- [x] `./init.sh` en verde

## Checkpoints
- R1 Alcance: [x]
- R2 Arquitectura: [x]
- R3 Diseño y accesibilidad: [x]
- R4 Tests: [x]
- R5 Build: [x]
- R6 Higiene: [x] (espacio restaurado en `App.tsx:48` y en `tsconfig.worker.json:19`)

## Cambios requeridos
Ninguno.

## Observaciones (no bloquean)
- Los borradores usan fecha 2026-10-30; al publicar, comprobar que siga siendo la real.
- `docs/deploy.md`: `run_worker_first` incluye ahora `/comunidad*`; se activa con el merge a producción.
