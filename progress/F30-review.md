# Review — F30

**Veredicto:** APPROVED

## Aceptación
- [x] JSON-LD conservado tras la carga → `Seo.tsx` regenera con `applyJsonLd`; constructores únicos en `src/lib/jsonld.ts`, usados por `worker/head.ts` y las 4 páginas. Test «el Worker y la SPA generan lo mismo» (`jsonld.test.ts:31`).
- [x] Sustitución al navegar, sin duplicados ni restos → `jsonld-dom.ts:22-33` (borra `data-seo` y `data-jsonld`, cleanup al desmontar, `ldKey` re-aplica al cambiar de poema); tests `jsonld.test.ts:90` y `:98`. `Organization` (inyectado por `vite.config.ts:30` sin marcas) no se toca: queda una vez.
- [x] Anónimo/seudónimo sin datos del autor real → `jsonld.ts:35` exige `authorAccountName`; en los repos (`supabase/index.ts:164-176`, `local/index.ts:115`) es `null` si es anónimo/seudónimo; test `jsonld.test.ts:25`. Colecciones: igual (`jsonld.ts:75`, owner null sin nombre público).
- [x] Tests + `./init.sh` → verde (129 casos RLS, tests unitarios, build).

## Checkpoints
- R1 Alcance: [x] (etiquetas/Home sin JSON-LD, igual que antes)
- R2 Arquitectura: [x] (lógica pura compartida, sin supabase-js en UI)
- R3 Diseño y accesibilidad: [x] (sin cambio visual)
- R4 Tests: [x]
- R5 Build: [x] `./init.sh` → `[OK] Entorno listo`
- R6 Higiene: [x]

## Privacidad
- Poema privado/borrador: `Seo` no emite JSON-LD con `noindex` (`Seo.tsx`), y el artículo no publicado tampoco. Sin fugas nuevas; el JSON-LD usa solo campos ya públicos en la vista.
- Escape `<`, `>`, `&` idéntico al de `worker/html.ts` (test `jsonld-dom` línea 108). Worker: tests de `worker.test.ts` en verde, salida igual.

## Observaciones (no bloquean)
- `serializeJsonLd` duplica el escape de `worker/html.ts:14`; podría compartirse más adelante.
- El test de escape no valida el `<` de la clave; irrelevante, JSON.stringify escapa igual.
- Smoke test en navegador pendiente (líder).
