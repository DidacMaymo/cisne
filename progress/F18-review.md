# Review — F18 (segunda vuelta)

**Veredicto:** APPROVED

`./init.sh` termina en `[OK] Entorno listo` (RLS 87 casos).

## Aceptación
- [x] Rutas públicas + `<title>` + enlaces en el pie → App.tsx:56-58, LegalPage.tsx:23-29, Footer.tsx. Visual y 375 px: smoke del líder.
- [x] Textos coherentes con el código → verificados contra `report_poem` y `delete_my_account` / FKs.
- [x] Estética CISNE → LegalPage.tsx.
- [x] Email en una constante → contact.ts:2.
- [x] `/ajustes/privacidad` intacta.

## Cambios de la primera vuelta
1. LegalNotice.tsx:21 «Quien tenga cuenta puede denunciar un poema que no sea suyo» → cierto (denunciar_poema.sql: exige sesión, solo poemas, no el propio).
2. PrivacyPolicy.tsx:48-50: borrar cuenta elimina denuncias sobre tus poemas (cascade) y conserva las enviadas sin vínculo (`on delete set null`) → cierto.
3. App.tsx: formato corregido, NewPassword en orden alfabético.

## Checkpoints
R1 [x] · R2 [x] · R3 [x] · R4 [x] (UI estática, pasos manuales) · R5 [x] · R6 [x]

## Observaciones (no bloquean)
- Sin nombre/NIF/dirección del titular: añadirlos si se monetiza (LSSI).
- Conviene revisión profesional de los textos antes de abrir al público.
