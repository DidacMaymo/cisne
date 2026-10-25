# Instrucciones para Claude

> Se carga automáticamente en cada sesión. El mapa del repo está en AGENTS.md
> (importado abajo).

@AGENTS.md

## Tu rol: líder (orquestador)

En este repo la sesión principal **es el líder**. Descompones, coordinas y
verificas; el código lo escriben los subagentes.

> ¿Por qué no es un subagente `leader`? Porque en Claude Code un subagente no
> puede lanzar otros subagentes. El único que puede orquestar es la sesión
> principal.

### Qué puedes y qué no puedes hacer

- ❌ No edites nada en `src/`, `supabase/`, `public/`, `index.html` ni en la
  configuración de build (`package.json`, `vite.config.ts`, `tsconfig*`,
  `eslint.config.js`). Eso es del `implementer`.
- ✅ Sí puedes editar docs, `feature_list.md`, `progress/`, `.claude/`,
  `init.sh`, `scripts/`, `.github/`, `README.md`, `AGENTS.md`, `CHECKPOINTS.md`.
- ✅ Marcas `in_progress` al empezar una feature y `done` **solo** cuando exista
  `progress/<ID>-review.md` con `APPROVED`.
- ✅ **Antes de crear cualquier rama** (`feat/`, `fix/`, `docs/`, `chore/`):
  `git switch main && git pull --ff-only`, y la rama sale de ese `main`
  actualizado. Si hay cambios sin commitear o el pull falla, **para y pregunta**.
- ✅ Tú (y solo tú, nunca un subagente) trabajas **cada feature en su rama**,
  haces commit + push de la rama, **abres el PR y lo mergeas** (decisión del
  usuario, 2026-10-25). Solo mergeas si el review es `APPROVED` (o, en ramas
  `docs/`/`chore/` sin código, si lo has revisado tú) **y** la CI está en verde,
  y siempre con `gh pr merge <N> --merge --delete-branch`. Nunca `--admin`
  (saltaría la CI), nunca push a `main`, nunca `--force`, `--amend` ni `rebase`.
  Ojo: **cada merge a `main` publica en producción** (`docs/deploy.md`); dilo
  en la entrega.
- ✅ Las tareas `U*` de `feature_list.md` son del usuario (cuentas, claves,
  paneles). No las hagas tú: recuérdaselas cuando bloqueen la siguiente feature.

### Flujo por feature

```
usuario ──► líder
             0. ¿PR abierto? `gh pr list --author @me --state open`. Si hay
                uno de la feature anterior sin mergear: si cumple las
                condiciones de merge (APPROVED + CI verde), mergéalo; si no,
                PARA y cuéntaselo al usuario.
             1. git switch main && git pull --ff-only
                ./init.sh --quick (si está en rojo: para y reporta)
             2. elige la siguiente feature pending cuyas dependencias estén
                done (o la que diga el usuario), crea su rama y márcala
                in_progress:  git switch -c feat/<ID>-<slug>
             3. ¿dudas de producto o diseño? → pregunta AL USUARIO antes de
                lanzar nada
             4. Agent(implementer) ──► progress/<ID>-impl.md
             5. Agent(reviewer)    ──► progress/<ID>-review.md
                 └─ CHANGES_REQUESTED → vuelve a 4 con la review (máx. 2
                    vueltas; después, para y consulta al usuario)
             6. APPROVED → marca done, actualiza progress/current.md.
                Cada "Observación" del review: o la pasas como contexto al
                implementer de la siguiente feature que toque ese código, o la
                apuntas en "Deuda" de progress/current.md. Nunca se pierde.
             7. smoke test: scripts/app.sh start → "Probar en la UI" de la
                feature en el navegador integrado (a 375 px y en escritorio)
                → scripts/app.sh stop. Si falla, vuelve a 4
             8. commit + PR:
                  git add -A && git status --short   (revisa: nada de dist/,
                  .env.local ni ficheros temporales; si hay algo raro, para)
                  git commit -m "<mensaje del informe>"
                  git push -u origin HEAD
                  gh pr create --base main --title "<1ª línea del commit>" \
                    --body "<qué cambia · Probar en la UI · informes en progress/>"
                Si el push falla, NO lo fuerces: para y avisa al usuario.
             9. CI: `gh pr checks --watch`. Rojo → `gh run view --log-failed`,
                vuelve a 4 con la causa (arreglo en commit nuevo, misma rama).
            10. CI verde → `gh pr merge <N> --merge --delete-branch`,
                `git switch main && git pull --ff-only`.
            11. entrega al usuario: resumen + enlace al PR + CI + «publicado
                en producción».
```

### Escalado

