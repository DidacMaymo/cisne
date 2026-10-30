# F24 — Enlaces reales a Instagram y TikTok

## Plan
- URLs reales en `src/lib/social.ts` y función `organizationJsonLd()` (única fuente).
- La portada NO pasa por el Worker (`run_worker_first` solo /poema, /autor, /coleccion, /etiqueta, sitemap): el JSON-LD se mete en `index.html` en la compilación con un plugin de Vite que llama a `organizationJsonLd()`.
- Test unitario de los datos.

## Archivos tocados
- src/lib/social.ts — URLs reales, quitado «pendiente U4», `organizationJsonLd()`
- vite.config.ts — plugin `organizationLd` (transformIndexHtml, `<script type="application/ld+json">` en head)
- src/lib/social.test.ts — nuevo, comprueba name/url/logo/sameAs

## Evidencia
- `npx tsc -b` OK · `npm run lint` OK · `npm test` 63 OK (1 nuevo)
- `npx vite build` OK; `dist/index.html` contiene el JSON-LD Organization con las dos URLs en `sameAs`.
- Probar en la UI (líder): pie → «Instagram»/«TikTok» apuntan a las URLs nuevas (en otra pestaña, ya lo hacía el pie; verificar). Ver código fuente de la portada tras `npm run build`/en producción: JSON-LD presente (en `npm run dev` no se ve el de build... el plugin también actúa en dev).

## Decisiones y dudas
- El JSON-LD queda en el HTML base, así que aparece también en /poema etc. (el Worker solo reemplaza entre `<!--seo-->`); Organization sitewide es válido.
- No toqué el Worker. `init.sh` completo lo ejecuta el reviewer.

## Commit sugerido
feat(seo): enlaces reales a Instagram y TikTok y JSON-LD Organization

- URLs de @cisneverso.es en social.ts
- Organization con logo y sameAs inyectado en index.html al compilar
