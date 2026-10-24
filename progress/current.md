# Sesión actual

> Lo mantiene el líder. Al empezar una feature se rellena; al cerrarla se
> resume en una línea en "Hecho" y se limpia "En curso".

## En curso
- —

## Hecho
- 2026-10-24 — F07 Arnés de agentes y CI (líder, solo docs/config). El build estaba en rojo en esta máquina solo porque `node_modules` no estaba al día con `package-lock.json` (faltaban `@supabase/supabase-js` y `@electric-sql/pglite`); `init.sh` ahora ejecuta `npm ci` cuando pasa esto. Tras `npm install`: lint, build y `test:db` en verde.

## Deuda
- `CLAUDE.md` anterior (fases 1-6) sustituido por el arnés; su contenido de diseño vive en `docs/conventions.md` y el técnico en `docs/architecture.md`.
- `todobackend.md` sigue siendo la guía de las tareas U1-U3; cuando estén hechas, moverla a `docs/` o borrarla.
- El brief pide "sin contadores"; los apoyos muestran número al autor (decisión tomada). Si se revisa, es una feature.
