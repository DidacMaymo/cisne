# F09 — Denunciar un poema

## Plan
- Migración nueva: `category` + `detail` en `reports`, `unique (reporter_id, poem_id)`, función `report_poem` (única vía de inserción; se quita el insert directo y los grants de tabla).
- `ReportRepository.report()` en `repositories.ts`, con `local/` y `supabase/`.
- `ReportButton` (botón + `<dialog>` en portal) en `PoemPage`, solo en poemas ajenos y públicos.
- Casos en `rls.test.mjs` y tests unitarios del repo local.

## Archivos tocados
- supabase/migrations/20261101120000_denunciar_poema.sql — columnas, restricción única, `report_poem`, sin insert directo
- supabase/tests/rls.test.mjs — 13 casos de denuncias
- src/data/repositories.ts, local/index.ts, local/store.ts, supabase/index.ts — `reports.report`
- src/components/ReportButton.tsx — botón + diálogo (radios, texto ≤50 palabras, confirmación «Gracias»)
- src/pages/PoemPage.tsx — monta el botón
- src/data/local/local.test.ts — 2 tests nuevos
- docs/architecture.md — fila de `reports`

## Evidencia
- `npx tsc -b` OK · `npm run lint` OK · `npm run test:db` → Todo correcto (13 casos nuevos) · `npm test` 33 OK
- Probar en la UI (lo ejecuta el líder):
  1. Con sesión, poema ajeno (p. ej. de ejemplo): «Denunciar» junto a Compartir → diálogo con 4 motivos.
  2. Enviar sin motivo → «Elige un motivo.»; «Otro motivo» sin texto → «Cuéntanos brevemente el motivo.»; 51 palabras → error.
  3. Motivo válido → «Gracias / Hemos recibido tu aviso». Repetir en el mismo poema → «Ya has denunciado este poema.»
  4. Poema propio: no hay botón. Sin sesión: «Denunciar» lleva a /entrar y vuelve al poema.
  5. 375 px: diálogo sin scroll horizontal, filas ≥ 44 px. En un «Cisne negro» el diálogo no sale invertido.

## Decisiones y dudas
- Se guarda `category` (odio/acoso/plagio/otro, con check) y `detail`; `reason` queda legible: «Etiqueta — detalle» para el panel.
- No hay insert directo en `reports` (ni política ni grant): solo `report_poem` (security definer), que da errores en español. Nadie lee la tabla desde el navegador.
- Texto de la denuncia: máx. 50 palabras y 600 caracteres (igual que comentarios).
- «Ya denunciado» solo se detecta al enviar (no se pre-comprueba al abrir): lo más simple.

## Segunda vuelta
- Bug: `reports.report` local buscaba el poema en `s.poems` (solo los del usuario). Ahora lee con `world()` y `isPublic`, y escribe con `commit` (patrón de `comments.add`). `src/data/local/index.ts`.
- Test nuevo en `local.test.ts` (con `DEV` true): denuncia un poema del seed y la repetición da «Ya has denunciado».

## Commit sugerido
feat(poemas): denunciar un poema

- report_poem: motivo, texto ≤50 palabras, una denuncia por persona y poema
- Botón «Denunciar» y diálogo en la página de lectura
- Casos en test:db y tests del repositorio local