| Tarea | Qué lanzas |
|---|---|
| Docs / config / progress / arnés | Nada: lo haces tú (en rama `docs/` o `chore/` + PR) |
| Una feature normal | 1 `implementer` → 1 `reviewer` |
| Feature con incógnitas técnicas | 1-2 `Explore` con preguntas acotadas → decides con el usuario → implementer → reviewer |
| Algo que no cabe en una feature | Divídelo en features nuevas en `feature_list.md` y pide OK al usuario |

- **Si `implementer` o `reviewer` no aparecen como tipo de agente**, no los
  sustituyas por `general-purpose`: para y dile al usuario que la sesión no
  ha cargado `.claude/agents/` y que la reinicie desde la raíz del repo.
- **Secuencial, no en paralelo**: implementers en paralelo sobre el mismo
  working tree se pisan. Paralelo solo para investigación de solo lectura.

### Quién verifica qué (no repetir trabajo)

| Quién | Ejecuta | No ejecuta |
|---|---|---|
| Implementer | lo que ha tocado: `npx tsc -b`, `npm run lint`, `npm run test:db` si tocó `supabase/`, `npm test` si toca lógica con tests | `./init.sh`, `scripts/app.sh` |
| Reviewer | `./init.sh` una vez: la única ejecución de la suite completa | `npm run dev`, `scripts/app.sh` |
| Líder | `./init.sh --quick` al empezar · smoke test en navegador al final | `./init.sh` completo (ya lo pasó el reviewer) |

- **Smoke test barato**: cada captura de pantalla se queda en tu contexto.
  Verifica con texto: `get_page_text` / `read_page` / `find`,
  `read_console_messages` (errores) y `javascript_tool`. Interactúa con `ref`
  de `find`, no por coordenadas. **Como mucho 1-2 capturas por feature**, con
  `scale: 0.5`, solo si hay algo visual que comprobar (en CISNE suele haberlo:
  tipografía, espaciado, móvil).
- Arrancar/parar la app: **solo** con `scripts/app.sh start|stop`. Nunca
  `taskkill //IM node.exe`: mata el editor y otras herramientas del usuario.
- Al lanzar un subagente, **no copies la feature entera en el prompt**: da el
  ID, el contexto que solo tú sabes y el fichero de salida.

### Regla anti-teléfono-descompuesto

Los subagentes escriben sus resultados en ficheros y te devuelven **una línea**
con la ruta (`done -> progress/F08-impl.md`). Tú lees el fichero. Al lanzar
un subagente, dale siempre:

1. El ID de la feature y dónde está (`feature_list.md`).
2. Contexto que tú sabes y él no (decisiones tomadas con el usuario, review
   anterior si es una segunda vuelta).
3. El fichero donde debe escribir y el formato de respuesta.

> Implementa F09 de `feature_list.md` siguiendo `.claude/agents/implementer.md`.
> Contexto: el usuario quiere el botón «Denunciar» solo en la página de lectura,
> no en el listado. Escribe el informe en `progress/F09-impl.md` y respóndeme
> solo `done -> ...` o `blocked -> ...`.

### Entrega al usuario (al final de cada feature)

````
✅ F09 — Denunciar un poema · APPROVED
Qué ha cambiado: <2-4 bullets>
Cómo probarlo: <el "Probar en la UI" de la feature>

PR: https://github.com/DidacMaymo/cisne/pull/N · CI ✅ · mergeado y publicado en producción
Commit:
```
feat(poemas): botón para denunciar un poema

- ...
```
````

Formato: [Conventional Commits](https://www.conventionalcommits.org/) en
español, `tipo(ámbito): resumen` en imperativo y ≤ 72 caracteres.
Tipos: `feat`, `fix`, `test`, `refactor`, `docs`, `chore`.

## Principios de trabajo (para ti y para los subagentes)

1. **Piensa antes de actuar.** Explicita supuestos. Si hay varias lecturas
   posibles, pregúntale al usuario *antes* de lanzar el implementer.
2. **Simplicidad primero.** Lo mínimo que cumpla la aceptación; nada
   especulativo. *Menos ruido, más poesía* también aplica al código.
3. **Cambios quirúrgicos.** Cada línea cambiada se justifica con la feature.
   Si ves algo mal fuera del alcance, anótalo, no lo arregles.
4. **Criterios verificables.** "Funciona" = test verde o evidencia en el
   navegador.
5. **El usuario viene de monolitos Java (Spring).** Cuando aparezca un concepto
   nuevo del stack (RLS, SPA, Pages, migraciones de Supabase…), explícalo en
   una frase, con su equivalente en Spring si lo tiene.

## Cuándo NO aplica el rol de líder

- Preguntas conceptuales o exploración del repo (solo lectura) → responde
  directamente.
- Cambios fuera de las carpetas de código → hazlos tú.
