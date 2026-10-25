# Sesión actual

> Lo mantiene el líder. Al empezar una feature se rellena; al cerrarla se
> resume en una línea en "Hecho" y se limpia "En curso".

## En curso
- F12 — Revisión de accesibilidad y móvil (rama `fix/F12-accesibilidad-movil`). **Parada por límite de uso; aún sin implementer.**
  - Auditoría del líder en navegador (2026-10-25), 19 rutas a 375 px: sin scroll horizontal en ninguna; todos los controles con nombre accesible.
  - Contraste: único fallo, `gris #888888` sobre blanco 3,54:1 (texto meta, menú inactivo, acciones). Decisión del usuario: oscurecer a `#767676`.
  - Objetivos táctiles: títulos enlazados de los listados miden 37–43 px.
  - Pendiente de revisar: recorrido solo con teclado (inicio → poema → escribir → publicar → colección), foco visible en diálogos y `prefers-reduced-motion`.
  - Siguiente paso: lanzar implementer con esta lista → reviewer → smoke test con teclado → PR y merge.

## Hecho
- 2026-10-24 — F07 Arnés de agentes y CI (líder, solo docs/config). El build estaba en rojo en esta máquina solo porque `node_modules` no estaba al día con `package-lock.json` (faltaban `@supabase/supabase-js` y `@electric-sql/pglite`); `init.sh` ahora ejecuta `npm ci` cuando pasa esto. Tras `npm install`: lint, build y `test:db` en verde.

- 2026-10-25 — F08 Tests unitarios (Vitest 3.2.4, 30 tests: normalize, poem-markup, discover, repo local). APPROVED.
- 2026-10-25 — F15 «Mi página» (pestañas Publicados/Borradores/Colecciones para el dueño en `/autor/:accountName`, redirecciones de rutas viejas, barra inferior móvil, pie sin enlaces; `init.sh` solo cuenta features F* en `in_progress`). APPROVED.

- 2026-10-25 — F16 Ajustes de textos (portada «que te emocionan», pie sin el lema, biblioteca vacía, colecciones). APPROVED.

- 2026-10-25 — F17 Cabecera fija, Biblioteca como pestaña de Mi página, Instagram y TikTok en el pie (URLs genéricas hasta U4); `.claude/launch.json` fuera del repo. APPROVED (3 vueltas: pestañas de Mi página a 375 px en una línea).

- 2026-10-25 — F19 Textos de la portada más simples (título «Un lugar para la poesía.», Leer/Descubrir/Escribir, «Aquí solo hay palabras» sin «Sin contadores»). APPROVED (2ª vuelta: espacio en la lista).

- 2026-10-25 — F09 Denunciar un poema (motivos: odio/ofensa, acoso, plagio, otro; texto ≤ 50 palabras; una denuncia por persona y poema; solo vía `report_poem`, nadie lee `reports` desde el navegador). Migración `20261101120000_denunciar_poema.sql`. APPROVED (2ª vuelta: el modo local no encontraba los poemas de ejemplo; lo detectó el smoke test).

- 2026-10-25 — F11 Carga diferida: editor, ajustes, auth, pestañas privadas, Zod y los repositorios (local y Supabase) se descargan al usarse. Entrada: local 467,54 → 323,31 KB (−30,8 %); con Supabase 680,85 → 323,41 KB (−52,5 %). Proxy en `src/data/lazy.ts` con tests. APPROVED (3 vueltas).

## Deuda
- `CLAUDE.md` anterior (fases 1-6) sustituido por el arnés; su contenido de diseño vive en `docs/conventions.md` y el técnico en `docs/architecture.md`.
- `todobackend.md` sigue siendo la guía de las tareas U1-U3; cuando estén hechas, moverla a `docs/` o borrarla.
- El brief pide "sin contadores"; los apoyos muestran número al autor (decisión tomada). Si se revisa, es una feature.
- `poem-text` se testea dentro de `poem-markup.test.tsx`; un fichero propio sería más claro (observación del review F08).
- F15: «Mi página» no se marca activa en `/autor/<yo>`; PoemPage.tsx:35, Editor.tsx:221 y CollectionPage.tsx:234 navegan a rutas viejas (funcionan por redirección) y podrían apuntar directo a la pestaña; la consulta pública de AuthorPage también se ejecuta para el dueño sin usarse.
- F17: `scroll-padding-top` fijo (5.5rem) en `index.css`; ajustarlo si cambia la altura de la cabecera.
- F09: los tests «no puede leer reports» aceptan error o 0 filas (`.catch(() => [])`); «Ya denunciado» solo se detecta al enviar.
- F11: en modo local el build emite chunks de Supabase y Zod que nunca se descargan (inocuo); en local los datos llegan tras un import dinámico extra.
