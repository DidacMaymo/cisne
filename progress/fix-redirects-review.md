# Review — fix-redirects (2ª vuelta)

**Veredicto:** APPROVED

## Aceptación
- [x] `public/_redirects` eliminado → `git diff` (D public/_redirects).
- [x] Fallback SPA cubierto → `wrangler.jsonc` `not_found_handling: single-page-application`.
- [x] Sin referencias en código → solo docs (README.md advertencia, feature_list.md histórico).
- [x] `./init.sh` en verde → termina en `[OK] Entorno listo` (lint, build, 72 casos RLS, tests unitarios, higiene OK).

## Revisión del cambio en init.sh (líder)
- Líneas 40-44: antes de `npm ci`, si `curl` a `http://localhost:5173/` responde (timeout 2 s), llama a `fail` con mensaje claro. Solo se evalúa dentro del `if` de reinstalación, así que no afecta al camino normal. `curl -s ... 2>/dev/null` no rompe con `set -e` al estar en condición de `if`. Correcto y acotado.

## Checkpoints
- R1 Alcance: [x]
- R2 Arquitectura: [x]
- R3 Diseño y accesibilidad: [x] (n/a)
- R4 Tests: [x] (n/a, sin lógica)
- R5 Build: [x]
- R6 Higiene: [x]

## Observaciones (no bloquean)
- `feature_list.md:17` menciona `_redirects` en F01 (histórico); se puede dejar.
- El chequeo de :5173 asume el puerto por defecto de Vite; si se cambia, no detectará el servidor.
