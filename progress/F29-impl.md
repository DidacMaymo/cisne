# F29 — Aviso legal con el Equipo de CISNE y privacidad al día

## Plan
- Componente `TeamContact` en `LegalPage.tsx` (Equipo de CISNE + enlace a /contacto + email desde `contact.ts`).
- Usarlo en Aviso legal y Privacidad como responsable.
- Privacidad: añadir fecha del último cambio de nombre y direcciones de autor anteriores (reservadas).
- `LEGAL_UPDATED` = 10 de noviembre de 2026.

## Archivos tocados
- src/components/LegalPage.tsx — nuevo `TeamContact` (+ import de `Link`)
- src/pages/LegalNotice.tsx — titular y responsable: Equipo de CISNE, con contacto
- src/pages/PrivacyPolicy.tsx — responsable Equipo de CISNE; nuevo punto sobre datos del cambio de nombre
- src/lib/contact.ts — `LEGAL_UPDATED`

## Evidencia
- `npx tsc -b` OK · `npm run lint` OK. No toca SQL ni lógica con tests.
- Probar en la UI (lo ejecuta el líder):
  1. Pie → Aviso legal: «Equipo de CISNE (CISNE, cisneverso.es)», enlace «página de contacto» (/contacto) y email.
  2. Pie → Privacidad: mismo responsable; en «Qué datos tratamos», punto sobre fecha del último cambio de nombre y direcciones anteriores reservadas, no públicas, hasta borrar la cuenta, para evitar suplantaciones.
  3. Ambas muestran «Última actualización: 10 de noviembre de 2026». Revisar a 375 px.

## Decisiones y dudas
- Cookies no nombra al responsable (solo «Escríbenos a email»): sin cambios.
- Sin nombre, NIF ni dirección (deuda F18 intacta).
- Sin el lema «menos ruido, más poesía».

## Commit sugerido
feat(legal): nombrar al Equipo de CISNE como responsable

- Aviso legal y privacidad con contacto (página y email)
- Privacidad recoge fecha de cambio de nombre y direcciones reservadas
- Fecha de actualización: 10 de noviembre de 2026
