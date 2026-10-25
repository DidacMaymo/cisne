# F19 — Textos de la portada más simples

## Plan
- Sustituir en `src/pages/Home.tsx` título, textos de las 3 puertas, lista de principios y frase bajo la lista, copiando la aceptación literalmente.
- No tocar estilos ni estructura.
- Grep de frases antiguas para comprobar que ningún test depende de ellas.

## Archivos tocados
- src/pages/Home.tsx — solo cadenas de texto; «Sin contadores» eliminado sin sustituto.

## Evidencia
- `npx tsc -b` OK · `npm run lint` OK
- Grep de las frases antiguas: solo aparecen en `docs/BRIEF.md` (documentación); ningún test las usa.
- Probar en la UI (lo ejecuta el líder):
  1. Inicio a 375 px y en escritorio: título «Un lugar para la poesía.».
  2. Columnas Leer/Descubrir/Escribir con los textos nuevos.
  3. Lista «Sin fotografías · Sin seguidores · Sin rankings» y debajo «Aquí los poemas se descubren al azar, no por popularidad.»
  4. Subtítulo, botones, separador y bloque final sin cambios.

## Decisiones y dudas
- `docs/BRIEF.md` aún contiene frases antiguas de la portada; no se toca (fuera de alcance), por si el líder quiere actualizarlo.

## Segunda vuelta
- `src/pages/Home.tsx:29`: añadido el espacio tras la coma (`'Sin seguidores', 'Sin rankings'`). Nada más.

## Commit sugerido
fix(portada): textos más simples y directos

- Nuevo título, descripciones de Leer/Descubrir/Escribir y frase del bloque final
- Se quita «Sin contadores» de la lista
