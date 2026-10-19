# Pendiente: conectar CISNE a Supabase

El código del backend ya está hecho y en el repo (commit `ba06350`). Lo que falta lo tienes que hacer tú en el panel de Supabase y en tu ordenador; luego lo probamos juntos.
Más detalle de cada paso en [docs/SUPABASE.md](docs/SUPABASE.md).

Mientras no hagas esto, la web funciona en **modo local** (todo se guarda en tu navegador).

---

## 1. Crear el proyecto en Supabase

- [ ] Entra en https://supabase.com y crea una cuenta (plan gratuito).
- [ ] Pulsa **New project**.
  - Nombre: `cisne`.
  - Región: una de Europa (por ejemplo *West EU*).
  - Contraseña de la base de datos: genera una y **guárdala en tu gestor de contraseñas**. La web no la necesita, pero tú sí para administrar.
- [ ] Espera un par de minutos a que el proyecto termine de crearse.

## 2. Crear las tablas

- [ ] En el menú de la izquierda: **SQL Editor → New query**.
- [ ] Hay **dos** archivos en `supabase/migrations/` y van **en este orden**, cada uno en una consulta nueva:
  1. `20261018120000_init.sql` (tablas y seguridad)
  2. `20261019120000_fuentes_cisne_negro_apoyos.sql` (tipografías, Cisne negro, apoyos y descripción de 150 palabras)
- [ ] Para cada uno: ábrelo en tu editor, copia **todo** su contenido, pégalo y pulsa **Run**. Debe decir «Success. No rows returned».
- [ ] Comprueba en **Table Editor** que aparecen: `profiles`, `poems`, `tags`, `poem_tags`, `collections`, `collection_poems`, `favorites`, `reports`, `poem_supports`, `author_supports`.
- [ ] Si el **Security Advisor** avisa de vistas con «security definer» (`public_poems`, etc.), es normal: está hecho a propósito.

## 3. Configurar la autenticación

En **Authentication**:

- [ ] **Sign In / Providers → Email**: activado. Longitud mínima de contraseña: **8**.
- [ ] **Confirm email**: para probar rápido, **desactívalo** (las cuentas entran al momento). Antes de abrir la web al público, vuelve a **activarlo**.
- [ ] **URL Configuration → Site URL**: `http://localhost:5173`
- [ ] **URL Configuration → Redirect URLs**: añade `http://localhost:5173/**`

## 4. Copiar la URL y la clave pública

- [ ] Ve a **Project Settings → API Keys** (y **Data API** para la URL).
- [ ] Copia la **Project URL** (algo como `https://abcd1234.supabase.co`).
- [ ] Copia la **clave publishable** (empieza por `sb_publishable_…`; en proyectos antiguos se llama *anon*).
- [ ] ⚠️ **Nunca** copies la *secret* ni la *service_role*: esa no va en la web.

## 5. Conectar la web en tu ordenador

- [ ] En la carpeta del proyecto, copia `.env.example` y renómbralo a `.env.local` (Git lo ignora, no se sube).
- [ ] Rellénalo:
  ```
  VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
  VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
  ```
- [ ] Para el servidor (`Ctrl+C`) y vuelve a lanzarlo:
  ```bash
  npm run dev
  ```
- [ ] Comprobación: en la página **Entrar** ya **no** debe salir la nota «Versión de prueba…».
- [ ] Avisa a Claude con la URL y la clave pública para probarlo juntos de punta a punta.

## 6. Probar con dos usuarias

Usa una ventana normal (usuaria **A**) y una de incógnito (usuaria **B**).

- [ ] A escribe un poema **sin entrar**, pulsa *Publicar*, se registra… y el texto sigue ahí. Lo publica con su nombre.
- [ ] El poema aparece en **Explorar** y en la página de autor de A.
- [ ] A publica uno **anónimo**, uno con **pseudónimo**, uno **privado** y guarda un **borrador**.
- [ ] B, sin entrar, ve el público, el anónimo («Anónimo», sin enlace) y el del pseudónimo (sin enlace). **No** ve el privado ni el borrador, ni buscando su texto.
- [ ] B abre la URL directa del poema privado de A → «Este poema no existe o es privado».
- [ ] B se registra, guarda un poema de A en su biblioteca y lo añade a una colección suya.
- [ ] A crea una colección **pública** con su poema firmado y su anónimo → B solo ve el firmado.
- [ ] A cambia su bio y añade un enlace en *Ajustes → Perfil* → B lo ve en su página de autor.
- [ ] *Recuperar contraseña*: llega el correo y `/nueva-contrasena` deja cambiarla (el correo de serie de Supabase solo llega a emails de tu equipo del proyecto).
- [ ] A marca un poema como **Cisne negro**: B lo ve en negativo y tapado, y al marcar «Ocultar Cisne negro» en Explorar desaparece.
- [ ] B **apoya** un poema de A y a A. B no ve el número; A sí. A pone *Ajustes → Privacidad → Todo el mundo* y entonces B también lo ve.
- [ ] A escribe un poema con **negrita y cursiva** y la tipografía **Máquina**: B lo lee igual.
- [ ] B elimina su cuenta en *Ajustes → Cuenta* → desaparecen sus colecciones y su biblioteca.

## 7. Publicar en Cloudflare Pages (cuando todo funcione)

- [ ] En Cloudflare Pages → tu proyecto → **Settings → Environment variables** (Production y Preview), añade `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`.
- [ ] Lanza un **nuevo despliegue** (las variables se meten al compilar).
- [ ] En Supabase → **Authentication → URL Configuration**:
  - Site URL: tu dominio de Pages (p. ej. `https://cisne.pages.dev`).
  - Redirect URLs: añade `https://cisne.pages.dev/**`.
- [ ] Vuelve a activar **Confirm email**.

## 8. Antes de abrir la web a gente real

- [ ] Configura un correo propio en **Authentication → Emails → SMTP Settings** (Resend o Brevo tienen plan gratis). El de serie de Supabase solo envía a tu equipo y muy pocos por hora.
- [ ] Revisa de vez en cuando la tabla `reports` (denuncias) en *Table Editor*.

## Pendiente en el código (para otro día)

- [ ] Botón «Denunciar» en los poemas (la tabla ya existe).
- [ ] Página *Ajustes → Privacidad*.
- [ ] Recordatorio: `@supabase/supabase-js` está fijado en `2.109.0` porque las versiones nuevas piden Node 22 y tienes Node 20.
