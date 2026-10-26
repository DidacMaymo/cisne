# F12 — Revisión de accesibilidad y móvil

## Plan
- Token `gris` a `#767676` (4,54:1 sobre blanco); buscar otros `#888`.
- Enlaces de lectura en listados a ≥ 44 px sin cambiar el aspecto.
- Revisar otros enlaces (colección, relacionados, ajustes de apoyos).

## Archivos tocados
- src/styles/index.css — `--color-gris: #767676`
- src/components/PoemListItem.tsx — enlaces de título y de autor: `inline-flex min-h-11 items-center`
- README.md — token gris actualizado (docs/conventions.md ya lo hizo el líder)

## Evidencia
- `npx tsc -b` OK · `npm run lint` OK. Sin lógica con tests ni SQL.
- Probar en la UI (líder), a 375 px: en Explorar, autor, etiqueta y biblioteca el título y el autor de cada poema miden ≥ 44 px de alto y se ven igual; textos grises (fecha, menú inactivo) algo más oscuros.

## Decisiones y dudas
- `#888` sueltos: `public/favicon.svg` solo contiene «888» en una coordenada de trazado (no es color); `swan-paths.ts` igual. `docs/BRIEF.md:52` sigue diciendo `#888888` (brief original, no lo toco; el líder decide).
- Otros enlaces revisados, sin cambio: `RelatedPoems` ya `min-h-11`; `MyPoems` «Leer» ya `min-h-11`; índice de colección (2 líneas, ~64 px) y lista de apoyos en ajustes (~50 px) superan 44 px; `PoemReader` enlace a colección es texto en línea dentro de una frase (excepción WCAG 2.5.8 para enlaces en texto).
- Se añadió también el enlace del autor en `PoemListItem` (medía ~28 px).

## Lista de pantallas revisadas
- Auditoría del líder (navegador, 375 px): 19 rutas sin scroll horizontal; todos los controles con nombre accesible.
- Contraste: único fallo `gris #888888` sobre blanco 3,54:1 (meta, menú inactivo, acciones) → arreglado a `#767676`.
- Teclado (2026-10-26): orden lógico y contorno visible (2 px tinta; blanco en Cisne negro) en portada, poema y listados; diálogos (A una colección, Denunciar) atrapan el foco, Esc cierra y el foco vuelve al botón; `lang="es"`, un `h1` por página; `prefers-reduced-motion` presente. Prueba de foco bajo la cabecera no fiable; `scroll-padding-top` existe desde F17.
- Objetivos táctiles: títulos de listados 37–43 px → arreglados (≥ 44 px) en Explorar, autor, etiqueta, biblioteca; enlace de autor también.

## Segunda vuelta
- Review: el gris sobre `bg-papel` en `CollectionCover` queda en 4,16:1 (< 4,5).
- Decisión del líder: el nombre de la autora (l. 24) pasa a `text-tinta`. El logotipo «CISNE» (l. 15) se queda en `text-gris`: es decorativo (la portada es `aria-hidden` y el título se repite fuera de ella).
- Solo se cambió `src/components/CollectionCover.tsx`. El tamaño de 10 px es preexistente y queda como deuda.

## Commit sugerido
fix(a11y): contraste AA del gris y objetivos táctiles de 44 px

- Token gris de #888888 a #767676 (4,54:1 sobre blanco)
- Enlaces de título y autor en listados con min-h-11
