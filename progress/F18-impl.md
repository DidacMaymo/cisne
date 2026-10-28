# F18 — Páginas legales

## Plan
- Constante `CONTACT_EMAIL` + fecha en `src/lib/contact.ts`.
- Componente `LegalPage` (título, fecha, `document.title`) y tres páginas lazy.
- Rutas públicas `/aviso-legal`, `/privacidad`, `/cookies` y enlaces en el pie.
- Cookies: describir solo lo que hay en el código.

## Archivos tocados
- src/lib/contact.ts — email y fecha (único sitio)
- src/components/LegalPage.tsx — maqueta común, `ContactLink` (mailto), `LegalSection`
- src/pages/LegalNotice.tsx, PrivacyPolicy.tsx, CookiePolicy.tsx — textos
- src/App.tsx — rutas con `React.lazy` (dentro del `Suspense` del Layout)
- src/components/layout/Footer.tsx — `nav` «Legal» junto a las redes (con `flex-wrap`, conserva el `pb-24` móvil)

## Evidencia
- `npx tsc -b` y `npm run lint` OK · `npm run lint` OK.
- Probar en la UI (líder):
  1. Pie: «Aviso legal · Privacidad · Cookies» en escritorio y a 375 px (no tapado por la barra inferior, sin scroll horizontal).
  2. Cada enlace abre su página sin sesión; pestaña con título «<página> — CISNE»; fecha y email `mailto:`.
  3. En Privacidad, «Ajustes → Cuenta» lleva a `/ajustes/cuenta` (pide sesión).

## Decisiones y dudas
- Comprobado en código: no hay analítica ni `document.cookie`. Se guarda en localStorage: sesión de Supabase (por defecto de supabase-js), autoguardado del editor (`cisne:escritura:*`), preferencia `cisne:ocultar-cisne-negro`, y en modo local `cisne:local:v1` (no descrito: solo dev).
- No había mecanismo de `<title>` por página; `LegalPage` lo fija con `useEffect` y lo restaura al salir.
- Sin nombre, NIF ni dirección (decisión del usuario). Habrá que añadirlos si se monetiza (LSSI).
- Textos conviene revisarlos por un profesional antes de depender de ellos.

## Commit sugerido
feat(legal): páginas de aviso legal, privacidad y cookies

- Rutas públicas /aviso-legal, /privacidad y /cookies con carga diferida
- Enlaces legales en el pie; contacto info@cisneverso.es en una constante

## Segunda vuelta
- LegalNotice: denuncias solo con cuenta, solo poemas ajenos.
- PrivacyPolicy: denuncias enviadas se conservan desvinculadas; las de tus poemas se borran con ellos.
- App.tsx: formato corregido (`NewPassword = lazy(`, `path="*" element`) y NewPassword en orden alfabético.
- `npx tsc -b` OK · `npm run lint` OK.
