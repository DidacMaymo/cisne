# Review — F21

**Veredicto:** APPROVED

## Aceptación
- [x] Rutas públicas con título/descripción/canónica, enlazadas en el pie → App.tsx (rutas sin guardia), About.tsx:10-14 y Contact.tsx:9-13 (`Seo`), Footer.tsx:5-6. Pie sin `RequireAuth`; el nav ya es flex-wrap (pasos 375 px en el informe, los ejecuta el líder).
- [x] Textos fieles y sin nombres → cada afirmación de About verificada: «sin fotografías/seguidores/rankings» (Home.tsx:31, ProfileSettings.tsx:24,77), descubrimiento al azar (`order: 'random'`, repositories.ts:45), colecciones/biblioteca/apoyos/comentarios y anonimato (BRIEF). Contact: botón «Denunciar» existe (ReportButton.tsx). Sin plazos ni promesas. Sin nombres de personas.
- [x] Email solo vía constante → `ContactLink`/`CONTACT_EMAIL`; no hay literal en las páginas nuevas.
- [x] Estética → serif en títulos, `max-w-pagina`, tokens existentes, `break-words`, `min-h-11`; sin colores ni sombras nuevos.
- [x] Sitemap → worker/sitemap.ts STATIC_PATHS + aserciones en worker.test.ts:158-159.
- [x] `/cookies` y `/privacidad` → secciones «Analítica de visitas» (CookiePolicy.tsx:14-20, PrivacyPolicy.tsx:30-41) con Cloudflare Web Analytics sin cookies, base legal interés legítimo, Cloudflare como proveedor (PrivacyPolicy.tsx:47); `LEGAL_UPDATED` = 29 oct. Ya no queda ninguna frase «sin analítica» en `src/`.
- [x] `./init.sh` → `[OK] Entorno listo` (RLS 87 casos, tests unitarios OK).

## Checkpoints
- R1 Alcance: [x]
- R2 Arquitectura: [x] (sin datos nuevos; sin supabase/localStorage en UI)
- R3 Diseño y accesibilidad: [x] (enlaces externos con aviso sr-only, objetivos ≥ 44 px)
- R4 Tests: [x] (sitemap con test; UI con pasos manuales)
- R5 Build: [x]
- R6 Higiene: [x] (commit sugerido presente)

## Textos de F18 conservados
Siguen siendo ciertos y se mantienen: sin cookies de publicidad/seguimiento, sin banner, lista de lo guardado en el navegador (sesión, borrador, preferencias), contacto por email.

## Observaciones (no bloquean)
- `LEGAL_UPDATED` es común: `/aviso-legal` muestra ahora 29 oct aunque su texto no cambió (ya anotado por el implementer; aceptable).
- Redes en `/contacto` apuntan a portadas genéricas hasta U4; conviene no publicar mientras sigan así, o confirmar que se acepta.
- Cookies afirma que Cloudflare Web Analytics «no crea huella digital»: es lo que declara Cloudflare; si cambia el modo (p. ej. con cookies), revisar estos textos.
