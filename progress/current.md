# Sesión actual

> Lo mantiene el líder. Al empezar una feature se rellena; al cerrarla se
> resume en una línea en "Hecho" y se limpia "En curso".

## En curso
- F27: PR abierto; falta que el usuario aplique `20261102120000_nombres_unicos.sql` en Supabase antes del merge.

## Hecho
- 2026-10-24 — F07 Arnés de agentes y CI (líder, solo docs/config). El build estaba en rojo en esta máquina solo porque `node_modules` no estaba al día con `package-lock.json` (faltaban `@supabase/supabase-js` y `@electric-sql/pglite`); `init.sh` ahora ejecuta `npm ci` cuando pasa esto. Tras `npm install`: lint, build y `test:db` en verde.

- 2026-10-25 — F08 Tests unitarios (Vitest 3.2.4, 30 tests: normalize, poem-markup, discover, repo local). APPROVED.
- 2026-10-25 — F15 «Mi página» (pestañas Publicados/Borradores/Colecciones para el dueño en `/autor/:accountName`, redirecciones de rutas viejas, barra inferior móvil, pie sin enlaces; `init.sh` solo cuenta features F* en `in_progress`). APPROVED.

- 2026-10-25 — F16 Ajustes de textos (portada «que te emocionan», pie sin el lema, biblioteca vacía, colecciones). APPROVED.

- 2026-10-25 — F17 Cabecera fija, Biblioteca como pestaña de Mi página, Instagram y TikTok en el pie (URLs genéricas hasta U4); `.claude/launch.json` fuera del repo. APPROVED (3 vueltas: pestañas de Mi página a 375 px en una línea).

- 2026-10-25 — F19 Textos de la portada más simples (título «Un lugar para la poesía.», Leer/Descubrir/Escribir, «Aquí solo hay palabras» sin «Sin contadores»). APPROVED (2ª vuelta: espacio en la lista).

- 2026-10-25 — F09 Denunciar un poema (motivos: odio/ofensa, acoso, plagio, otro; texto ≤ 50 palabras; una denuncia por persona y poema; solo vía `report_poem`, nadie lee `reports` desde el navegador). Migración `20261101120000_denunciar_poema.sql`. APPROVED (2ª vuelta: el modo local no encontraba los poemas de ejemplo; lo detectó el smoke test).

- 2026-10-25 — F11 Carga diferida: editor, ajustes, auth, pestañas privadas, Zod y los repositorios (local y Supabase) se descargan al usarse. Entrada: local 467,54 → 323,31 KB (−30,8 %); con Supabase 680,85 → 323,41 KB (−52,5 %). Proxy en `src/data/lazy.ts` con tests. APPROVED (3 vueltas).

- 2026-10-26 — F12 Accesibilidad y móvil: auditoría de 19 rutas a 375 px (sin scroll horizontal, nombres accesibles, teclado y diálogos correctos). Arreglado: gris `#888888` → `#767676` (AA), títulos y autores enlazados de listados ≥ 44 px, nombre de autora en portada de colección a tinta. APPROVED (2 vueltas).

- 2026-10-27 — F10 Supabase real: migración de F09 aplicada en producción, BD comprobada (11 tablas, funciones clave), `.env.local` local conectado. Cerrada por decisión de la usuaria tras su prueba manual (sin detalle por punto; ver Deuda).

- 2026-10-27 — F14 Correos de CISNE: plantillas en español (`supabase/templates/`: confirmar, recuperar, cambio de email) con el cisne como PNG (`public/email/cisne.png`) y guía en `docs/SUPABASE.md`. APPROVED (2 vueltas).

- 2026-10-28 — F18 Páginas legales: `/aviso-legal`, `/privacidad` y `/cookies` enlazadas desde el pie, contacto info@cisneverso.es en `src/lib/contact.ts`. Textos contrastados con el código (sin analítica ni cookies; denuncias solo con cuenta y sobre poemas ajenos; al borrar la cuenta las denuncias enviadas quedan desvinculadas). APPROVED (2ª vuelta).

- 2026-10-28 — F20 SEO técnico: metadatos y canónicas (`https://cisneverso.es`) por página, `noindex` en privadas, `robots.txt`, `og.png`, Worker que rellena el `<head>` de poema/autor/colección/etiqueta y sirve `/sitemap.xml` (23 tests; sin autor en anónimos, sin versos en «Cisne negro»), fuentes 169 → 42 ficheros (dist 4,4 → 2,1 MB), dominio cisneverso.es en plantillas de correo. APPROVED (2ª vuelta: un «Cisne negro» sin título filtraba su primer verso en el título).

- 2026-10-28 — U2 cerrada: plantillas de correo en Supabase con SMTP propio (correo real comprobado), variables de runtime del Worker, sitemap en Search Console, vista previa probada en opengraph.xyz.
- 2026-10-29 — F21 Sobre CISNE (`/sobre`) y Contacto (`/contacto`, solo `mailto:`), en el pie y en el sitemap; `/cookies` y `/privacidad` describen Cloudflare Web Analytics (sin cookies). APPROVED a la primera.

- 2026-10-29 — F22 Quitado el lema «menos ruido, más poesía» de la web (Sobre CISNE, SEO, metas para compartir) y de la documentación de agentes; sustituido por «un lugar para la poesía». APPROVED.

- 2026-10-29 — F23 CISNE en el móvil: manifiesto web e iconos del cisne (instalable desde Safari y Chrome), sección «¿Y en el móvil?» con tutorial y «Apoyar el proyecto» (Ko-fi pendiente de U5). APPROVED.

