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
- **Estado:** done
- **Depende de:** F07
- **Qué:** botón discreto «Denunciar» en la página de lectura (no en el propio poema del usuario) que guarda en `reports` (la tabla y su política ya existen). Sin panel de moderación: se revisa en Supabase.
- **Probar en la UI:** con sesión, abrir un poema ajeno → «Denunciar» → elegir motivo → confirmación discreta. En un poema propio el botón no aparece. Sin sesión, lleva a entrar.
- **Aceptación:**
  - [x] `ReportRepository` (o método en `poems`) en `repositories.ts` con implementación local y supabase.
  - [x] Diálogo accesible con motivo breve (lista corta + texto opcional) y confirmación. Motivos decididos con el usuario: «Contenido de odio u ofensivo», «Acoso a una persona», «Plagio: no es de quien lo firma», «Otro motivo». Texto opcional de hasta 50 palabras (obligatorio si el motivo es «Otro motivo»).
  - [x] Una usuaria no puede denunciar dos veces el mismo poema (mensaje claro, no error técnico); si hace falta, migración nueva con restricción única + caso en `test:db`.
  - [x] Anon no puede insertar en `reports` (caso en `test:db`, si no existe ya).

### U1 — Conectar Supabase (usuario)
- **Estado:** done
- **Qué:** crear el proyecto en supabase.com, aplicar las migraciones de `supabase/migrations/` (hoy 4), configurar Auth y crear `.env.local`. Guía: `todobackend.md` §1-5.
- **Nota (2026-10-27):** el proyecto `cisne` lo creó Didac con 3 migraciones y producción ya usaba Supabase; Cristina (también dueña) aplicó la 4ª (`20261101120000_denunciar_poema.sql`), comprobó tablas y funciones y creó su `.env.local`.
- **Hecho cuando:** en *Entrar* ya no sale la nota «Versión de prueba…».

### F10 — Prueba de punta a punta con Supabase real
- **Estado:** done
- **Depende de:** U1, F07
- **Qué:** el líder recorre en el navegador la lista de `todobackend.md` §6 con dos cuentas (ventana normal + incógnito). Cada fallo encontrado se convierte en un `fix` aquí o en una feature nueva.
- **Probar en la UI:** `todobackend.md` §6 entero.
- **Aceptación:**
  - [x] `progress/F10-impl.md` (cerrada por decisión de la usuaria: recorrido manual suyo sin detalle por punto; ver Deuda).
  - [x] Ningún fallo de privacidad o anonimato conocido (cubierto por `test:db`; sin verificación independiente en navegador).

### U2 — Publicar en Cloudflare (usuario)
- **Estado:** done
- **Qué:** web publicada como Worker con static assets en **https://cisneverso.es** (antes `cisneverso.dmaymo.es`), desplegada sola en cada merge a `main`. Guía: `docs/deploy.md` § Pasos.
  - [x] Repo conectado a Cloudflare (Workers Builds) y dominio propio.
  - [x] Redirect URL `https://cisneverso.es/**` en Supabase (antes `cisneverso.dmaymo.es`).
  - [x] *Site URL* de Supabase = `https://cisneverso.es`.
  - [x] `cisneverso.dmaymo.es` retirado de Cloudflare (ya no apunta a la web; no hace falta redirección).
  - [x] Plantillas de correo en Supabase con la imagen en `cisneverso.es` (comprobado con un correo real de «recuperar contraseña», 2026-10-28).
  - [x] Variables **de build** `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` en Cloudflare (*Settings → Build → Variables and secrets*).
  - [x] Variables **de runtime** `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` para el Worker de SEO (*Settings → Variables and Secrets*, no las de Build): `sitemap.xml` y metadatos de poema funcionando.
  - [x] Sitemap enviado en Search Console.
- **Hecho cuando:** en `https://cisneverso.es/entrar` ya no sale «Versión de prueba…», se puede registrar una cuenta y publicar.

### F11 — Rendimiento: rutas con carga diferida
- **Estado:** done
- **Depende de:** F07
- **Qué:** el JS inicial pesa ~460 KB (~140 KB gzip). Cargar con `React.lazy` las pantallas que no son de lectura (editor, ajustes, colecciones, auth) para que leer un poema sea lo más rápido.
- **Probar en la UI:** abrir `/poema/:id` en frío: carga sin parpadeos; navegar a `/escribir` muestra un estado de carga coherente con CISNE y luego el editor.
- **Aceptación:**
  - [x] El chunk de entrada baja al menos un 30 % (citar tamaños antes/después de `npm run build`).
  - [x] Estado de carga con `LoadState` (sin saltos de maquetación).
  - [x] Todas las rutas siguen funcionando al recargar.

