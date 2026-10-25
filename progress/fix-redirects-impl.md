# fix-redirects — Quitar public/_redirects

## Plan
- Borrar `public/_redirects` (regla de Pages que provoca el bucle infinito en Workers).
- Comprobar que nada lo referencia; tsc y build.

## Archivos tocados
- public/_redirects — eliminado

## Evidencia
- grep de `_redirects` en `src/`, `vite.config.ts`, `index.html`: sin resultados
- `npx tsc -b` OK · `npm run build` OK (solo el aviso habitual de tamaño de chunk)
- `dist/_redirects` ya no existe tras el build
- Lint no ejecutado (no se tocó código).

## Decisiones y dudas
- Documentación pendiente del líder.

## Commit sugerido
fix(deploy): quitar public/_redirects, sobra en Cloudflare Workers

- La regla `/* /index.html 200` provocaba el error 100324 (bucle infinito)
- El fallback SPA ya lo cubre `not_found_handling` en wrangler.jsonc