- 2026-10-30 — F24 Enlaces reales a Instagram y TikTok (@cisneverso.es) y JSON-LD `Organization` en el HTML base (plugin de Vite; la portada no pasa por el Worker). APPROVED.

- 2026-10-30 — F25 Comunidad de escritores: artículos Markdown en `content/comunidad/`, sección en la portada, enlace en el pie, `/comunidad` y `/comunidad/:slug`, Worker con `BlogPosting` y sitemap (lee `dist/comunidad.json`), plantilla `_plantilla.md` y guía `docs/comunidad.md`. 3 artículos del líder en borrador hasta que el usuario los revise. APPROVED (2ª vuelta: saltos de verso en las citas).

- 2026-10-30 — Comunidad: publicadas las 3 primeras entradas (dónde publicar, tipos de estrofas, concursos), revisadas por el usuario.

- 2026-10-31 — F26 Programar artículos por fecha: filtro en tiempo de ejecución con la fecha de Madrid (SPA y Worker), caché de `/comunidad*` 5 min y sitemap 30 min. APPROVED. Ojo: los programados viajan en el bundle y en `comunidad.json` (no sirve para ocultar contenido sensible).

- 2026-10-31 — Comunidad: 14 artículos programados hasta el 13 de noviembre (3 publicados el 31 de octubre y uno al día después; el 12 y el 13, mujeres poetas e instapoesía), investigados con fuentes y revisados por el líder.

- 2026-10-31 — F27 Nombre público único (normalizado), reservados, un cambio cada 30 días, dirección que sigue al nombre (las antiguas reservadas, sin redirigir) y pseudónimos que no suplantan. APPROVED.

## Correcciones
- 2026-10-27 — En F11 se dijo que producción servía el modo local: era falso. Producción ya estaba conectada a Supabase (proyecto `cisne`, de Didac). Las cifras de F11 con Supabase (680,85 → 323,41 KB, −52,5 %) son las que aplican a producción. Faltaba aplicar en producción la migración de F09 (aplicada el 2026-10-27).

## Deuda
- `CLAUDE.md` anterior (fases 1-6) sustituido por el arnés; su contenido de diseño vive en `docs/conventions.md` y el técnico en `docs/architecture.md`.
- `todobackend.md` sigue siendo la guía de las tareas U1-U3; cuando estén hechas, moverla a `docs/` o borrarla.
- El brief pide "sin contadores"; los apoyos muestran número al autor (decisión tomada). Si se revisa, es una feature.
- `poem-text` se testea dentro de `poem-markup.test.tsx`; un fichero propio sería más claro (observación del review F08).
- F15: «Mi página» no se marca activa en `/autor/<yo>`; PoemPage.tsx:35, Editor.tsx:221 y CollectionPage.tsx:234 navegan a rutas viejas (funcionan por redirección) y podrían apuntar directo a la pestaña; la consulta pública de AuthorPage también se ejecuta para el dueño sin usarse.
- F17: `scroll-padding-top` fijo (5.5rem) en `index.css`; ajustarlo si cambia la altura de la cabecera.
- F09: los tests «no puede leer reports» aceptan error o 0 filas (`.catch(() => [])`); «Ya denunciado» solo se detecta al enviar.
- F11: en modo local el build emite chunks de Supabase y Zod que nunca se descargan (inocuo); en local los datos llegan tras un import dinámico extra.
- F12: la prueba de «foco oculto bajo la cabecera fija» no fue fiable (panel del navegador oculto); repetirla con el panel visible. Logotipo «CISNE» gris en la portada de colección sobre papel (4,16:1), aceptado como decorativo. `text-[0.625rem]` (10 px) en la portada pequeña, fuera de la escala tipográfica.
- F10: repetir `todobackend.md` §6 punto por punto en el navegador con dos cuentas de prueba (A en `localhost:5173`, B en `[::1]:5173`), sobre todo privacidad (4, 5, 7). Las pruebas escriben en la BD de producción: borrar cuentas de prueba al terminar.
- F18: sin nombre, NIF ni dirección del titular (decisión del usuario). Añadirlos antes de monetizar (LSSI). Conviene que un profesional revise los textos antes de abrir al público.
- F20: el Worker no se puede ejecutar en local (wrangler pide Node 22); se prueba en producción (comprobado el 2026-10-28: sitemap y metadatos de poema). Si se cambian las fuentes, regenerar `src/styles/fonts.css` con `scripts/gen-fonts.mjs`.
- Rendimiento: primera medida de Cloudflare Web Analytics (2026-10-29, 1 visita) da LCP 2,76 s en la portada («mejorable», el umbral bueno es 2,5 s). Esperar a tener más visitas antes de actuar; si se confirma, mirar fuentes/LCP de la portada.
- F21: `LEGAL_UPDATED` es común a las tres legales (el aviso legal muestra 29 oct sin cambios de texto). Los textos de analítica asumen Web Analytics sin cookies: si se cambia el modo en Cloudflare, revisarlos.
- F25: el enlace «Comunidad» del pie está dentro del `nav` con `aria-label="Legal"`; moverlo o renombrar la etiqueta cuando se toque el pie.
- Comunidad: revisar cada pocos meses `editoriales-que-aceptan-manuscritos-de-poesia` (las editoriales abren y cierran la lectura; convocatorias de 2026) y el precio del ISBN en `como-autopublicar-un-poemario`.
- F27: si un alta usa un nombre ocupado o reservado, el perfil se crea sin nombre y no se avisa; añadir un aviso en Ajustes/cabecera cuando `displayName` esté vacío.
- F27: el pseudónimo no toma el advisory lock (carrera nombre/pseudónimo simultáneos, impacto bajo).