### F12 — Revisión de accesibilidad y móvil
- **Estado:** done
- **Depende de:** F09, F11
- **Qué:** repaso de los criterios del brief §15-16 y §22 en todas las pantallas: teclado, foco, nombres accesibles, contraste, 375 px, `prefers-reduced-motion`. Lo que se encuentre se arregla aquí si es pequeño o se divide en features.
- **Probar en la UI:** recorrer inicio → poema → escribir → publicar → colección solo con teclado; repetir a 375 px.
- **Aceptación:**
  - [x] Lista de pantallas revisadas en `progress/F12-impl.md` con lo encontrado y arreglado.
  - [x] Sin scroll horizontal a 375 px en ninguna ruta.
  - [x] Todas las acciones alcanzables con teclado y con foco visible.
  - [x] Contraste AA: el usuario decidió oscurecer el token `gris` de `#888888` (3,54:1) a `#767676` (4,54:1) en `src/styles/index.css` y actualizar `docs/conventions.md` / `CLAUDE.md`.
  - [x] Títulos de poema enlazados en listados (Explorar, autor, etiqueta) con objetivo táctil < 44 px (37–43 px): llevarlos a ≥ 44 px.

### U3 — Abrir al público (usuario)
- **Estado:** done
- **Depende de:** U2
- **Qué:** SMTP propio en Supabase (Resend o Brevo, gratis), activar *Confirm email*, revisar `reports` de vez en cuando. Guía: `todobackend.md` §8.
  - [x] SMTP propio configurado (remitente `info@cisneverso.es`).
  - [x] *Sender name* y *Confirm email* (hecho por el usuario, 2026-10-29).
  - Tarea continua: revisar `reports` de vez en cuando.

### F13 — Migraciones automáticas desde GitHub (opcional)
- **Estado:** pending
- **Depende de:** U2
- **Qué:** workflow que, al hacer merge en `main` con cambios en `supabase/migrations/`, ejecuta `supabase db push` contra el proyecto. Necesita los secrets `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF` y `SUPABASE_DB_PASSWORD` (los pone el usuario en GitHub).
- **Aceptación:**
  - [ ] `.github/workflows/migrations.yml` solo corre en `main` y solo si cambian migraciones.
  - [ ] Sin los secrets, el job se salta con un aviso (no falla).
  - [ ] Documentado en `docs/deploy.md`.

### F14 — Correos de CISNE personalizados
- **Estado:** done
- **Depende de:** U1
- **Qué:** los correos de Supabase (confirmar email, recuperar contraseña, cambio de email) llegan en inglés y con la plantilla genérica «powered by Supabase». Pasarlos a español con el tono y la estética de CISNE: blanco y negro, serif, el cisne pequeño y una frase sobria. Las plantillas se versionan en el repo y el usuario las pega en el panel.
- **Probar en la UI:** registrarse con una cuenta nueva → el correo de confirmación llega en español, con el cisne, y el enlace confirma y vuelve a CISNE. Igual con «Recuperar contraseña».
- **Aceptación:**
  - [x] `supabase/templates/` con HTML para *Confirm signup*, *Reset password* y *Change email address*, más el asunto de cada uno, usando las variables de Supabase (`{{ .ConfirmationURL }}`…).
  - [x] HTML de correo compatible (tablas y estilos en línea, sin fuentes web obligatorias, con texto alternativo para el cisne); se ve bien en Gmail y en móvil.
  - [x] Guía corta en `docs/SUPABASE.md`: dónde pegarlas (*Authentication → Emails → Templates*).
  - [x] Nota: el remitente «CISNE <hola@tu-dominio>» y quitar el «powered by Supabase» exigen SMTP propio (U3).

