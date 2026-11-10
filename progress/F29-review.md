# Review — F29

**Veredicto:** APPROVED

## Aceptación
- [x] Aviso legal: titular «Equipo de CISNE (CISNE, cisneverso.es)», enlace a `/contacto` (ruta existe, App.tsx:63) y email desde `CONTACT_EMAIL` (`contact.ts`, única fuente) → LegalPage.tsx `TeamContact`, LegalNotice.tsx:8. Sin nombre/NIF/dirección, como decidió el usuario.
- [x] Privacidad: responsable «Equipo de CISNE» (PrivacyPolicy.tsx:9) y nuevo punto sobre fecha del último cambio y direcciones anteriores, reservadas, no públicas, hasta borrar la cuenta, para evitar suplantaciones (líneas 18-22).
- [x] Cookies: CookiePolicy.tsx:37 solo dice «Escríbenos a email», no nombra responsable; coherente, sin cambios.
- [x] `LEGAL_UPDATED` = 10 de noviembre de 2026 (hoy).
- [x] `./init.sh` → `[OK] Entorno listo`.

## Exactitud respecto a `20261102120000_nombres_unicos.sql`
- Qué se guarda: `profiles.display_name_changed_at` (l.47) y `retired_account_names` (l.51, dirección anterior al cambiar de nombre, l.146). Exacto.
- Quién lo ve: `retired_account_names` con RLS, sin políticas y `revoke all` a anon/authenticated (l.56-57); `display_name_changed_at` no aparece en ninguna vista pública (grep). «No son públicas» es cierto. Matiz no bloqueante: la persona sí ve el mensaje con la fecha en que podrá volver a cambiar el nombre; no es exposición a terceros.
- Cuándo se borra: `user_id ... on delete cascade` (l.53) y `display_name_changed_at` es columna del perfil → desaparecen al borrar la cuenta. Coincide con «hasta que borres la cuenta» y con la sección de conservación.
- Finalidad: las direcciones reservadas impiden que otra persona las use (l.140, 202). «Evitar suplantaciones» es correcto.
- No se promete nada que la web no haga.

## Checkpoints
- R1 Alcance: [x] (solo textos, componente y fecha; sin dependencias)
- R2 Arquitectura: [x] (sin acceso a datos; sin SQL)
- R3 Diseño y accesibilidad: [x] (enlace subrayado como el resto de la página; tono sobrio)
- R4 Tests: [x] (solo texto; pasos manuales con 375 px en el informe; sin lógica nueva)
- R5 Build: [x]
- R6 Higiene: [x] (commit sugerido presente)

## Observaciones (no bloquean)
- LegalNotice.tsx:32 y :38-46 siguen diciendo «su responsable» / «el responsable de la web» en genérico; es coherente con el nuevo titular, no requiere cambio.
- Sigue pendiente la deuda de identificación (nombre/NIF/dirección) de F18, por decisión del usuario.
