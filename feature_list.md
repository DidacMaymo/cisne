# Feature list

> Backlog en orden. Estados: `pending` · `in_progress` · `done` · `blocked`.
> Regla: como mucho una `in_progress`. Solo el líder cambia estados; `done`
> exige `progress/<ID>-review.md` con APPROVED (desde F07; las anteriores son
> históricas, hechas antes del arnés).
>
> Las tareas **U*** son del usuario (cuentas, claves, paneles): ningún agente
> las hace. El líder las recuerda cuando bloquean algo.
>
> **Si no está aquí, no se hace.** Nada de extras "de paso".

## Hecho (antes del arnés)

### F00 — Base del proyecto e identidad
- **Estado:** done
- **Qué:** Vite + React + TS + Tailwind + Router, tokens, tipografías, `SwanMark`, layout, `_redirects`. Commit `f029771`.

### F01 — Lectura con datos locales
- **Estado:** done
- **Qué:** capa `src/data/` con repositorio local y `dev-seed`, inicio Recientes/Descubrir, lectura tipo libro, relacionados, compartir. Commit `532cb86`.

### F02 — Escritura
- **Estado:** done
- **Qué:** editor, borradores, vista previa, publicar, identidad (nombre/pseudónimo/anónimo), editar y borrar. Commit `d718d59`.

### F03 — Colecciones, explorar, biblioteca, perfil y cuenta
- **Estado:** done
- **Qué:** colecciones con portada tipográfica y orden, buscador, biblioteca, página de autor, ajustes, cuenta para publicar. Commit `37e9582`.

### F04 — Backend Supabase
- **Estado:** done
- **Qué:** migración inicial (tablas, vistas `public_*`, RLS, funciones), implementación `supabase/` de los repositorios, auth, `test:db`. Commit `ba06350`.

### F05 — Formato, tipografías, Cisne negro, apoyos y compartir
- **Estado:** done
- **Qué:** negrita/cursiva en poemas, 4 fuentes de poema, poemas sensibles («Cisne negro»), apoyos a poemas y autores. Commit `f091307`.

### F06 — Comentarios en los versos
- **Estado:** done
- **Qué:** comentar un fragmento de verso (≤ 50 palabras), abrir/cerrar comentarios, dejar de apoyar, separador con cisne. Commits `2f74350`…`ffc670d`.

## Pendiente

### F07 — Arnés de agentes y CI
- **Estado:** done
- **Depende de:** —
- **Qué:** `AGENTS.md`, `CLAUDE.md` (líder), `CHECKPOINTS.md`, `docs/`, subagentes `implementer`/`reviewer`, `init.sh`, `scripts/app.sh` y CI en GitHub Actions. Lo hace el líder (solo docs/config).
- **Aceptación:**
  - [x] `./init.sh` y `./init.sh --quick` terminan en `[OK] Entorno listo`.
  - [x] `.github/workflows/ci.yml` ejecuta `./init.sh` en cada PR.
  - [x] `scripts/app.sh start|stop` levanta y para Vite en :5173.

### F08 — Tests unitarios del frontend
- **Estado:** done
- **Depende de:** F07
- **Qué:** añadir Vitest (versión compatible con Node 20.10) y cubrir la lógica pura que más se rompe sin que se note.
- **Probar en la UI:** nada visible; `npm test` en verde.
- **Aceptación:**
  - [x] Script `npm test` (Vitest, sin modo watch) y `init.sh` lo ejecuta.
  - [x] Tests de `src/data/normalize.ts` (etiquetas: mayúsculas, espacios, `#`, tildes).
  - [x] Tests de `src/lib/poem-markup.ts` y `src/lib/poem-text.ts` (saltos de línea y estrofas se conservan; negrita/cursiva).
  - [x] Tests de `src/data/discover.ts` (misma semilla → mismo orden; no dos seguidos de la misma voz).
  - [x] Tests del repositorio local: un poema privado o borrador no sale en `listPublic`/`search`; uno anónimo no expone autor.