### F16 — Ajustes de textos (portada, pie, biblioteca, colecciones)
- **Estado:** done
- **Depende de:** —
- **Qué:** cuatro cambios de texto pedidos por el usuario, sin tocar nada más.
- **Probar en la UI:** inicio → la frase bajo el título dice «…guarda los versos que te emocionan…»; pie de cualquier página → «CISNE · poesía en español»; Mi biblioteca vacía → «Tu biblioteca está vacía.»; Mis colecciones → «Reúne tus poemas en poemarios, o guarda juntos los de otros.»
- **Aceptación:**
  - [x] `src/pages/Home.tsx`: «que te acompañan» → «que te emocionan» («Lee a poetas que todavía no conoces, guarda los versos que te emocionan y escribe los tuyos con total libertad.»).
  - [x] `src/components/layout/Footer.tsx`: el pie dice «CISNE · poesía en español» (sin «· menos ruido, más poesía.»).
  - [x] `src/pages/Library.tsx`: estado vacío «Tu biblioteca está vacía.» en lugar de «Tu biblioteca espera su primer poema.».
  - [x] `src/pages/MyCollections.tsx`: «Reúne tus poemas en poemarios, o guarda juntos los de otros.» (sin «que te acompañan»).
  - [x] Ningún test ni otro texto depende de las frases antiguas; `./init.sh` en verde.

### F17 — Menú fijo, Biblioteca dentro de Mi página y redes en el pie
- **Estado:** done
- **Depende de:** F15
- **Qué:** la cabecera se queda fija arriba al hacer scroll; «Biblioteca» sale de la navegación (cabecera y barra inferior móvil) y pasa a ser una pestaña de Mi página junto a Colecciones; el pie enlaza a Instagram y TikTok.
- **Probar en la UI:** hacer scroll en Explorar → la cabecera sigue visible arriba, sin tapar contenido al cargar ni al saltar con «Saltar al contenido». Con sesión: el menú ya no tiene «Biblioteca»; Mi página muestra Publicados · Borradores · Colecciones · Biblioteca, y `/mis/biblioteca` lleva a esa pestaña. Pie: enlaces «Instagram» y «TikTok» que abren en otra pestaña. Todo a 375 px y en escritorio.
- **Aceptación:**
  - [x] Cabecera fija (`sticky top-0`, fondo blanco, línea inferior, sin sombra), por encima del contenido; el foco por teclado no queda oculto bajo ella (`scroll-padding-top`).
  - [x] «Biblioteca» desaparece de la cabecera y de la barra inferior móvil; la barra móvil sigue sin scroll horizontal y con objetivos ≥ 44 px.
  - [x] Mi página tiene la pestaña «Biblioteca» (`?ver=biblioteca`) tras «Colecciones», con el mismo contenido y estado vacío que la antigua página; solo la ve su dueño.
  - [x] `/mis/biblioteca` redirige a `?ver=biblioteca` de Mi página (sin sesión, como las otras rutas privadas).
  - [x] Pie con enlaces de texto «Instagram» y «TikTok» (`target="_blank" rel="noopener noreferrer"`, texto para lectores de pantalla «se abre en otra pestaña»). Las URLs viven en un único sitio (p. ej. `src/lib/social.ts`); de momento `https://www.instagram.com/` y `https://www.tiktok.com/` hasta que existan las cuentas (U4).
  - [x] `./init.sh` en verde.

### U4 — Cuentas de CISNE en redes (usuario)
- **Estado:** pending
- **Depende de:** F17
- **Qué:** crear las cuentas de Instagram y TikTok de CISNE y pasar las URLs al líder para cambiarlas en `src/lib/social.ts` (ahora apuntan a las portadas genéricas).

### F18 — Páginas legales: aviso legal, privacidad y cookies
- **Estado:** done
- **Depende de:** U1
- **Qué:** tres páginas legales en español, sobrias y legibles (misma estética que una página de lectura), enlazadas desde el pie: **Aviso legal y condiciones de uso**, **Política de privacidad** y **Política de cookies**. Responsable y contacto: **info@cisneverso.es** (decisión del usuario, 2026-10-28; sin nombre ni NIF por ahora).
- **Contenido mínimo:**
  - *Aviso legal y condiciones* (`/aviso-legal`): titular/contacto (info@cisneverso.es), objeto de la web, condiciones de uso (contenido original y propio, prohibido odio/acoso/plagio, denuncias y retirada de contenido), **propiedad intelectual: los poemas son de sus autores**; CISNE solo recibe permiso para mostrarlos mientras sigan publicados, y el autor puede borrarlos cuando quiera. Pseudónimos y anonimato: reales frente a otros usuarios, no frente al responsable ni a requerimientos legales. Exclusión de responsabilidad por contenido de usuarios. Ley española.
  - *Privacidad* (`/privacidad`): responsable y contacto; qué datos se tratan (email y contraseña de la cuenta, nombre visible, pseudónimos, bio, enlaces, poemas, colecciones, guardados, apoyos, comentarios, denuncias); finalidad (prestar el servicio) y base legal (ejecución del servicio que pide el usuario; interés legítimo para seguridad y denuncias); encargados del tratamiento: **Supabase** (base de datos y cuentas) y **Cloudflare** (alojamiento), con posibles transferencias internacionales cubiertas por cláusulas contractuales tipo / Marco de Privacidad UE-EE. UU.; conservación (mientras la cuenta exista; borrar cuenta lo borra todo, como ya hace *Ajustes → Cuenta*); derechos RGPD (acceso, rectificación, supresión, oposición, portabilidad, limitación) escribiendo a info@cisneverso.es, y reclamación ante la **AEPD**; sin decisiones automatizadas ni venta de datos.
  - *Cookies* (`/cookies`): CISNE no usa cookies de publicidad ni de seguimiento; solo almacenamiento técnico necesario en el navegador (sesión de la cuenta, borradores autoguardados, preferencias) y por eso no hay banner. Si existe analítica, describirla tal cual (comprobar en el código; no inventar).
