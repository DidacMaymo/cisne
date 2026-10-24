# CHECKPOINTS — Checklist objetivo de revisión

> No se evalúa el camino, se evalúa el destino. El `reviewer` recorre esto en
> cada feature y rechaza si algún punto R1-R6 queda sin marcar.

## R1 — Alcance

- [ ] Todos los criterios de **Aceptación** de la feature están cumplidos.
- [ ] No hay cambios que la feature no pida (ni refactors "de paso", ni
  dependencias nuevas no previstas).
- [ ] Ninguna dependencia nueva o actualizada exige Node > 20.10.

## R2 — Arquitectura

- [ ] Páginas y componentes acceden a datos **solo** vía `repos`
  (`src/data/index.ts`); nada de `supabase-js` ni `localStorage` en la UI.
- [ ] Si cambió `repositories.ts`, están actualizadas **las dos**
  implementaciones (`local/` y `supabase/`) y el modo local respeta las mismas
  reglas de privacidad.
- [ ] Cambios de esquema en una **migración nueva**; ninguna existente editada.
- [ ] Tabla nueva → RLS activado + políticas. Lectura pública solo por vistas
  `public_*` / funciones que filtran.
- [ ] Nada público expone `author_id`, `user_id`, email ni el perfil de un
  poema anónimo o con pseudónimo.
- [ ] Sin `any` (explícito o implícito); datos externos tipados o validados.

## R3 — Diseño y accesibilidad

- [ ] Solo tokens de la paleta y de la escala tipográfica; sin sombras,
  degradados ni colores nuevos (`docs/conventions.md`).
- [ ] Los poemas conservan saltos de línea y estrofas donde se muestren.
- [ ] Controles con nombre accesible, `<label>` en formularios, foco visible,
  objetivos ≥ 44 px, errores no solo por color.
- [ ] Nada que el brief deja fuera de alcance (contadores, rankings, popups…).
- [ ] Textos en español, tono sobrio.

## R4 — Tests

- [ ] Cambios en `supabase/` → casos nuevos en `supabase/tests/rls.test.mjs`
  (dueño, otra usuaria, anon; anonimato si aplica).
- [ ] Lógica pura nueva o modificada → test unitario (desde F08).
- [ ] Cambios de UI → pasos de prueba manual en `progress/<ID>-impl.md`,
  incluido 375 px.
- [ ] Los tests comprueban resultados concretos.

## R5 — Build

- [ ] `./init.sh` termina en `[OK] Entorno listo`.

## R6 — Higiene

- [ ] Sin `console.log` de depuración, código comentado ni TODOs sin contexto.
- [ ] Sin secretos: ni claves reales, ni `service_role`/`sb_secret_` en el
  código; `.env.local` no se sube.
- [ ] `progress/<ID>-impl.md` incluye un **commit sugerido**.

---

## Salud del repo (lo comprueba el líder al cerrar sesión)

- Como mucho una feature `in_progress`.
- Toda feature `done` (desde F07) tiene su `progress/<ID>-review.md` con `APPROVED`.
- `progress/current.md` describe la sesión actual.
