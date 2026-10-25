# Review — F09

**Veredicto:** APPROVED

## Aceptación
- [x] `ReportRepository` con impl. local y supabase → `repositories.ts` (`ReportRepository`, `reports` en `Repositories`), `local/index.ts` (`reports.report`), `supabase/index.ts` (rpc `report_poem`) + 2 tests en `local.test.ts`.
- [x] Diálogo accesible, 4 motivos exactos, texto ≤50 palabras, obligatorio en «Otro» → `ReportButton.tsx` (`<dialog>` modal, `aria-labelledby`, fieldset/legend, radios 44 px, `role=alert/status`); validado también en `report_poem` y en local. Casos `rls.test.mjs` (otro sin texto, 51 palabras, 50 válidas). Pasos manuales en el informe.
- [x] Una denuncia por persona → `unique (reporter_id, poem_id)` + comprobación previa con mensaje «Ya has denunciado este poema»; caso «denunciar dos veces: mensaje claro».
- [x] Anon no inserta → casos «anon no puede denunciar» y «anon no puede insertar en reports».

## Seguridad (comprobado)
- Nadie lee `reports` desde el navegador: `revoke select/insert/update/delete` a anon/authenticated y no hay política de select; casos «Bea/Ana no pueden leer reports».
- `report_poem`: `security definer`, `search_path=''`, `execute` solo a `authenticated` (revoke a public/anon). Usa `auth.uid()`, no un parámetro; sin uid, error.
- Poema propio rechazado, privado/borrador ajeno rechazado (`can_read_poem`), con casos de test.
- Sin fuga de autor/email: la función no devuelve datos.
- Migración nueva `20261101120000_…` ordena después de `20261020120000_…`; no edita las anteriores (solo `drop policy`/`alter` desde la nueva). El modo local replica las mismas reglas.

## Checkpoints
- R1 Alcance: [x] (docs/architecture.md es la fila de `reports`; feature_list/current son del líder)
- R2 Arquitectura: [x] (UI usa `repos.reports`, sin supabase-js directo)
- R3 Diseño y accesibilidad: [x] (revisado por código; visual lo confirma el smoke test del líder)
- R4 Tests: [x]
- R5 Build: [x] `./init.sh` → `[OK] Entorno listo` (RLS 87 casos)
- R6 Higiene: [x]

## Observaciones (no bloquean)
- Los checks «no puede leer reports» usan `.catch(() => [])`, así que pasan tanto con error de permisos como con 0 filas; es válido para el objetivo.
- «Ya denunciado» solo se detecta al enviar (decisión documentada).

## Segunda vuelta (arreglo del modo local)
- `local/index.ts` `reports.report`: ahora lee con `world()` y valida `isPublic(p) || autor`; un borrador ajeno sigue dando «no existe o es privado», el propio sigue rechazado. Sin fuga.
- Test `local.test.ts` («denuncias a poemas ajenos», con `DEV` true): denuncia un poema del seed y la repetición da «Ya has denunciado».
- `./init.sh` -> `[OK] Entorno listo` (RLS 87 casos). Veredicto final: APPROVED.
