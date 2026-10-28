# AGENTS.md — Mapa del repositorio para agentes

> Punto de entrada para cualquier agente (Claude Code, Codex, Cursor...).
> Es un **mapa**, no una biblia: lee cada doc solo cuando lo necesites.

## Qué es esto

**CISNE**, plataforma minimalista de poesía en español: leer, escribir y
publicar poemas (con nombre, pseudónimo o anónimos), colecciones, biblioteca de
guardados, apoyos y comentarios en los versos. *Menos ruido, más poesía.*
Producto y diseño: `docs/BRIEF.md`.

Un solo repo, dos piezas que se despliegan por separado (detalle en
`docs/deploy.md`):

- **Frontend** (raíz del repo): SPA **Vite 6 + React 19 + TypeScript strict +
  Tailwind v4 + React Router 7**. Compila a `dist/` y se sirve como estático
  (Cloudflare Pages).
- **Backend** (`supabase/`): **Supabase** = Postgres + Auth. No hay servidor
  propio: solo SQL (tablas, vistas, funciones y políticas RLS) en
  `supabase/migrations/`.
- Sin variables de Supabase, la web funciona en **modo local** (todo en
  `localStorage`), útil para desarrollar sin conexión.

## Comandos

| Para... | Comando |
|---|---|
| Health check completo (antes y después de trabajar) | `./init.sh` |
| Health check rápido (dependencias + tipos) | `./init.sh --quick` |
| Servidor de desarrollo | `npm run dev` → http://localhost:5173 |
| Arrancar/parar en segundo plano (smoke tests del líder) | `scripts/app.sh start` / `scripts/app.sh stop` |
| Tipos / lint / build | `npx tsc -b` · `npm run lint` · `npm run build` |
| Tests de seguridad de la BD (Postgres embebido, sin Supabase) | `npm run test:db` |
| Tests unitarios del frontend (desde F08) | `npm test` |
| CI | `.github/workflows/ci.yml` ejecuta `./init.sh` en cada PR y en `main` |

Node de la máquina del usuario: **20.10**. No subas dependencias a versiones
que exijan Node ≥ 20.19 / 22 (por eso Vite 6 y `@supabase/supabase-js` fijado
en `2.109.0`). Si `npm` falla con "engine", es esto.

## Mapa

| Ruta | Qué contiene | Cuándo leerlo |
|---|---|---|
| `feature_list.md` | Backlog con estado y criterios de aceptación; tareas `U*` del usuario | Siempre, al empezar |
| `progress/current.md` | Estado de la sesión en curso y deuda | Siempre, al empezar |
| `progress/<ID>-impl.md` / `-review.md` | Informe del implementer / veredicto del reviewer | Al revisar o cerrar una feature |
| `docs/BRIEF.md` | Brief de producto y diseño (fuente de verdad de producto) | Si la feature toca producto o diseño |
| `docs/architecture.md` | Capas, capa de datos, modelo, seguridad (RLS, anonimato), rutas | Antes de implementar |
| `docs/conventions.md` | Identidad visual, estilo TS/React, SQL, textos | Antes de escribir código |
| `docs/verification.md` | Qué tests escribir y cómo demostrar que funciona | Antes de dar algo por terminado |
| `docs/deploy.md` | Cómo se despliega frontend y backend, costes, alternativa VPS | Si la feature toca despliegue |
| `docs/seo.md` | Ideas de SEO, analítica y anuncios (no es backlog) | Si la feature toca SEO, metadatos o analítica |
| `docs/SUPABASE.md` · `todobackend.md` | Guía paso a paso para conectar Supabase (tareas del usuario) | Si la feature necesita Supabase real |
| `CHECKPOINTS.md` | Checklist objetivo del reviewer | Al revisar |
| `.claude/agents/` | Subagentes `implementer` y `reviewer` | Si orquestas |
| `src/data/` | Capa de datos: tipos, interfaces de repositorio, implementaciones `local/` y `supabase/` | Casi siempre |
| `src/pages/`, `src/components/` | Pantallas y componentes | Para UI |
| `supabase/migrations/` | Esquema SQL versionado | Si cambia el modelo |
| `supabase/tests/rls.test.mjs` | Tests de RLS con dos usuarias (Ana y Bea) | Si cambia el modelo |

## Reglas duras

- **Una feature a la vez.** Como mucho una en `in_progress`.
- **Nada es `done` sin `./init.sh` en verde y review `APPROVED`.**
- **Nada de secretos en el repo.** Solo la clave **pública** de Supabase va al
  frontend, y por variable de entorno (`.env.local`, ignorado). Nunca la
  `secret` / `service_role`.
- **La seguridad vive en la BD (RLS)**, no en ocultar cosas en la UI.
- **Una migración aplicada no se edita nunca**: cada cambio de esquema es un
  fichero nuevo en `supabase/migrations/`.
- **Toda rama sale de `main` recién actualizado.** Una rama y un PR por
  feature. Solo el líder hace commit, push, PR y merge (con review APPROVED y
  CI en verde; nunca `--admin`). Cada merge a `main` publica en producción.
- **Si no sabes algo, busca en `docs/`** antes de inventarlo. Si no está,
  anótalo como duda.

## Formato de `feature_list.md`

Cada feature es un bloque así (`init.sh` cuenta las líneas
`**Estado:** in_progress`):

```markdown
### F03 — Título corto
- **Estado:** pending
- **Depende de:** F02
- **Qué:** una o dos frases.
- **Probar en la UI:** pasos en el navegador que demuestran que funciona.
- **Aceptación:**
  - [ ] criterio verificable
```

## Cierre de sesión

1. `./init.sh` en verde.
2. `feature_list.md` refleja el estado real.
3. `progress/current.md` actualizado (qué se hizo, qué queda, bloqueos).
4. Sin ficheros temporales ni código de debug.
