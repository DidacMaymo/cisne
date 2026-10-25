# F17 — Menú fijo, Biblioteca dentro de Mi página y redes en el pie

## Plan
- Cabecera `sticky top-0` + `scroll-padding-top` global.
- Quitar «Biblioteca» de `nav.ts` (cabecera) y `MobileNav` (grid 5 → 4 columnas).
- Biblioteca pasa a pestaña `?ver=biblioteca` de AuthorPage (`MyLibrary`); `/mis/biblioteca` redirige con `MyPageRedirect`.
- Pie con Instagram/TikTok desde `src/lib/social.ts`.

## Archivos tocados
- src/components/layout/Header.tsx — `sticky top-0 z-30 bg-blanco`, borde inferior, sin sombra
- src/styles/index.css — `scroll-padding-top: 5.5rem` en `html` (cabecera ≈ 61 px móvil / 77 px escritorio)
- src/components/layout/nav.ts, MobileNav.tsx — sin «Biblioteca»; barra móvil 4 columnas (más ancho por objetivo, alto `min-h-14`)
- src/pages/MyLibrary.tsx (nuevo; sustituye a `Library.tsx`, borrado) — mismo contenido y estado vacío, sin `<h1>` propio
- src/pages/AuthorPage.tsx — pestaña «Biblioteca» tras «Colecciones» (solo en vista de dueño)
- src/pages/MyPageRedirect.tsx, src/App.tsx — `/mis/biblioteca` → `/autor/<cuenta>?ver=biblioteca`; sin sesión → `/entrar` como las otras
- src/lib/social.ts (nuevo) — URLs únicas de redes
- src/components/layout/Footer.tsx — enlaces «Instagram» y «TikTok» (`target=_blank`, `rel`, texto sr-only «se abre en otra pestaña»)

## Evidencia
- `npx tsc -b` OK · `npm run lint` OK · no toca `supabase/` ni lógica con tests.
- Probar en la UI (lo ejecuta el líder), a 375 px y escritorio:
  1. Explorar: scroll → cabecera visible arriba; Tab desde arriba → «Saltar al contenido» y foco no queda bajo la cabecera.
  2. Con sesión: menú sin «Biblioteca» (cabecera y barra inferior, 4 elementos, sin scroll horizontal).
  3. Mi página: Publicados · Borradores · Colecciones · Biblioteca; `/mis/biblioteca` aterriza en esa pestaña; vacía muestra «Tu biblioteca está vacía.».
  4. Pie: Instagram y TikTok abren en otra pestaña.

## Decisiones y dudas
- Cuando el dueño ve `?ver=publica` no aparece la Biblioteca (solo la ve él), como el resto de pestañas.
- El `<h1>` «Mi biblioteca» desaparece: el h1 de la página es el nombre del autor.
- Los textos «Guardar/En tu biblioteca» siguen igual; la biblioteca ya no está en el menú pero sí en Mi página.
- `scroll-padding-top` fijo de 5.5rem (holgura sobre 77 px); si la cabecera cambia de altura, ajustar.

## Commit sugerido
feat(navegación): cabecera fija, Biblioteca en Mi página y redes en el pie

- Cabecera sticky con scroll-padding-top
- Biblioteca sale del menú y pasa a pestaña de Mi página (/mis/biblioteca redirige)
- Pie con Instagram y TikTok (URLs en src/lib/social.ts)

## Segunda vuelta
- `src/pages/AuthorPage.tsx`, `<nav aria-label="Tu página">`: `gap-x-8` pasa a `gap-x-4 sm:gap-x-8` y se añade `flex-wrap` como red de seguridad. Escritorio igual (>= 640 px); objetivos siguen con `min-h-11`.
- Probar a 375 px: las cuatro pestañas caben en una línea sin scroll horizontal (si alguna no cupiera, baja a una segunda línea, sin desbordar).

## Tercera vuelta
- `src/pages/AuthorPage.tsx`, `<nav aria-label="Tu página">`: en móvil `gap-x-3` y enlaces con `text-meta` (13 px); desde `sm` (>= 640 px) `sm:gap-x-8` y `sm:text-ui` (escritorio igual). Se mantienen `flex-wrap` y `min-h-11`.
- Estimación a 375 px: (78+79+88+69) px x 13/15 ≈ 272 px + 3 x 12 px = ≈ 308 px < 327 px útiles: una sola línea.
- `npx tsc -b` OK · `npm run lint` OK.
- Probar a 375 px: las cuatro pestañas en una línea; a >= 640 px sin cambios.
