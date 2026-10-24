# Despliegue

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
| Frontend | Cloudflare Pages | En cada `push` a `main`, Pages hace `npm run build` y publica `dist/`. Cada PR tiene su URL de vista previa | 0 € |
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
2. **U2** — Cloudflare Pages: *Workers & Pages → Create → Pages → Connect to Git* →
   repo `DidacMaymo/cisne`, build `npm run build`, output `dist`, variables
   `NODE_VERSION=20`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.
   En Supabase → *Authentication → URL Configuration*: Site URL y Redirect
   URLs con el dominio de Pages.
3. **U3** — Antes de abrir al público: SMTP propio (Resend/Brevo, gratis) y
   *Confirm email* activado.
