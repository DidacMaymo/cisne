# F28 — Aviso de nombre público pendiente y enlace «Comunidad» del pie

## Plan
- Componente `NameNotice` (franja fina bajo la cabecera, en `Layout`), no sticky: no interfiere con `scroll-padding-top` ni con la barra móvil.
- Reutiliza `useSession` (ya se refresca con `onDataChange`): desaparece al guardar el nombre y aparece tras el alta sin recargar. Sin peticiones nuevas (en Supabase `me()` está cacheado).
- En `/ajustes/perfil` no se muestra la franja; la ayuda del campo «Nombre público» cambia al texto del aviso si no hay nombre.
- Pie: «Comunidad» en su propio `nav aria-label="Comunidad"`.

## Archivos tocados
- src/components/layout/NameNotice.tsx — nuevo (`role="status"`, fondo `papel`, enlace «Elegir nombre» con objetivo ≥ 44 px)
- src/components/layout/Layout.tsx — monta `NameNotice` tras `Header`
- src/pages/ProfileSettings.tsx — ayuda del campo explica el caso sin nombre
- src/components/layout/Footer.tsx — «Comunidad» fuera del `nav` «Legal»

## Evidencia
- `npx tsc -b` OK · `npm run lint` OK · sin SQL ni lógica pura nueva (no hay tests nuevos).
- Probar en la UI (lo ejecuta el líder):
  1. Modo local: registrarse con un nombre reservado (p. ej. «admin») → la franja aparece sin recargar bajo la cabecera, en cualquier página.
  2. «Elegir nombre» → `/ajustes/perfil`: la franja no se muestra; la ayuda del campo trae el texto del aviso.
  3. Guardar un nombre → la franja desaparece al navegar a otra página sin recargar.
  4. Sin sesión o con nombre: no hay franja. A 375 px el texto se ajusta sin scroll horizontal.
  5. Pie: «Comunidad» está en un `nav` propio, fuera de «Legal».

## Decisiones y dudas
- Texto del aviso: el propuesto, tal cual. El `role="status"` es educado (no interrumpe).
- La franja no es sticky y se desplaza con la página: es lo más simple y no toca la cabecera fija.
- En el pie, al ser un `nav` propio dentro del `justify-between`, el espaciado de «Comunidad» puede variar algo respecto a antes en escritorio.

## Commit sugerido
feat(cuenta): avisar de que falta el nombre público

- Franja bajo la cabecera con enlace a Ajustes → Perfil
- «Comunidad» del pie sale del grupo «Legal»