### F15 — «Mi página»: poemas, borradores y colecciones en una sola página
- **Estado:** done
- **Depende de:** F08
- **Prioridad:** la siguiente (pedida por el usuario el 2026-10-25).
- **Qué:** hoy «Mis poemas», «Mis borradores» y «Mis colecciones» son tres páginas sueltas y casi escondidas en el pie; el propio usuario no encontró «Mis poemas». Se unen en **una sola página de autor** que, vista por su dueño, muestra todo lo suyo en tres pestañas. Y se ordena la navegación: en móvil, barra inferior; en escritorio, todo arriba y sin menús duplicados abajo.
- **Decisiones:**
  - La página es la misma `/autor/:accountName`. Si la mira **otra persona** (o sin sesión), se ve exactamente como ahora: solo lo publicado y público, firmado con su nombre. Si la mira **su dueño**, debajo de la cabecera (nombre, bio, enlaces) aparecen tres pestañas: **Publicados · Borradores · Colecciones**.
    - *Publicados*: todos sus poemas publicados, también los privados, anónimos y con pseudónimo, cada uno con una marca discreta («Privado», «Anónimo», «Como …») que solo ve él.
    - *Borradores*: sus borradores, para seguir escribiendo.
    - *Colecciones*: todas, públicas y privadas, con «Nueva colección» (lo que hoy hace `/mis/colecciones`).
    - La pestaña va en la URL (`?ver=publicados|borradores|colecciones`; por defecto `publicados`) para que se pueda enlazar y volver atrás.
    - Un enlace discreto «Ver como lo ven los demás» (muestra la vista pública) y otro a «Ajustes».
  - Ruta corta `/mi-pagina`: con sesión redirige a `/autor/<mi accountName>`; sin sesión, a entrar.
  - Las rutas viejas siguen funcionando y redirigen a su pestaña: `/mis/poemas` → `?ver=publicados`, `/mis/borradores` → `?ver=borradores`, `/mis/colecciones` y `/colecciones` → `?ver=colecciones`.
  - **«Biblioteca»** (poemas de otros que guardo) se queda como página aparte: no es mía, es de lectura.
  - **Navegación**:
    - Escritorio (≥ md): cabecera con logo · Inicio · Explorar · Biblioteca · **Mi página** · botón «Escribir un poema» · cuenta (sin sesión «Entrar»). Sin barra inferior y **sin la lista de enlaces del pie**: el pie queda solo con la frase de CISNE.
    - Móvil: cabecera mínima (logo, y «Entrar» si no hay sesión). Barra inferior fija: Inicio · Explorar · Escribir · Biblioteca · **Mi página**. El pie, igual que en escritorio, sin enlaces duplicados.
    - Desaparece «Colecciones» como entrada del menú.
  - **Privacidad**: lo privado del dueño se carga solo con `listMine`/`collections.listMine` (protegido por RLS). La vista pública no cambia sus consultas. Nada de lo privado o anónimo puede aparecer al mirar la página de otra persona.
- **Probar en la UI:**
  1. Con sesión, en escritorio: la cabecera muestra Inicio · Explorar · Biblioteca · Mi página; el pie no repite enlaces; no hay barra inferior.
  2. «Mi página» → mi página de autor con las pestañas Publicados · Borradores · Colecciones. Un poema anónimo y uno privado salen en Publicados con su marca.
  3. Cambiar de pestaña cambia la URL; atrás vuelve a la pestaña anterior. `/mis/borradores` abre la pestaña Borradores.
  4. «Ver como lo ven los demás» (o abrir mi página en incógnito): sin pestañas, sin el anónimo ni el privado.
  5. A 375 px: barra inferior con 5 entradas, sin scroll horizontal, objetivos ≥ 44 px; las pestañas caben o se desplazan sin cortarse.
  6. Sin sesión: «Mi página» lleva a entrar y, tras entrar, vuelve a mi página.
