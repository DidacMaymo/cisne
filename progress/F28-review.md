# Review — F28

**Veredicto:** APPROVED

## Aceptación
- [x] Aviso con sesión y `displayName` vacío, texto con el motivo y enlace a Ajustes → Perfil; no sin sesión ni con nombre → NameNotice.tsx:8 (`!session || session.displayName` → null); montado en Layout.tsx:27, así sale en todas las páginas. Verificado por lectura; sin test automático (UI, pasos manuales en el informe).
- [x] Aparece/desaparece sin recargar → `useSession` usa `useQuery`, que se refresca con `onDataChange`; el alta y `profile.update` emiten el evento (supabase/index.ts `changed()`, local/store.ts:111/119). Sin parpadeo: el `key` no cambia, `loading` no vuelve a true.
- [x] Sobrio y accesible → `role="status"` (educado), tokens `border-linea`, `bg-papel`, `text-gris`, `text-ui`, sin sombras; enlace `min-h-11`; el texto se ajusta (sin ancho fijo, `max-w-ancho`).
- [x] Pie: «Comunidad» en `nav aria-label="Comunidad"`, fuera de «Legal» → Footer.tsx:30. Cambio mínimo (+5/-1).
- [x] `./init.sh` → `[OK] Entorno listo` (129 casos RLS, unitarios OK). No hay lógica pura nueva, por tanto no hacen falta tests.

## Checkpoints
- R1 Alcance: [x] (el cambio en ProfileSettings.tsx:105 es coherente: en esa ruta no se muestra la franja y la ayuda explica el caso)
- R2 Arquitectura: [x] solo `useSession` (hook existente); sin `repos` nuevos ni SQL
- R3 Diseño y accesibilidad: [x]
- R4 Tests: [x] pasos manuales presentes (incluye 375 px)
- R5 Build: [x]
- R6 Higiene: [x] commit sugerido presente

## Puntos vigilados
- Peticiones: no se añade ninguna petición nueva. `useSession` ya lo usa Header y `me()` está cacheado en Supabase (`meCache`); en modo local es `localStorage`.
- Cabecera/`scroll-padding-top`/barra móvil: la franja no es sticky y va en el flujo bajo `<header sticky>`; no interfiere con ninguno. El `pb-28` y el pie no se tocan.
- Privacidad: no se expone nada nuevo; solo se usa la sesión propia (`accountName`/`displayName`).

## Observaciones (no bloquean)
- Pie en escritorio: al ser un `nav` más dentro de `justify-between`, el reparto horizontal puede variar; confirmar en el smoke test que no se ve raro a 1280 px y a 375 px.
- El texto del aviso está duplicado en NameNotice.tsx:12 y ProfileSettings.tsx:107; aceptable, pero si cambia hay que tocar los dos.
