# F27 — Nombre público único, dirección que lo sigue y pseudónimos

## Plan
- Migración nueva: `normalize_name` (translate, sin unaccent), reservados, columna `display_name_changed_at`, tabla `retired_account_names` (RLS sin políticas + revoke), triggers en `profiles`, `handle_new_user` y `save_poem` con `create or replace`.
- Espejo en TS (`src/data/names.ts`) y en el modo local (mismas reglas y mensajes).
- UI: Ajustes → Perfil explica los 30 días, la fecha del próximo cambio y que la dirección cambia.
- Tests: casos nuevos en `rls.test.mjs`, unitarios de normalización y del repo local.

## Archivos tocados
- supabase/migrations/20261102120000_nombres_unicos.sql — todo lo de BD (nueva, sin editar ninguna anterior)
- supabase/tests/rls.test.mjs — ~40 casos nuevos; Bea se registra ahora como «Bea Sol» (antes tenía el mismo nombre que Ana y el alta ya no lo permite)
- src/data/names.ts (+ names.test.ts) — normalizeName, reservados, fechas, mensajes
- src/data/local/index.ts, store.ts, local.test.ts — reglas en modo local (store: `retiredAccountNames`)
- src/data/types.ts, src/data/supabase/index.ts — `displayNameChangedAt` (solo lectura)
- src/pages/ProfileSettings.tsx — textos, campo de solo lectura mientras dura el plazo, dirección actualizada tras guardar
- docs/architecture.md — lista de migraciones

## Evidencia
- `npx tsc -b` OK · `npm run lint` OK · `npm test` 113 OK · `npm run test:db` → Todo correcto (129 comprobaciones, ~40 nuevas)
- Probar en la UI (lo ejecuta el líder; en modo local basta con `scripts/app.sh start`):
  1. Registro → Ajustes → Perfil: texto de «una vez cada 30 días; el primer cambio es libre» y aviso de la dirección.
  2. Cambiar el nombre → mensaje «Tu página de autor ahora está en /autor/…»; Ajustes → Cuenta muestra la nueva; `/autor/<antigua>` → no encontrado.
  3. Cambiar otra vez → campo bloqueado con «a partir del …». Con «CISNE», «Anónimo» → error claro (en una cuenta con plazo libre).
  4. Editor: pseudónimo «Anónimo» → error.
  5. Duplicado entre cuentas y fecha del plazo solo se prueban de verdad con Supabase (cubierto en test:db).

## Decisiones y dudas
- **Paso del usuario en Supabase:** aplicar `20261102120000_nombres_unicos.sql` (SQL Editor) ANTES del merge. Es compatible con el frontend actual: no cambia firmas; los mensajes de error son `raise exception` en español y el frontend viejo ya los muestra.
- Duplicados existentes: se respetan; las reglas solo corren si `display_name` cambia. Sin índice único. La comprobación hace seq scan de `profiles` (suficiente a esta escala; si crece, índice no único sobre `normalize_name(display_name)`).
- Alta con nombre ya usado o reservado: **no falla**; el perfil se crea con nombre vacío y dirección `autor-N` (no se deriva de un nombre rechazado). Hoy el registro no avisa de ello; el usuario lo ve en Ajustes y al publicar («Escribe tu nombre público…»). Se podría avisar en F posterior.
- Cambiar solo mayúsculas/tildes/espacios del propio nombre es libre y no toca dirección ni plazo. Quien no tenía nombre y elige el primero: libre y no estrena el plazo. Vaciar el nombre se rechaza (si no, sería un modo de saltarse el plazo).
- Dirección retirada reservada para siempre para otras personas; su dueña puede recuperarla si vuelve a un nombre que la genere. Se borran con la cuenta (cascade).
- Normalización: SQL usa translate (áàâäãéèêëíìîïóòôöõúùûüñç); TS usa NFD sin marcas. Difieren solo en caracteres exóticos.
- Reservados añadidos a la lista pedida: `administrador`, `anonima`.
- Worker y sitemap: sin cambios (ya consultan `public_profiles`/`public_poems` por `account_name` actual; una dirección antigua → perfil inexistente → `notFoundHead`).
- Pseudónimo por poema: no se re-comprueba si es el que el poema ya tenía (no bloquea editar poemas viejos).

## Commit sugerido
feat(perfil): nombre público único y dirección que lo sigue

- Nombre único normalizado, reservados y un cambio cada 30 días (triggers)
- La dirección /autor sigue al nombre; las antiguas quedan reservadas sin redirigir
- Pseudónimos no pueden ser el nombre de otra persona ni un reservado
- Mismas reglas en modo local; Ajustes → Perfil explica el plazo
