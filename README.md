# CISNE

Plataforma minimalista de poesía en español. *Menos ruido, más poesía.*

Producto y diseño: [docs/BRIEF.md](docs/BRIEF.md). Guía de implementación y fases: [CLAUDE.md](CLAUDE.md).

## Arrancar

Requisitos: Node 20+ y npm.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # compila a dist/
npm run lint
```

## Identidad

- Color: `blanco #FFFFFF`, `tinta #111111`, `papel #F5F5F3`, `gris #888888`, `linea #E7E7E4` (tokens en `src/styles/index.css`).
- Tipografía: **Cormorant Garamond** (títulos, autores, poemas) + **Inter** (interfaz), self-hosted con `@fontsource`.
- Emblema: `src/components/brand/SwanMark.tsx` (trazos SVG en `swan-paths.ts`, vectorizados de `brand/cisne-emblema.png`). Favicon: `public/favicon.svg`.

## Desplegar (Cloudflare Pages)

Es una SPA estática: Pages sirve los ficheros de `dist/` desde su CDN, sin servidor propio.

1. En Cloudflare → Workers & Pages → Create → Pages → conectar este repositorio.
2. Build command: `npm run build` · Output directory: `dist`.
3. Variable de entorno `NODE_VERSION=20` (o superior).
4. `public/_redirects` (`/* /index.html 200`) hace que las rutas de la SPA, como `/poema/123`, funcionen al recargar.

## Backend (Supabase)

Sin claves, CISNE funciona en **modo local** (todo en el navegador). Para usar cuentas y datos reales, sigue [docs/SUPABASE.md](docs/SUPABASE.md): aplicar `supabase/migrations/`, configurar Auth y crear `.env.local` a partir de `.env.example`. `npm run test:db` comprueba las reglas de seguridad de la base de datos sin necesidad de Supabase.
