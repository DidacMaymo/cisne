# F15 — «Mi página»

## Plan
- `AuthorPage` detecta al dueño (sesión.accountName == param) y muestra pestañas `?ver=publicados|borradores|colecciones`; `?ver=publica` = vista pública.
- `MyPoems` y `MyCollections` pasan a ser componentes de pestaña (sin cabecera propia; se reutilizan, sin duplicar).
- Rutas viejas y `/mi-pagina` redirigen (`MyPageRedirect`, conserva `state`/flash).
- Navegación: cabecera, barra móvil y pie nuevos.

## Archivos tocados
- src/pages/AuthorPage.tsx — pestañas del dueño, enlaces «Ver como lo ven los demás» / «Ajustes»; consultas públicas intactas
- src/pages/MyPoems.tsx, MyCollections.tsx — ahora componentes de pestaña; marcas Privado / Anónimo / Como …
- src/pages/MyPageRedirect.tsx — nuevo (`/mi-pagina`, `/mis/poemas`, `/mis/borradores`, `/mis/colecciones`, `/colecciones`)
- src/App.tsx, components/layout/{nav.ts,Header.tsx,MobileNav.tsx,Footer.tsx}
- src/data/local/local.test.ts — test: listMine incluye privado/anónimo/pseudónimo; listPublic por autor solo lo público

## Evidencia
- `npx tsc -b` OK · `npm run lint` OK · `npm test` → 31 tests OK (1 nuevo)
- Probar en la UI (lo ejecuta el líder):
  1. Con sesión, escritorio: cabecera Inicio · Explorar · Biblioteca · Mi página; pie solo con la frase; sin barra inferior.
  2. «Mi página» → /autor/<yo>?… con pestañas; crea un poema anónimo y uno privado: salen en Publicados con marca.
  3. Cambiar de pestaña cambia la URL; atrás vuelve. `/mis/borradores` abre Borradores; `/mis/colecciones` y `/colecciones` abren Colecciones.
  4. «Ver como lo ven los demás» (?ver=publica) o incógnito: sin pestañas, sin anónimo ni privado; «Volver a mi página».
  5. 375 px: barra inferior con 5 entradas, sin scroll horizontal, pestañas visibles; cabecera solo logo (y «Entrar» sin sesión).
  6. Sin sesión: `/mi-pagina` redirige a /entrar.

- Vuelta 2: `tabs`/`type Tab` movidos bajo los imports en AuthorPage.tsx; tsc y lint OK.

## Decisiones y dudas
- Vista pública del dueño: `?ver=publica` (valor extra del mismo parámetro).
- Marcas deducidas de PoemView (authorAccountName null: «Anónimo» o «Como X»); sin cambiar tipos ni repos.
- La consulta pública se sigue ejecutando también para el dueño (no se usa); simple y sin cambiar consultas.
- Móvil con sesión: sin enlace a cuenta en cabecera; Ajustes se alcanza desde «Mi página».
- «Mi página» en el menú no se marca activo estando en /autor/… (enlace a /mi-pagina).
- Write.tsx sigue enlazando `/mis/borradores` (redirige).

## Commit sugerido
feat(autor): «Mi página» con poemas, borradores y colecciones

- Pestañas privadas en /autor/:accountName solo para su dueño
- Redirecciones de rutas viejas y /mi-pagina
- Nueva navegación: barra inferior móvil y pie sin enlaces
