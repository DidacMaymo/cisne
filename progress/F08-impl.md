# F08 — Tests unitarios del frontend

## Plan
- Añadir Vitest 3.2.4 (exacto; compatible con Node 20.10) y script `npm test` = `vitest run`.
- Tests de lógica pura: normalize, poem-markup/poem-text, discover.
- Tests del repositorio local con `localStorage` en memoria y `DEV=false` (sin poemas de ejemplo).
- `init.sh` ya ejecutaba `npm test` si existe el script: no hizo falta editarlo.

## Archivos tocados
- package.json / package-lock.json — `vitest@3.2.4` (devDependency exacta) y script `test`
- vitest.config.ts — entorno node, `src/**/*.test.{ts,tsx}`
- src/data/normalize.test.ts — etiquetas (mayúsculas, espacios, `#`, tildes, 30 car.), foldText, slugify, normalizePoemText
- src/lib/poem-markup.test.tsx — negrita/cursiva, saltos y estrofas, escapes, stripMarkup, toggleMark, makeExcerpt, firstLine
- src/data/discover.test.ts — misma semilla = mismo orden, no pierde poemas, sin misma voz seguida
- src/data/local/local.test.ts — borrador/privado fuera de `listPublic`/`search`; anónimo y pseudónimo no exponen autor

## Evidencia
- `npx tsc -b` OK · `npm run lint` OK · `npm test` → 4 ficheros, 30 tests en verde (Node 20.10)
- Probar en la UI: nada visible; ejecutar `npm test`.

## Decisiones y dudas
- «Máx. 1-2 por autor» no existe como tal en `shuffleDiverse`: lo que garantiza es no poner dos seguidos de la misma voz mientras haya alternativa (solo el final puede repetir). El test comprueba eso, no un tope por autor.
- `init.sh` no se ha modificado: su rama completa ya llama a `npm test` cuando el script existe (el CI lo hereda).
- `npm install` avisa de vulnerabilidades en `npm audit` (preexistentes/transitivas); no se tocan.

## Commit sugerido
test(frontend): añadir Vitest y tests de lógica pura y repo local

- Vitest 3.2.4 y script `npm test`
- Tests de normalize, poem-markup/poem-text, discover
- Tests de visibilidad y anonimato del repositorio local