- **Probar en la UI:** el pie muestra «Aviso legal · Privacidad · Cookies»; cada enlace abre su página, legible a 375 px, con fecha de última actualización y el email como enlace `mailto:`. La página de privacidad enlaza a *Ajustes → Cuenta* para borrar la cuenta.
- **Aceptación:**
  - [ ] Rutas `/aviso-legal`, `/privacidad`, `/cookies` públicas (sin sesión), con `<title>` propio, y enlazadas desde el pie en escritorio y móvil.
  - [ ] Textos en español claro, sin jerga innecesaria, coherentes con lo que hace de verdad el código (no prometer nada que no exista).
  - [ ] Estética de CISNE (serif para títulos, columna de lectura, tokens de la paleta); sin scroll horizontal a 375 px.
  - [ ] Email `info@cisneverso.es` en un solo sitio del código (constante), usado por las tres páginas.
  - [ ] No choca con `/ajustes/privacidad` (preferencias de la cuenta), que sigue igual.

### F20 — SEO técnico (todo lo que se puede hacer en código)
- **Estado:** done
- **Depende de:** F18
- **Qué:** aplicar en código las fases 1-3 de `docs/seo.md`. Dominio canónico **https://cisneverso.es** (decisión del usuario, 2026-10-28; Search Console ya dado de alta como propiedad de dominio). La web sigue siendo la misma SPA; el Worker de Cloudflare solo rellena el `<head>` de algunas rutas y sirve el sitemap.
- **Partes:**
  1. **`index.html`**: metadatos por defecto (descripción, `og:*`, `twitter:card` = `summary_large_image`, `og:locale` `es_ES`, `og:site_name` CISNE, `og:image` absoluta) y un hueco marcado (comentarios `<!--seo-->…<!--/seo-->` o similar) que el Worker pueda sustituir.
  2. **Imagen para compartir** `public/og.png` (1200×630): el cisne (`public/email/cisne.png` o el SVG del emblema) y «CISNE · poesía en español» sobre blanco, tinta `#111111`, sobrio. Si hace falta, un script reproducible en `scripts/` (Python con PIL está disponible en la máquina; no añadir dependencias npm para esto).
  3. **Metadatos por página en la SPA** (para navegación interna y Google): un componente pequeño (p. ej. `Seo`) usando los `<title>`/`<meta>`/`<link>` nativos de React 19. Título y descripción en inicio, explorar, etiqueta, poema (título — autor; descripción = primeros versos), autor (nombre; descripción = bio), colección, legales. `<link rel="canonical">` absoluto con el dominio canónico y **sin query** (`?ver=…`). `noindex` en rutas privadas o sin valor: `/escribir*`, `/mis/*`, `/mi-pagina`, `/ajustes/*`, `/entrar`, `/registro`, `/recuperar`, `/nueva-contrasena`, 404 y poema no encontrado. Sustituye el `useEffect` de título de `LegalPage`.
  4. **`public/robots.txt`**: permite todo salvo las rutas privadas anteriores; `Sitemap: https://cisneverso.es/sitemap.xml`.
  5. **Worker** (`worker/` + `main` en `wrangler.jsonc`, con binding de assets y `run_worker_first` **solo** para `/poema/*`, `/autor/*`, `/coleccion/*`, `/etiqueta/*` y `/sitemap.xml`; el resto lo siguen sirviendo los assets sin pasar por el Worker):
     - Para esas rutas, pide el `index.html` a los assets, consulta la vista pública correspondiente de Supabase por REST (`public_poems`, `public_profiles`, `public_collections`; solo lo que ya es público) y sustituye el hueco del `<head>` por título, descripción, canónica, `og:*`/`twitter:*` y **JSON-LD** (`CreativeWork` con `genre` poesía, `inLanguage` es, fecha y autor —**sin autor si es anónimo o con pseudónimo que no enlaza a perfil**— en poemas; `Person` en autores; `CollectionPage` en colecciones). Si no existe o falla Supabase: devuelve el `index.html` tal cual (nunca romper la página) y, para poema/autor inexistente, `noindex`.
     - `/sitemap.xml`: inicio, explorar, legales, poemas públicos, autores con algo público, colecciones públicas y etiquetas usadas, con `lastmod` cuando exista. Cabecera de caché razonable (p. ej. 1 h).
     - Lógica pura (construir metadatos, escapar HTML/XML/JSON-LD, inyectar en el HTML, construir el sitemap) en módulos sin APIs de Cloudflare, **con tests Vitest** (incluido: el anónimo no saca autor; caracteres `<`, `"`, `&` escapados; poema inexistente → noindex).
     - Configuración: la URL de Supabase y la **clave publicable** como variables de runtime del Worker. Que `wrangler deploy` no borre las del panel (`keep_vars: true`) o declararlas en `wrangler.jsonc` (la publicable es pública por diseño); sin ellas, el Worker solo sirve el HTML por defecto. Documentar en `docs/deploy.md` qué tiene que configurar el usuario.
     - Tipos con `@cloudflare/workers-types` (devDependency, versión compatible con Node 20.10) y el Worker incluido en `tsc -b` para que la CI lo compruebe. `wrangler` local no funciona en la máquina del usuario (pide Node 22): la verificación local son los tests; la prueba real es el primer despliegue.
  6. **Fuentes**: importar solo los subconjuntos `latin` y `latin-ext` de todas las familias de `@fontsource` (hoy salen ~170 ficheros con cirílico, griego y vietnamita) y precargar la Cormorant Garamond regular latina si se puede hacer sin romper el hash de Vite. Citar nº de ficheros de fuente en `dist/` antes y después.
  7. **Dominio**: cambiar `cisneverso.dmaymo.es` por `cisneverso.es` en `supabase/templates/` (imagen del cisne en los correos) y en cualquier otro sitio del código. Constante única para la URL canónica (junto a `src/lib/contact.ts` o similar) compartida con el Worker si es posible.
