# F16 — Ajustes de textos

## Plan
- Cambiar cuatro frases de interfaz, sin tocar estilos ni estructura.
- Comprobar con grep que ni tests ni otra parte de `src/` dependen de las frases antiguas.
- Verificar con `npx tsc -b`, `npm run lint` y `npm test`.

## Archivos tocados
- src/pages/Home.tsx — «que te acompañan» → «que te emocionan» (se mantiene el salto JSX)
- src/components/layout/Footer.tsx — «CISNE · poesía en español» (sin lema ni punto final)
- src/pages/Library.tsx — estado vacío: «Tu biblioteca está vacía.»
- src/pages/MyCollections.tsx — «Reúne tus poemas en poemarios, o guarda juntos los de otros.»

## Evidencia
- grep de «que te acompañan», «menos ruido, más poesía», «espera su primer poema» en `src/`: 0 coincidencias tras el cambio (ningún `*.test.ts*` las usaba).
- `npx tsc -b` OK · `npm run lint` OK (0 errores) · `npm test` → 4 ficheros, 31 tests pasados.
- Probar en la UI (lo ejecuta el líder):
  1. `/`: la frase bajo el título dice «…guarda los versos que te emocionan y escribe los tuyos con total libertad.»
  2. Pie de cualquier página: «CISNE · poesía en español».
  3. `/mis/biblioteca` con sesión y sin guardados: título «Tu biblioteca está vacía.»
  4. `/mis/colecciones`: subtítulo «Reúne tus poemas en poemarios, o guarda juntos los de otros.»

## Decisiones y dudas
- `docs/` no se toca: el lema del brief se queda.

## Commit sugerido
fix(textos): ajustes de cuatro frases de interfaz

- Inicio: «versos que te emocionan»
- Pie: «CISNE · poesía en español»
- Biblioteca vacía: «Tu biblioteca está vacía.»
- Mis colecciones: sin «que te acompañan»
