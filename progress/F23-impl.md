# F23 — CISNE en el móvil: instalar como app y apoyar el proyecto

## Plan
- Iconos PNG desde `brand/cisne-emblema.png` (Python + Pillow, fuera del repo).
- `public/manifest.webmanifest` + `<link>` en `index.html`.
- Secciones «¿Y en el móvil?» y «Apoyar el proyecto» en `About.tsx`; `kofiUrl = null` en `social.ts`.
- Test del Worker: manifiesto e iconos no pasan por la lógica del Worker.

## Archivos tocados
- public/manifest.webmanifest — nombre, short_name, lang es, standalone, #FFFFFF, iconos 192/512 any + 512 maskable
- public/icons/icon-192.png, icon-512.png, icon-maskable-512.png; public/apple-touch-icon.png (180×180)
- index.html — `rel="manifest"` y `rel="apple-touch-icon"`
- src/lib/social.ts — `kofiUrl: string | null = null`
- src/pages/About.tsx — dos `section` con `h2`, `h3` por plataforma y `ol` para los pasos; el párrafo de Ko-fi solo si hay URL
- worker/worker.test.ts — caso nuevo: `matchRoute` devuelve null para manifiesto e iconos

## Evidencia
- `npx tsc -b` OK · `npm run lint` OK · `npm test` 62 pasan (1 nuevo en worker)
- Iconos: RGB opaco, esquina (0,0) blanca, tinta casi negra. Cisne recortado al bbox del alfa: 78 % del lienzo en `any`/apple, 60 % en `maskable`.
- Probar en la UI (líder):
  1. `/sobre` a 375 px y escritorio: sección «¿Y en el móvil?» con dos listas ordenadas, y «Apoyar el proyecto» sin enlace de donación.
  2. `/manifest.webmanifest` devuelve el JSON; `/icons/icon-512.png` y `/apple-touch-icon.png` cargan.
  3. Tras desplegar, comprobar `Content-Type: application/manifest+json` en cisneverso.es.

## Decisiones y dudas
- `wrangler.jsonc` no necesita cambios: `run_worker_first` solo lista rutas de poema/autor/colección/etiqueta/sitemap, así que manifiesto e iconos los sirven los assets directamente. El `Content-Type` real depende de Cloudflare y no se puede probar en local; el test solo cubre que el Worker no los toca.
- Sin `start_url` con parámetros ni service worker (no hay modo sin conexión, como pedía la feature).
- Texto de «Apoyar»: compartir y publicar; con URL aparece «Si quieres invitarnos a un café, puedes hacerlo en Ko-fi».

## Commit sugerido
feat(movil): manifiesto, iconos y guía para añadir CISNE al móvil

- Manifiesto web e iconos del cisne (any, maskable, apple-touch)
- Sobre CISNE: «¿Y en el móvil?» y «Apoyar el proyecto»
- URL de Ko-fi en un solo sitio (null hasta U5)