- **Probar en la UI:** navegar inicio → poema → autor: el título de la pestaña cambia; en `/ajustes/perfil` hay `<meta name="robots" content="noindex">`; `/robots.txt` sirve el fichero. Tras el despliegue (lo comprueba el usuario): `curl https://cisneverso.es/poema/<id>` devuelve en el `<head>` el título del poema y su `og:image`; `https://cisneverso.es/sitemap.xml` lista poemas; pegar un enlace de poema en opengraph.xyz o WhatsApp muestra su título y primeros versos.
- **Aceptación:**
  - [ ] Partes 1-7 hechas.
  - [ ] Tests Vitest de la lógica del Worker, incluido anonimato y escapado.
  - [ ] Nada privado en metadatos ni sitemap: solo datos de vistas `public_*`; anónimos y pseudónimos sin autor ni enlace a perfil.
  - [ ] Canónicas absolutas con `https://cisneverso.es` y sin query.
  - [ ] `./init.sh` en verde (incluye el Worker en los tipos).
  - [ ] `docs/deploy.md` explica las variables del Worker.

### F19 — Textos de la portada más simples
- **Estado:** done
- **Depende de:** F17
- **Qué:** título, descripciones de Leer/Descubrir/Escribir y bloque «Aquí solo hay palabras» más breves y directos (textos decididos con el usuario).
- **Probar en la UI:** inicio a 375 px y en escritorio → el título dice «Un lugar para la poesía.», las tres columnas tienen los textos nuevos, y la lista dice «Sin fotografías · Sin seguidores · Sin rankings» con la frase «Aquí los poemas se descubren al azar, no por popularidad.»
- **Aceptación:**
  - [x] `src/pages/Home.tsx`, título: «Un lugar para la poesía.»
  - [x] Leer: «Lee poesía en un formato limpio y cuidado, pensado para disfrutar cada poema sin distracciones.»
  - [x] Descubrir: «Explora poemas por temas, encuentra nuevos autores y guarda los que te gusten en tu biblioteca o en colecciones.»
  - [x] Escribir: «Escribe y publica tus poemas, elige cómo firmarlos y organiza tu obra en poemarios.»
  - [x] Lista: «Sin fotografías», «Sin seguidores», «Sin rankings» (se quita «Sin contadores», sin sustituto).
  - [x] Descripción bajo la lista: «Aquí los poemas se descubren al azar, no por popularidad.» (sustituye a la frase larga actual).
  - [x] El resto de la portada (subtítulo, botones, separador, bloque final) sin cambios; `./init.sh` en verde.

