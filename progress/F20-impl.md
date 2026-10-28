# F20 — SEO técnico

## Plan
- Constantes y lógica pura de SEO en `src/lib/seo.ts`, compartidas por la SPA y el Worker.
- SPA: `Seo.tsx` (title/meta/canonical nativos de React 19) en cada página pública; `noindex` en privadas (Layout, vía `isPrivatePath`) y en no encontrados.
- Worker `worker/` (módulos puros + `index.ts`), `wrangler.jsonc` con `run_worker_first` solo en las 5 rutas.
- Fuentes: `src/styles/fonts.css` generado con `scripts/gen-fonts.mjs` (solo latin/latin-ext, woff2) + preload de Cormorant 400 latina.
- Dominio: `cisneverso.es` en plantillas de correo y constante `SITE_URL`.

## Archivos tocados
- `index.html` — metas por defecto (`og:*`, `twitter:*`) y hueco `<!--seo-->…<!--/seo-->` (etiquetas con `data-seo`)
- `public/og.png` + `scripts/make-og.py` (PIL; emblema `brand/cisne-emblema.png` + Cormorant de node_modules) · `public/robots.txt`
- `src/lib/seo.ts`, `src/components/Seo.tsx`; `Seo` añadido en Home, Explore, TagPage, PoemPage, AuthorPage, CollectionPage, NotFound, LegalPage (ahora con prop `path`, sustituye el `useEffect`), Layout
- `worker/{index,head,html,routes,sitemap,supabase}.ts` + `worker/worker.test.ts` (23 tests)
- `wrangler.jsonc` (`main`, `binding ASSETS`, `run_worker_first`, `keep_vars`), `tsconfig.worker.json` + referencia en `tsconfig.json`, `vitest.config.ts` (incluye `worker/**`)
- `package.json` — devDependency `@cloudflare/workers-types@5.20261028.1` (exacta)
- `src/styles/{index,fonts}.css`, `scripts/gen-fonts.mjs`, `vite.config.ts` (plugin de preload)
- `supabase/templates/*` — dominio · `docs/deploy.md` — sección «Worker de SEO»

## Evidencia
- `npx tsc -b` OK (incluye el Worker) · `npm run lint` OK · `npm test` → 6 ficheros, 60 tests OK (23 nuevos)
- `npm run build`: ficheros de fuente en `dist/assets`: **169 → 42** (95 woff2 + 74 woff antes); `dist` 4,4 MB → 2,1 MB. El preload sale con hash: `/assets/cormorant-garamond-latin-400-normal-B-1hWBU7.woff2`. Los marcadores `<!--seo-->` sobreviven a Vite.
- Probar en la UI (lo ejecuta el líder, `scripts/app.sh start`):
  1. Inicio → poema → autor: el título de la pestaña cambia (`Mar — Ana · CISNE`, `Ana — poemas en CISNE`).
  2. `/ajustes/perfil`, `/entrar`, `/escribir` y una ruta inexistente: `<meta name="robots" content="noindex">` en el head.
  3. `/robots.txt` sirve el fichero; `/og.png` se ve; revisar que el texto de la portada y los poemas (todas las fuentes de poema) siguen con su tipografía y con tildes/ñ.
  4. Poema: `<link rel="canonical">` absoluto con `https://cisneverso.es/poema/<id>`, sin query.
  - Tras el despliegue (usuario): configurar variables del Worker (`docs/deploy.md`), `curl https://cisneverso.es/poema/<id>` y `/sitemap.xml`.

## Decisiones y dudas
- Variables del Worker `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` (runtime, panel; `keep_vars: true`). No las declaro en `wrangler.jsonc` porque no conozco la URL del proyecto.
- Autor en título/JSON-LD solo si `author_account_name` existe (anónimo y seudónimo: sin autor ni enlace). Poema `sensitive`: descripción genérica, sin versos.
- Sin Supabase o error: poemas/autor/etc. devuelven el HTML normal; `/sitemap.xml` devuelve 503 (un index.html ahí sería peor). Poema/autor/colección/etiqueta inexistentes: 200 con `noindex`.
- Autores del sitemap = autores con poemas públicos con cuenta (sin consultar `public_profiles`). Colecciones: solo `poem_count > 0`. Paginado 1000 filas, máx. 10 páginas por lista (límite de 50 subrequests).
- Fuentes: `@fontsource` no trae CSS por subconjunto con `unicode-range` (ni en las variables), así que `scripts/gen-fonts.mjs` filtra los `@font-face` latin/latin-ext de los CSS del paquete y apunta a `node_modules/.../files/*.woff2`; se descarta el `.woff` de respaldo. Si cambian las fuentes, regenerar `fonts.css`.
- Las etiquetas `data-seo` (hueco del Worker/index.html) las retira `Seo` al montarse para no dejar metas del primer poema al navegar en la SPA. Páginas sin `Seo` (cargando) conservan las del servidor.
- `/colecciones` (ruta de redirección) se trata como privada. No he marcado casillas en `docs/seo.md` (lo dejo al líder).
- No he podido probar el Worker en ejecución (wrangler pide Node 22): lo verifica el primer despliegue. Riesgo: la sintaxis de `run_worker_first` con array requiere wrangler ≥ 4.x reciente (la CI de Cloudflare usa el suyo).

## Commit sugerido
feat(seo): SEO técnico, Worker de metadatos y sitemap, fuentes ligeras

- Metadatos por página, canónicas en cisneverso.es y noindex en rutas privadas
- og.png, robots.txt, Open Graph/Twitter y JSON-LD (poema, autor, colección)
- Worker que rellena el head en /poema, /autor, /coleccion, /etiqueta y sirve /sitemap.xml
- Fuentes solo latin y latin-ext (169 → 42 ficheros) con preload de Cormorant
- Dominio cisneverso.es en plantillas de correo; tests Vitest del Worker

## Segunda vuelta
- Poema `sensitive` sin título: nombre «Poema» (no el primer verso) en `poemMeta` (`src/lib/seo.ts`) y en el `name` del JSON-LD (`worker/head.ts`).
- Test nuevo en `worker/worker.test.ts`: head completo sin el primer verso.
- Quitada la mención a la regla 301 del informe.
- `npx tsc -b`, `npm run lint`, `npm test` verificados abajo.
