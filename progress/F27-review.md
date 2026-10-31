# Review — F27

**Veredicto:** APPROVED

## Aceptación
- [x] Normalización SQL/TS con tests → `normalize_name` (migración) + `names.ts`; `names.test.ts`; rls.test «…otras mayúsculas y sin tildes»
- [x] Unicidad por trigger, duplicados previos respetados → `profiles_name_guard` solo actúa si cambia `display_name`; sin índice único; rls: «duplicado preexistente puede seguir editando» y «no puede pasar a otro nombre ocupado»
- [x] Reservados como nombre y pseudónimo → `is_reserved_name`; rls: bucle de reservados, «Anónimo», «Cisneverso»
- [x] 30 días, fecha puesta por la BD → columna fuera del `grant update` (init.sql:211); rls: Ana/Bea no pueden escribirla; mensaje con fecha
- [x] `account_name` regenerado, antiguas reservadas sin redirigir → rls: `ana-lia` no encontrada, Bea obtiene `ana-lia-2`; tabla sin lectura/escritura para anon ni authenticated
- [x] Pseudónimo (poema y habitual) → `assert_pseudonym_allowed` en `save_poem` y trigger; rls cubre ambos, también como borrador
- [x] Modo local con mismas reglas → `local/index.ts` + 4 tests en `local.test.ts`
- [x] Migración nueva y compatible → ver abajo
- [x] Tests con Ana y Bea; `./init.sh` → `[OK] Entorno listo` (129 casos BD)

## Checkpoints
- R1 Alcance: [x] · R2 Arquitectura: [x] · R3 Diseño/accesibilidad: [x] · R4 Tests: [x] · R5 Build: [x] · R6 Higiene: [x]

## Puntos pedidos
- **Seguridad:** todas las funciones nuevas con `set search_path = ''`; las internas (`assert_*`, `profiles_*_guard`) con execute revocado a public/anon/authenticated. `display_name_changed_at` no sale por `public_profiles` (vista con columnas explícitas). `retired_account_names`: RLS activo sin políticas + revoke all.
- **Carreras:** `pg_advisory_xact_lock` por nombre normalizado y por base de dirección, y el `exists` se evalúa después del lock (snapshot nuevo en read committed): dos altas/cambios simultáneos se serializan. Hueco menor: el pseudónimo no toma el lock (nombre y pseudónimo cruzados a la vez); impacto bajo.
- **Plazo:** vaciar el nombre se rechaza; cambiar solo tildes/mayúsculas/espacios es libre y no sella fecha ni toca dirección (no hay forma de saltarse ni de ganar plazo); primer nombre desde vacío no cuenta.
- **Aplicar antes del merge con el frontend actual:** no cambia firmas (`create or replace` de `save_poem` con la misma firma conserva los grants; `handle_new_user` igual), solo añade columna nullable, tabla vacía y triggers; no toca datos ni crea índice único, así que los duplicados existentes no pueden hacerla fallar. Ningún `create function` choca con nombres previos. El frontend viejo muestra los `raise exception` en español. Perfiles viejos que guardan bio con el mismo nombre/pseudónimo no disparan reglas.
- **Alta con nombre usado/reservado → perfil sin nombre, sin avisar:** aceptable en esta feature. Romper el alta daría un error genérico de Supabase Auth y con confirmación por email no hay forma de avisar en el formulario sin una RPC pública nueva (superficie nueva, fuera de alcance). El resultado es recuperable (Ajustes y el editor lo piden). No lo exijo como cambio.

## Observaciones (no bloquean)
- Apuntar en Deuda: avisar tras el alta/primer acceso si el perfil se quedó sin nombre (aviso en Ajustes/cabecera cuando `displayName` está vacío).
- Comentario de la migración (línea 10) cita `src/data/normalize.ts`; el espejo está en `src/data/names.ts`. Se corrige en cualquier migración futura (esta aún no está aplicada: puede editarse antes de aplicar, a criterio del líder).
- Pseudónimo vs nombre en carrera sin lock (ver arriba).
- Verificar en UI con Supabase real el aviso de duplicado y el plazo (en local no son comprobables del todo; cubiertos en test:db).