- **Aceptación:**
  - [x] Pestañas solo para el dueño, con estado en `?ver=` y accesibles (`role="tablist"`/`tab`/`tabpanel` o enlaces con `aria-current`), navegables con teclado.
  - [x] Publicados del dueño incluye privados, anónimos y con pseudónimo, marcados; la vista pública es idéntica a la actual (mismas consultas).
  - [x] Borradores y Colecciones reutilizan lo que hoy hacen `MyPoems` y `MyCollections` (sin duplicar lógica); esas páginas sueltas desaparecen o quedan solo como componentes.
  - [x] `/mi-pagina` y las rutas viejas redirigen a la pestaña correcta.
  - [x] Cabecera, barra inferior y pie según lo descrito; ninguna entrada de menú duplicada en escritorio.
  - [x] Test unitario o del repo local que demuestre que el anónimo y el privado del dueño no salen en `listPublic({ authorAccountName })`.
  - [x] Pasos de «Probar en la UI» documentados en `progress/F15-impl.md`, incluido 375 px.

### F09 — Denunciar un poema
- **Estado:** pending
- **Depende de:** F07
- **Qué:** botón discreto «Denunciar» en la página de lectura (no en el propio poema del usuario) que guarda en `reports` (la tabla y su política ya existen). Sin panel de moderación: se revisa en Supabase.
- **Probar en la UI:** con sesión, abrir un poema ajeno → «Denunciar» → elegir motivo → confirmación discreta. En un poema propio el botón no aparece. Sin sesión, lleva a entrar.
- **Aceptación:**
  - [ ] `ReportRepository` (o método en `poems`) en `repositories.ts` con implementación local y supabase.
  - [ ] Diálogo accesible con motivo breve (lista corta + texto opcional) y confirmación.
  - [ ] Una usuaria no puede denunciar dos veces el mismo poema (mensaje claro, no error técnico); si hace falta, migración nueva con restricción única + caso en `test:db`.
  - [ ] Anon no puede insertar en `reports` (caso en `test:db`, si no existe ya).

### U1 — Conectar Supabase (usuario)
- **Estado:** done
- **Qué:** crear el proyecto en supabase.com, aplicar las 3 migraciones, configurar Auth y crear `.env.local`. Guía: `todobackend.md` §1-5.
- **Hecho cuando:** en *Entrar* ya no sale la nota «Versión de prueba…».

### F10 — Prueba de punta a punta con Supabase real
- **Estado:** pending
- **Depende de:** U1, F07
- **Qué:** el líder recorre en el navegador la lista de `todobackend.md` §6 con dos cuentas (ventana normal + incógnito). Cada fallo encontrado se convierte en un `fix` aquí o en una feature nueva.
- **Probar en la UI:** `todobackend.md` §6 entero.
- **Aceptación:**
  - [ ] `progress/F10-impl.md` con cada punto de §6 marcado OK o con el fallo y su feature/fix asociado.
  - [ ] Ningún fallo de privacidad o anonimato abierto.

### U2 — Publicar en Cloudflare (usuario)
- **Estado:** done
- **Qué:** web publicada como Worker con static assets en **https://cisneverso.dmaymo.es**, desplegada sola en cada merge a `main`. Guía: `docs/deploy.md` § Pasos.
  - [x] Repo conectado a Cloudflare (Workers Builds) y dominio propio.
  - [x] Redirect URL `https://cisneverso.dmaymo.es/**` en Supabase.
  - [x] *Site URL* de Supabase = `https://cisneverso.dmaymo.es`.
  - [x] Variables **de build** `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` en Cloudflare (*Settings → Build → Variables and secrets*).
- **Hecho cuando:** en `https://cisneverso.dmaymo.es/entrar` ya no sale «Versión de prueba…», se puede registrar una cuenta y publicar.

