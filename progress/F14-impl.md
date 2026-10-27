# F14 — Correos de CISNE personalizados

## Plan
- Generar `public/email/cisne.png` desde `brand/cisne-emblema.png`.
- Tres plantillas HTML (tablas + estilos en línea) y README con asuntos.
- Guía corta en `docs/SUPABASE.md`.

## Archivos tocados
- public/email/cisne.png — 96×96 RGB opaco (2,8 KB), tinta sobre blanco
- supabase/templates/confirmar.html, recuperar.html, cambio-email.html
- supabase/templates/README.md — tabla fichero / casilla del panel / asunto
- docs/SUPABASE.md — sección «Correos de CISNE» (antes del paso 3)

## Evidencia
- PNG: Python 3.12 + Pillow 12.1 (ya instalado, nada añadido al proyecto): aplanado sobre blanco, LANCZOS a 96×96; pixel (0,0)=blanco, mínimo=(0,0,0).
- Script `html.parser` sobre las 3 plantillas: parsean y solo usan `.ConfirmationURL`, `.Email`, `.NewEmail` (esta última solo en cambio-email).
- `npx tsc -b` OK · `npm run lint` OK. No se tocó `src/`.
- Probar (líder/usuario): tras el merge, pegar plantillas en el panel y registrar cuenta nueva; el cisne solo se ve cuando `/email/cisne.png` esté publicado.

## Decisiones y dudas
- Asuntos: «Confirma tu correo en CISNE», «Recupera tu contraseña de CISNE», «Confirma tu nuevo correo en CISNE».
- La guía avisa de que el panel puede exigir SMTP propio (U3) para editar plantillas; remitente, límite y «powered by Supabase» también dependen de U3.
- Pie con color #767676 sobre blanco (AA). `color-scheme: light only` en meta para evitar inversión en modo oscuro.
- No pude renderizar en Gmail; solo validación estructural.

## Commit sugerido
feat(correos): plantillas de correo de CISNE en español

- Plantillas de confirmar, recuperar y cambio de email
- Cisne en PNG opaco servido por la web
- Guía en docs/SUPABASE.md

## Segunda vuelta
- cambio-email.html: la frase final pasa a «Si no pediste este cambio, puedes ignorar este correo.» (observación del review). Nada más tocado; no se re-ejecutaron tsc/lint (solo HTML).
