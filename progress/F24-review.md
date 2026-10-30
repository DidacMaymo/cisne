# Review — F24

**Veredicto:** APPROVED

## Aceptación
- [x] URLs reales en `social.ts`, comentario «pendiente U4» quitado → src/lib/social.ts:1-5 (el pie ya consumía `socialLinks`)
- [x] JSON-LD Organization (name, url, logo icon-512, sameAs desde `socialLinks`) → `organizationJsonLd()` en social.ts:12-20 + plugin `organizationLd` en vite.config.ts:27-36; `dist/index.html:27` lo contiene tras el build. Test: src/lib/social.test.ts (valores concretos).
- [x] `./init.sh` → `[OK] Entorno listo` (87 casos RLS, tests unitarios OK)

## Checkpoints
- R1 Alcance: [x] (sin dependencias nuevas; `feature_list.md`/`current.md` son del líder)
- R2 Arquitectura: [x] (sin datos ni supabase; una sola fuente de URLs)
- R3 Diseño y accesibilidad: [x] (sin cambios visuales)
- R4 Tests: [x]
- R5 Build: [x]
- R6 Higiene: [x] (commit sugerido presente)

## Sobre el plugin de Vite
Correcto y simple. La portada no pasa por el Worker, así que inyectar en compilación es lo adecuado. En `dist/index.html` el `<script type="application/ld+json">` queda en línea 27, fuera de `<!--seo-->…<!--/seo-->` (líneas 14-24): el Worker no lo duplica ni lo pisa, y no lleva `data-seo`, así que `Seo` tampoco lo toca. El escape de `<` evita cerrar el script. `vite.config.ts` importa `./src/lib/social`, que no tiene dependencias, y `tsc -b` pasa.

## Observaciones (no bloquean)
- El JSON-LD sale también en /poema, /autor, etc. (HTML base); Organization sitewide es válido.
- El texto de «Probar en la UI» del implementer dice que el plugin actúa en dev; es correcto, pero la verificación fiable es sobre el build o producción.
