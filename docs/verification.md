# Verificación — cómo demostrar que funciona

> Regla de oro: **el agente no dice "funciona", lo demuestra.** Toda feature
> termina con evidencia ejecutable.

## Nivel 1 — Tipos y lint (siempre)

```bash
npx tsc -b        # TypeScript strict, sin any implícitos
npm run lint
```

## Nivel 2 — Base de datos (obligatorio si se toca `supabase/`)

`npm run test:db` aplica **todas** las migraciones en PGlite y ejecuta los
casos de `supabase/tests/rls.test.mjs` con dos usuarias (Ana y Bea) y anónimo.

Por cada tabla, vista, política o función nueva o modificada, añade casos que
cubran:

- el camino feliz del dueño;
- que **otra usuaria no puede** leer/editar/borrar lo ajeno o lo privado;
- que **anon** solo ve lo publicado y público;
- si hay anonimato o pseudónimo: que no se expone `author_id`/`user_id`.

Cada caso imprime `✓ descripción`; el script termina en `Todo correcto`.

## Nivel 3 — Lógica pura del frontend (desde F08)

`npm test` (Vitest) para funciones de `src/lib/` y `src/data/*.ts`
(normalizar etiquetas, marcado del poema, barajado de «Descubrir», esquemas
Zod, reglas del repositorio local). Comprueba resultados concretos, no "no
lanza".

## Nivel 4 — UI (manual, documentado)

Para cambios de pantalla, el implementer escribe en `progress/<ID>-impl.md`
los pasos exactos para probarlo, y el líder los ejecuta en el navegador
integrado con `scripts/app.sh start`:

```
1. http://localhost:5173/escribir → escribir dos estrofas → Vista previa
2. Las estrofas siguen separadas por una línea en blanco
3. A 375 px: sin scroll horizontal, botones ≥ 44 px
```

En modo local hay datos de ejemplo ("Ejemplo de desarrollo"). Para lo que
necesita dos cuentas reales (privacidad, anonimato entre usuarios), la
prueba es `test:db` + la lista de `todobackend.md` §6 con Supabase conectado.

## Comandos

```bash
./init.sh --quick   # dependencias + tipos
./init.sh           # verificación final (obligatoria): lint, build, test:db, tests, higiene
```

## Anti-patrones

- ❌ "He añadido la política, debería funcionar." → falta el caso en `test:db`.
- ❌ Esconder algo en la UI en lugar de protegerlo con RLS.
- ❌ Cambiar `repositories.ts` y actualizar solo una implementación.
- ❌ Editar una migración ya existente.
- ❌ Tests que dependen de Supabase real, de internet o del orden.
- ❌ Marcar nada como terminado con `./init.sh` en rojo.

## Si `./init.sh` está en rojo

No se marca nada como `done`. El implementer anota el bloqueo en
`progress/<ID>-impl.md` y responde `blocked -> ...`; el líder pone la feature
en `blocked` y lo reporta al usuario.
