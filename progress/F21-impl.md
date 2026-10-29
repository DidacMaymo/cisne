# F21 — Sobre CISNE y contacto (y analítica en las páginas legales)

## Plan
- Páginas `src/pages/About.tsx` y `Contact.tsx` (lazy, rutas públicas `/sobre`, `/contacto`), con `Seo`.
- Enlaces en el pie; sitemap del Worker + test.
- Corregir `/cookies` y `/privacidad` con Cloudflare Web Analytics; subir `LEGAL_UPDATED`.

## Archivos tocados
- src/pages/About.tsx, src/pages/Contact.tsx — nuevas (sin nombres de personas; email vía `ContactLink`/`CONTACT_EMAIL`; redes desde `socialLinks`)
- src/App.tsx — rutas lazy `/sobre` y `/contacto`
- src/components/layout/Footer.tsx — «Sobre CISNE» y «Contacto» en el nav (flex-wrap, min-h-11)
- worker/sitemap.ts + worker/worker.test.ts — `STATIC_PATHS` y aserciones
- src/pages/CookiePolicy.tsx, PrivacyPolicy.tsx — sección «Analítica de visitas»; ya no dicen que no hay analítica
- src/lib/contact.ts — `LEGAL_UPDATED` = 29 de octubre de 2026

## Evidencia
- `npx tsc -b` OK · `npm run lint` OK · `npm test` 61/61 OK (sin tocar `supabase/`, no aplica test:db)
- Probar en la UI (lo ejecuta el líder):
  1. Pie (375 px y escritorio): «Sobre CISNE» y «Contacto» sin romper línea ni scroll horizontal.
  2. `/sobre`: texto breve; botones Leer → `/explorar`, Escribir → `/escribir`; enlace a `/aviso-legal`.
  3. `/contacto`: `info@cisneverso.es` como `mailto:`, lista de motivos, enlace a `/privacidad`, redes.
  4. `/cookies` y `/privacidad`: mencionan Cloudflare Web Analytics sin cookies; título de pestaña correcto en cada página.

## Decisiones y dudas
- `LegalPage` no se reutiliza para las dos páginas nuevas (muestra «Última actualización» y descripción genérica); copian su columna de lectura.
- `LEGAL_UPDATED` es común, así que `/aviso-legal` también muestra ahora 29 oct (su texto no cambió).
- Redes en `/contacto` apuntan a las portadas genéricas de `social.ts` (pendiente U4).
- `robots.txt` no bloquea `/sobre` ni `/contacto` (`Disallow: /colecciones` no los afecta).
- Sin plazo de respuesta, para no prometer nada.

## Commit sugerido
feat(info): páginas Sobre CISNE y Contacto, y analítica en las legales

- Rutas /sobre y /contacto, enlazadas en el pie y en el sitemap
- Cookies y privacidad describen Cloudflare Web Analytics sin cookies