### F21 — Sobre CISNE y contacto (y analítica en las páginas legales)
- **Estado:** done
- **Depende de:** F18, F20
- **Qué:** dos páginas públicas cortas, `/sobre` y `/contacto`, enlazadas desde el pie junto a las legales. Dan confianza a lectores, buscadores y (algún día) redes de anuncios. Decisiones del usuario (2026-10-29): **dos páginas**; contacto **solo por `mailto:`** a `info@cisneverso.es` (sin formulario ni tabla nueva); «Sobre CISNE» habla **del proyecto, sin nombres** de quién lo hace (coherente con F18). Además, Cloudflare Web Analytics está activado en producción (inyecta `static.cloudflareinsights.com/beacon.min.js`): las páginas legales ya no dicen la verdad y hay que corregirlas.
- **Partes:**
  1. **`/sobre` — «Sobre CISNE»**: qué es CISNE y por qué existe, tomado de `docs/BRIEF.md` (no inventar funciones): un lugar para leer, escribir y publicar poesía en español; *menos ruido, más poesía*; firmar con nombre, pseudónimo o de forma anónima; sin fotos, seguidores ni rankings, descubrimiento al azar; colecciones, biblioteca, apoyos y comentarios en los versos; los poemas son de sus autores (enlace a `/aviso-legal`). Breve: se lee en un minuto. Llamada final discreta a «Leer» (`/explorar`) y «Escribir» (`/escribir`).
  2. **`/contacto` — «Contacto»**: email `info@cisneverso.es` como enlace `mailto:` (constante de `src/lib/contact.ts`) y para qué escribir: dudas y sugerencias, problemas con la cuenta, denunciar un contenido (recordar que en cada poema hay «Denunciar»), derechos de autor / plagio, privacidad (enlace a `/privacidad`), prensa o colaboraciones. Plazo orientativo de respuesta solo si no promete nada que no exista (mejor sin plazo). Si existen las redes (`src/lib/social.ts`), enlazarlas.
  3. **Pie**: añadir «Sobre CISNE» y «Contacto» a los enlaces del pie (escritorio y móvil), sin romper la línea a 375 px.
  4. **SEO**: `<title>`, descripción y canónica con el componente `Seo` de F20; añadir `/sobre` y `/contacto` a `STATIC_PATHS` del sitemap del Worker (y su test).
  5. **Páginas legales — analítica**: `/cookies` y `/privacidad` describen la realidad: se usa **Cloudflare Web Analytics**, sin cookies ni almacenamiento en el navegador, sin huella digital ni seguimiento entre sitios, datos agregados de visitas (páginas, país, navegador, rendimiento); Cloudflare como encargado del tratamiento (ya figura como alojamiento); base legal: interés legítimo en medir el uso de forma anónima; por eso sigue sin hacer falta banner. Actualizar la fecha de última actualización de las páginas cambiadas.
- **Probar en la UI:** el pie muestra «Sobre CISNE» y «Contacto»; `/sobre` se lee bien a 375 px y en escritorio, y sus botones llevan a `/explorar` y `/escribir`; `/contacto` muestra `info@cisneverso.es` como enlace `mailto:`; `/cookies` y `/privacidad` mencionan Cloudflare Web Analytics sin cookies; la pestaña del navegador muestra el título de cada página.
- **Aceptación:**
  - [x] Rutas `/sobre` y `/contacto` públicas (sin sesión), con título, descripción y canónica, enlazadas desde el pie en escritorio y móvil.
  - [x] Textos en español claro y breves, fieles a `docs/BRIEF.md` y al código (nada que no exista); sin nombres de personas.
  - [x] Email solo desde la constante de `src/lib/contact.ts`.
  - [x] Estética de CISNE (serif para títulos, columna de lectura, tokens); sin scroll horizontal a 375 px.
  - [x] Sitemap incluye `/sobre` y `/contacto` (test actualizado).
  - [x] `/cookies` y `/privacidad` describen Cloudflare Web Analytics tal cual, con fecha actualizada.
  - [x] `./init.sh` en verde.