### F11 — Rendimiento: rutas con carga diferida
- **Estado:** pending
- **Depende de:** F07
- **Qué:** el JS inicial pesa ~460 KB (~140 KB gzip). Cargar con `React.lazy` las pantallas que no son de lectura (editor, ajustes, colecciones, auth) para que leer un poema sea lo más rápido.
- **Probar en la UI:** abrir `/poema/:id` en frío: carga sin parpadeos; navegar a `/escribir` muestra un estado de carga coherente con CISNE y luego el editor.
- **Aceptación:**
  - [ ] El chunk de entrada baja al menos un 30 % (citar tamaños antes/después de `npm run build`).
  - [ ] Estado de carga con `LoadState` (sin saltos de maquetación).
  - [ ] Todas las rutas siguen funcionando al recargar.

### F12 — Revisión de accesibilidad y móvil
- **Estado:** pending
- **Depende de:** F09, F11
- **Qué:** repaso de los criterios del brief §15-16 y §22 en todas las pantallas: teclado, foco, nombres accesibles, contraste, 375 px, `prefers-reduced-motion`. Lo que se encuentre se arregla aquí si es pequeño o se divide en features.
- **Probar en la UI:** recorrer inicio → poema → escribir → publicar → colección solo con teclado; repetir a 375 px.
- **Aceptación:**
  - [ ] Lista de pantallas revisadas en `progress/F12-impl.md` con lo encontrado y arreglado.
  - [ ] Sin scroll horizontal a 375 px en ninguna ruta.
  - [ ] Todas las acciones alcanzables con teclado y con foco visible.

### U3 — Abrir al público (usuario)
- **Estado:** pending
- **Depende de:** U2
- **Qué:** SMTP propio en Supabase (Resend o Brevo, gratis), activar *Confirm email*, revisar `reports` de vez en cuando. Guía: `todobackend.md` §8.

### F13 — Migraciones automáticas desde GitHub (opcional)
- **Estado:** pending
- **Depende de:** U2
- **Qué:** workflow que, al hacer merge en `main` con cambios en `supabase/migrations/`, ejecuta `supabase db push` contra el proyecto. Necesita los secrets `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF` y `SUPABASE_DB_PASSWORD` (los pone el usuario en GitHub).
- **Aceptación:**
  - [ ] `.github/workflows/migrations.yml` solo corre en `main` y solo si cambian migraciones.
  - [ ] Sin los secrets, el job se salta con un aviso (no falla).
  - [ ] Documentado en `docs/deploy.md`.

### F14 — Correos de CISNE personalizados
- **Estado:** pending
- **Depende de:** U1
- **Qué:** los correos de Supabase (confirmar email, recuperar contraseña, cambio de email) llegan en inglés y con la plantilla genérica «powered by Supabase». Pasarlos a español con el tono y la estética de CISNE: blanco y negro, serif, el cisne pequeño y una frase sobria. Las plantillas se versionan en el repo y el usuario las pega en el panel.
- **Probar en la UI:** registrarse con una cuenta nueva → el correo de confirmación llega en español, con el cisne, y el enlace confirma y vuelve a CISNE. Igual con «Recuperar contraseña».
- **Aceptación:**
  - [ ] `supabase/templates/` con HTML para *Confirm signup*, *Reset password* y *Change email address*, más el asunto de cada uno, usando las variables de Supabase (`{{ .ConfirmationURL }}`…).
  - [ ] HTML de correo compatible (tablas y estilos en línea, sin fuentes web obligatorias, con texto alternativo para el cisne); se ve bien en Gmail y en móvil.
  - [ ] Guía corta en `docs/SUPABASE.md`: dónde pegarlas (*Authentication → Emails → Templates*).
  - [ ] Nota: el remitente «CISNE <hola@tu-dominio>» y quitar el «powered by Supabase» exigen SMTP propio (U3).
