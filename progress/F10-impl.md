# F10 — Prueba de punta a punta con Supabase real

**Cerrada por decisión de la usuaria (2026-10-27).** Sin detalle punto por punto.

## Evidencia
- **Base de datos de producción (proyecto `cisne`)** — comprobado por el líder con una consulta de solo lectura en el SQL Editor (la ejecutó la usuaria): están las 11 tablas (`author_supports, collection_poems, collections, favorites, poem_supports, poem_tags, poems, profiles, reports, tags, verse_comments`) y las funciones clave (`add_verse_comment, my_supports, report_poem, save_poem, toggle_poem_support`). La migración de F09 se aplicó ese día («Success. No rows returned»).
- **Conexión local** — comprobado por el líder: con `.env.local`, `/entrar` ya no muestra «Versión de prueba» y Explorar carga 7 poemas reales vía `/rest/v1/rpc/search_public_poems` y `/rest/v1/public_tags`, sin errores tras corregir la URL (llevaba `/rest/v1`, ya documentado en `todobackend.md` y `docs/SUPABASE.md`).
- **Producción** — comprobado por el líder: https://cisneverso.dmaymo.es usa Supabase y Explorar carga los mismos poemas.
- **Recorrido de `todobackend.md` §6** — hecho por la usuaria en su navegador: «ya está probado y funciona». No hay detalle de qué puntos se recorrieron ni con cuántas cuentas.
- **Privacidad y anonimato (puntos 4, 5, 7, 11-14)** — cubiertos a nivel de base de datos por `npm run test:db` (72 casos con dos usuarias sobre estas mismas migraciones). No verificados de forma independiente en el navegador contra Supabase real.

## Pendiente (apuntado en Deuda)
- Repetir §6 en el navegador integrado con dos cuentas de prueba (A en `http://localhost:5173`, B en `http://[::1]:5173`) y anotar cada punto, sobre todo 4, 5 y 7.
- Borrar las cuentas y poemas de prueba que se crearan, porque comparten la base de datos de producción.
