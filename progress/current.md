# Sesión actual

> Lo mantiene el líder. Al empezar una feature se rellena; al cerrarla se
> resume en una línea en "Hecho" y se limpia "En curso".

## En curso
- —

## Hecho
- 2026-10-24 — F07 Arnés de agentes y CI (líder, solo docs/config). El build estaba en rojo en esta máquina solo porque `node_modules` no estaba al día con `package-lock.json` (faltaban `@supabase/supabase-js` y `@electric-sql/pglite`); `init.sh` ahora ejecuta `npm ci` cuando pasa esto. Tras `npm install`: lint, build y `test:db` en verde.

- 2026-10-25 — F08 Tests unitarios (Vitest 3.2.4, 30 tests: normalize, poem-markup, discover, repo local). APPROVED.
- 2026-10-25 — F15 «Mi página» (pestañas Publicados/Borradores/Colecciones para el dueño en `/autor/:accountName`, redirecciones de rutas viejas, barra inferior móvil, pie sin enlaces; `init.sh` solo cuenta features F* en `in_progress`). APPROVED.

- 2026-10-25 — F16 Ajustes de textos (portada «que te emocionan», pie sin el lema, biblioteca vacía, colecciones). APPROVED.

- 2026-10-25 — F17 Cabecera fija, Biblioteca como pestaña de Mi página, Instagram y TikTok en el pie (URLs genéricas hasta U4); `.claude/launch.json` fuera del repo. APPROVED (3 vueltas: pestañas de Mi página a 375 px en una línea).

## Deuda
- `CLAUDE.md` anterior (fases 1-6) sustituido por el arnés; su contenido de diseño vive en `docs/conventions.md` y el técnico en `docs/architecture.md`.
- `todobackend.md` sigue siendo la guía de las tareas U1-U3; cuando estén hechas, moverla a `docs/` o borrarla.
- El brief pide "sin contadores"; los apoyos muestran número al autor (decisión tomada). Si se revisa, es una feature.
- `poem-text` se testea dentro de `poem-markup.test.tsx`; un fichero propio sería más claro (observación del review F08).
- F15: «Mi página» no se marca activa en `/autor/<yo>`; PoemPage.tsx:35, Editor.tsx:221 y CollectionPage.tsx:234 navegan a rutas viejas (funcionan por redirección) y podrían apuntar directo a la pestaña; la consulta pública de AuthorPage también se ejecuta para el dueño sin usarse.
- F17: `scroll-padding-top` fijo (5.5rem) en `index.css`; ajustarlo si cambia la altura de la cabecera.
