# Review — F08

**Veredicto:** APPROVED

## Aceptación
- [x] `npm test` (Vitest, sin watch) e `init.sh` lo ejecuta → package.json `"test": "vitest run"`; `./init.sh` muestra "Tests unitarios OK".
- [x] normalize → `src/data/normalize.test.ts` (mayúsculas, espacios, `#`, tildes, 30 car.).
- [x] poem-markup / poem-text → `src/lib/poem-markup.test.tsx` (negrita/cursiva, saltos y estrofas con `renderToStaticMarkup`, escapes, stripMarkup, toggleMark, makeExcerpt, firstLine).
- [x] discover → `src/data/discover.test.ts`: misma semilla = mismo orden, otra semilla distinto, sin pérdidas ni mutación. Sobre «máx. 1-2 por autor»: `shuffleDiverse` solo garantiza no repetir voz consecutiva (discover.ts:24-37), no hay tope por autor. El test de «ninguna voz seguida» es la propiedad real y sustituye razonablemente al criterio literal; se acepta. Observación: el criterio de feature_list.md debería reescribirse.
- [x] Repo local → `src/data/local/local.test.ts`: borrador y privado fuera de `listPublic`/`search`; anónimo sin autor (nombre, cuenta, búsqueda, filtro por autor); pseudónimo solo expone el alias.

## Checkpoints
- R1 Alcance: [x] vitest 3.2.4 exacto, engines `^20` (compatible con Node 20.10); sin cambios fuera de alcance.
- R2 Arquitectura: [x] solo tests y config; sin `any`.
- R3 Diseño y accesibilidad: [x] n/a (sin UI)
- R4 Tests: [x] aserciones concretas.
- R5 Build: [x] `./init.sh` → `[OK] Entorno listo` (lint, build, 72 casos RLS, tests unitarios).
- R6 Higiene: [x] sin console.log ni secretos; el informe incluye commit sugerido.

## Observaciones (no bloquean)
- Reescribir en `feature_list.md` el criterio de discover a «no dos seguidos de la misma voz» para que refleje el comportamiento real.
- `poem-text` se testea dentro de `poem-markup.test.tsx`; funciona, pero un fichero propio sería más claro.
