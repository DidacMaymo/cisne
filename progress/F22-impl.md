# F22 — Quitar el lema «menos ruido, más poesía»

## Plan
- Sustituir el lema en About.tsx, seo.ts e index.html por los textos de la aceptación.
- Comprobar worker/ y tests por textos literales.

## Archivos tocados
- src/pages/About.tsx — cursiva «Un lugar para la poesía.» y nueva descripción
- src/lib/seo.ts — SITE_DESCRIPTION «CISNE — un lugar para la poesía en español.»
- index.html — 3 metas (description, og, twitter) con el mismo texto

## Evidencia
- `npx tsc -b` OK · `npm run lint` OK · `npm test` 61/61 OK (worker.test.ts no dependía del texto; el worker no contiene el lema)
- `grep -ri "menos ruido"` en src/, worker/, public/, index.html, supabase/templates/ → sin resultados
- Probar en la UI (líder):
  1. `/sobre` → cursiva «Un lugar para la poesía.».
  2. Portada: metas description/og/twitter = «CISNE — un lugar para la poesía en español.».

## Decisiones y dudas
- Ninguna. No he ejecutado `./init.sh` (es del reviewer).

## Commit sugerido
fix(web): quitar el lema «menos ruido, más poesía»

- Sobre CISNE, SITE_DESCRIPTION y metas de index.html pasan a «un lugar para la poesía»
