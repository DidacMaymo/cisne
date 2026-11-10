# F30 — Los datos estructurados para Google sobreviven a la carga de la SPA

## Plan
- Causa: `Seo` borraba todo `[data-seo]` (incluido el `<script ld+json>` del Worker) y no lo regeneraba.
- Mover los constructores de JSON-LD a `src/lib/jsonld.ts` (puro, una sola fuente); el Worker los usa.
- `Seo` recibe `jsonLd` y lo aplica con `applyJsonLd` (quita el del Worker y el de la página anterior, pone el nuevo, limpia al desmontar).
- Las páginas de poema, autor, colección y artículo pasan su JSON-LD.

## Archivos tocados
- src/lib/jsonld.ts — nuevo: `poemJsonLd`, `authorJsonLd`, `collectionJsonLd`, `articleJsonLd`
- src/lib/jsonld-dom.ts — nuevo: `applyJsonLd(doc, data)` (marca `data-jsonld`; no toca el `Organization`, que no tiene marcas)
- src/components/Seo.tsx — prop `jsonLd` (no se emite si `noindex`, igual que el Worker)
- src/pages/{PoemPage,AuthorPage,CollectionPage,ComunidadArticulo}.tsx — pasan `jsonLd`
- worker/head.ts — delega en `src/lib/jsonld.ts` (mismo resultado)
- src/lib/jsonld.test.ts — 7 tests nuevos

## Evidencia
- `npx tsc -b` OK · `npm run lint` OK · `npm test` → 120 passed (7 nuevos: anonimato, igualdad Worker/SPA, sustitución sin duplicados, limpieza, escape)
- Probar en la UI (lo ejecuta el líder, en dev o producción):
  1. Abrir un poema público: `document.querySelectorAll('script[type="application/ld+json"]')` → 2 (`CreativeWork` + `Organization`).
  2. Ir a su autor desde el enlace: pasa a `Person` + `Organization`, sin el `CreativeWork`.
  3. `/comunidad/mujeres-poetas`: `BlogPosting` + `Organization`. Poema anónimo/seudónimo: sin `author`.
  4. Poema privado/borrador o página no encontrada: solo `Organization`.

## Decisiones y dudas
- Etiquetas, Home y Comunidad no tenían JSON-LD en el Worker; no se añade.
- En dev no hay Worker: el JSON-LD sale solo de la SPA (comportamiento equivalente).
- Artículos programados/borrador (solo visibles en dev) no emiten JSON-LD.

## Commit sugerido
fix(seo): conservar el JSON-LD de cada página tras cargar la SPA

- Constructores de JSON-LD compartidos entre Worker y SPA (src/lib/jsonld.ts)
- `Seo` regenera el JSON-LD y lo sustituye al navegar, sin duplicados
- Tests unitarios
