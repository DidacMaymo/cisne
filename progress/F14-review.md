# Review — F14 (segunda vuelta)

**Veredicto:** APPROVED

## Aceptación
- [x] Plantillas Confirm signup / Reset password / Change email + asuntos → `supabase/templates/{confirmar,recuperar,cambio-email}.html` y `README.md`. `.NewEmail` solo en `cambio-email.html:20`.
- [x] HTML compatible (tablas, estilos en línea, fuentes del sistema, alt del cisne) → verificado en la vuelta 1; render a 375 px confirmado por el líder.
- [x] Guía en `docs/SUPABASE.md` («Correos de CISNE») con la nota de SMTP propio (U3).
- Sin código en `src/`; sin consultas ni datos de usuarias: sin fugas de privacidad.

## Checkpoints
- R1 Alcance: [x] `git status` solo muestra docs, progress, `public/email/cisne.png` y `supabase/templates/`.
- R2 Arquitectura: [x]
- R3 Diseño y accesibilidad: [x]
- R4 Tests: [x] (sin lógica; evidencia estructural + render del líder)
- R5 Build: [x] `./init.sh` termina en `[OK] Entorno listo` (RLS 87 casos).
- R6 Higiene: [x] `public/` solo contiene `email/` y `favicon.svg`; las copias `__prueba-*.html` ya no existen.

## Cambios requeridos
Ninguno. El cambio pedido (borrar las copias de prueba) está hecho y la observación del texto se aplicó: `cambio-email.html:35` dice «Si no pediste este cambio…».

## Observaciones (no bloquean)
- El cisne no se verá en los correos hasta que `/email/cisne.png` esté publicado en producción (esperado tras el merge).
