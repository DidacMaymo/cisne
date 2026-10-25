# CISNE

Plataforma minimalista de poesía en español. *Menos ruido, más poesía.*

Producto y diseño: [docs/BRIEF.md](docs/BRIEF.md). Mapa del repo y forma de trabajar con agentes: [AGENTS.md](AGENTS.md). Tareas: [feature_list.md](feature_list.md). Despliegue: [docs/deploy.md](docs/deploy.md).

## Arrancar

Requisitos: Node 20+ y npm.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # compila a dist/
npm run lint
./init.sh        # health check completo (lo mismo que la CI)
```

## Identidad

- Color: `blanco #FFFFFF`, `tinta #111111`, `papel #F5F5F3`, `gris #888888`, `linea #E7E7E4` (tokens en `src/styles/index.css`).
- Tipografía: **Cormorant Garamond** (títulos, autores, poemas) + **Inter** (interfaz), self-hosted con `@fontsource`.
- Emblema: `src/components/brand/SwanMark.tsx` (trazos SVG en `swan-paths.ts`, vectorizados de `brand/cisne-emblema.png`). Favicon: `public/favicon.svg`.

## Desplegar (Cloudflare)

Es una SPA estática: Cloudflare sirve los ficheros de `dist/` desde su CDN, como Worker con *static assets* (`wrangler.jsonc`), sin servidor propio. En cada `push` a `main` se vuelve a publicar.

1. Cloudflare → Workers & Pages → Create application → importar este repositorio.
2. Build command: `npm run build` · Deploy command: `npx wrangler deploy`.
3. Variables **de build** (*Settings → Build → Variables and secrets*): `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. `wrangler.jsonc` (`not_found_handling: single-page-application`) hace que las rutas de la SPA, como `/poema/123`, funcionen al recargar. No uses `_redirects`: en Workers da error de bucle infinito.

Detalle en [docs/deploy.md](docs/deploy.md).

## Backend (Supabase)

Sin claves, CISNE funciona en **modo local** (todo en el navegador). Para usar cuentas y datos reales, sigue [docs/SUPABASE.md](docs/SUPABASE.md): aplicar `supabase/migrations/`, configurar Auth y crear `.env.local` a partir de `.env.example`. `npm run test:db` comprueba las reglas de seguridad de la base de datos sin necesidad de Supabase.
