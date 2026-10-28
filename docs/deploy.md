# Despliegue

## Dónde está

- Web: **https://cisneverso.es** (dominio canónico; Worker `cisne` en la cuenta de Cloudflare del usuario). Cada merge a `main` despliega producción. Las vistas previas por rama están desactivadas (*Builds for non-production branches* apagado).
- Backend: proyecto `cisne` de Supabase.

## Un repo, dos despliegues

No hacen falta dos repos ni dos carpetas: el repo ya es un *monorepo* pequeño.

```
cisne/
├── src/, public/, index.html, package.json   ← frontend  → Cloudflare Pages
└── supabase/migrations/                       ← backend   → Supabase
```

Cada pieza se despliega por su lado y "mira" solo su parte del repo:

| Pieza | Dónde | Cómo llega el código | Coste |
|---|---|---|---|
| Frontend | Cloudflare (Worker con static assets, `wrangler.jsonc`) | En cada `push` a `main`, Cloudflare hace `npm run build` y publica `dist/`. Cada PR tiene su URL de vista previa | 0 € |
| Backend | Supabase (nube) | Las migraciones se aplican al proyecto: a mano (SQL Editor) o con `npx supabase db push` (F13 lo automatiza desde GitHub) | 0 € |

El frontend sabe dónde está el backend por dos variables de entorno
(`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) configuradas en
Cloudflare Pages.

## ¿Por qué Supabase y no el VPS?

**El backend ya está hecho para Supabase** (11 tablas, vistas públicas,
funciones y RLS, con ~70 tests). Pasarlo a otra cosa es rehacerlo.

Plan gratuito de Supabase (octubre 2026):

| | Límite |
|---|---|
| Usuarios activos al mes | 50.000 |
| Base de datos | 500 MB (un poema son pocos KB: cientos de miles caben) |
| Transferencia | ~5 GB/mes |
| Proyectos | 2 activos |
| Si te pasas | No cobra: avisa y limita. No pide tarjeta |
| Pega | Se **pausa tras 7 días sin ninguna petición**; se reactiva desde el panel. Con gente usándola no pasa |

Para una web de poesía entre conocidos, el plan gratis no se queda corto. El
día que se quede, el plan Pro son ~25 $/mes.

## Alternativas con el VPS (OVH)

| Opción | Qué implica | Veredicto |
|---|---|---|
| **A. Supabase nube + Pages** (actual) | Nada que mantener. 0 € | ✅ Recomendada |
| B. Frontend en el VPS, backend en Supabase | Servir `dist/` con nginx/Caddy en el VPS (como un estático más). Mismo código | Posible si quieres todo bajo tu dominio/servidor; Pages es igual de gratis y sin mantenimiento |
| C. Supabase autoalojado en el VPS (Docker) | ~10 contenedores (Postgres, Auth, REST, Kong, Studio…), 2-4 GB de RAM, actualizaciones y copias de seguridad tuyas | ❌ Mucho mantenimiento para ahorrar 0 € |
| D. Reescribir el backend en Spring Boot + Postgres en el VPS | Como albarans. Rehacer auth, API y permisos (semanas) y cambiar la implementación `supabase/` del frontend por una `api/` | Solo si queréis aprender/controlar el backend; la capa de repositorios lo permite sin tocar la UI |

## Pasos (tareas del usuario, ver `feature_list.md`)

1. **U1** — Crear el proyecto Supabase y conectarlo en local: `todobackend.md` §1-5.
2. **U2** — Cloudflare (*Workers & Pages → Create application → Import a
   repository*; Cloudflare ya no separa Pages, se despliega como Worker con
   *static assets* usando `wrangler.jsonc`):
   - Repo `DidacMaymo/cisne`. Build command: `npm run build`. Deploy command:
     `npx wrangler deploy` (el que propone).
   - **Antes del primer despliegue**: *Settings → Build → Variables and
     secrets* → `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`. Tienen
     que ser variables **de build** (se incrustan al compilar); como variables
     de runtime del Worker no sirven. Si ya desplegó sin ellas, añádelas y
     relanza el build.
   - En Supabase → *Authentication → URL Configuration*: Site URL y Redirect
     URLs (`https://cisneverso.es/**`).
3. **U3** — Antes de abrir al público: SMTP propio (Resend/Brevo, gratis) y
   *Confirm email* activado.

## Worker de SEO (`worker/`)

Un Worker pequeño (`worker/index.ts`, declarado como `main` en `wrangler.jsonc`) intercepta **solo** `/poema/*`, `/autor/*`, `/coleccion/*`, `/etiqueta/*` y `/sitemap.xml`; el resto lo sirven los assets sin pasar por él. Para las cuatro primeras pide el `index.html`, consulta la vista pública de Supabase (`public_poems`, `public_profiles`, `public_collections`, `public_tags`) y rellena el `<head>` (título, descripción, canónica, `og:*`, JSON-LD). `/sitemap.xml` lo genera con las mismas vistas. Si algo falla, devuelve el `index.html` normal (el sitemap, un 503).

**Variables de runtime del Worker** (tarea del usuario, una sola vez): Cloudflare → *Workers & Pages → cisne → Settings → Variables and Secrets* (las de **runtime**, no las de *Build*):

| Variable | Valor |
|---|---|
| `SUPABASE_URL` | la misma URL del proyecto que `VITE_SUPABASE_URL` |
| `SUPABASE_PUBLISHABLE_KEY` | la clave **publicable** (`sb_publishable_…`), la misma que `VITE_SUPABASE_PUBLISHABLE_KEY`. Nunca la `secret` |

`wrangler.jsonc` lleva `keep_vars: true`: `wrangler deploy` no borra las variables puestas en el panel. Sin ellas el Worker no rompe nada: sirve el HTML por defecto y el sitemap responde 503.

**Dominio**: el canónico es `https://cisneverso.es` (constante `SITE_URL` en `src/lib/seo.ts`). El antiguo `cisneverso.dmaymo.es` está retirado. Tras el primer despliegue, enviar `https://cisneverso.es/sitemap.xml` en Search Console.

Local: `wrangler` no funciona con Node 20.10; la lógica del Worker se prueba con `npm test` (`worker/worker.test.ts`) y se comprueba en el primer despliegue: `curl https://cisneverso.es/poema/<id>`.
