# Conectar CISNE a Supabase

Supabase es el backend de CISNE: una base de datos Postgres con autenticación
incluida. No hay servidor propio que desplegar: solo se aplica el SQL de
`supabase/migrations/` y el frontend habla con Supabase usando la clave
**pública**. La seguridad la ponen las políticas **RLS** (Row Level Security:
Postgres decide fila a fila qué puede ver o cambiar cada usuario), no el
navegador.

Sin las variables de entorno, la web sigue funcionando en **modo local**
(todo en el navegador), como hasta ahora.

## Lo que necesitas

- [ ] Una cuenta en [supabase.com](https://supabase.com) (plan gratuito).
- [ ] Un proyecto nuevo. Región cercana (p. ej. *West EU*). Apunta la contraseña de la base de datos en tu gestor de contraseñas: no hace falta para la web, pero sí para administrarla.
- [ ] La **Project URL** y la **clave pública** (*publishable*, empieza por `sb_publishable_…`; en proyectos antiguos se llama *anon*). Están en *Project Settings → API Keys*. **Nunca** uses la *secret* ni la *service_role* en el frontend.

## 1. Crear las tablas (una vez)

1. En el panel del proyecto: *SQL Editor → New query*.
2. Aplica los archivos de `supabase/migrations/` **en orden**, cada uno en una consulta nueva (pega el contenido entero y pulsa *Run*):
   1. [`20261018120000_init.sql`](../supabase/migrations/20261018120000_init.sql)
   2. [`20261019120000_fuentes_cisne_negro_apoyos.sql`](../supabase/migrations/20261019120000_fuentes_cisne_negro_apoyos.sql)
   3. [`20261020120000_comentarios_y_apoyos.sql`](../supabase/migrations/20261020120000_comentarios_y_apoyos.sql)
   4. [`20261101120000_denunciar_poema.sql`](../supabase/migrations/20261101120000_denunciar_poema.sql)
3. Cada uno debe terminar con «Success. No rows returned». En *Table Editor* verás `profiles`, `poems`, `tags`, `poem_tags`, `collections`, `collection_poems`, `favorites`, `reports`, `poem_supports`, `author_supports` y `verse_comments`, todas con el candado de RLS.

> Alternativa con la CLI de Supabase: `npx supabase login`, `npx supabase link --project-ref TU-REF` y `npx supabase db push`.

El *Security Advisor* avisará de que las vistas `public_*` usan «security definer». Es intencionado: son la única ventana pública a los datos y filtran ellas mismas lo publicado.

## 2. Configurar la autenticación

En *Authentication*:

- [ ] **Sign In / Providers → Email**: activado. *Minimum password length*: 8.
- [ ] **Confirm email**: actívalo para la web real. Para probar rápido puedes desactivarlo (las cuentas entran al instante).
- [ ] **URL Configuration → Site URL**: `http://localhost:5173` mientras pruebas; luego, tu dominio de Cloudflare Pages.
- [ ] **URL Configuration → Redirect URLs**: añade `http://localhost:5173/**` y `https://TU-PROYECTO.pages.dev/**`. Sin esto, los enlaces de confirmación y de «olvidé mi contraseña» no vuelven a CISNE.
- [ ] **Correos**: el servidor de correo de serie de Supabase solo entrega a los emails del equipo del proyecto y con un límite muy bajo por hora. Para probar con cuentas tuyas basta; para usuarios reales, configura un SMTP propio en *Authentication → Emails → SMTP Settings* (Resend o Brevo tienen plan gratuito).

## Correos de CISNE (plantillas en español)

Las plantillas están en `supabase/templates/` (ver su `README.md`). Se pegan a mano en el panel:

1. *Authentication → Emails → Templates*. Si el panel no deja editar plantillas, configura antes un SMTP propio (*Authentication → Emails → SMTP Settings*, tarea U3): sin él, Supabase bloquea la edición.
2. Para cada casilla, pega el **Subject** y el HTML (*Source*) de su fichero:
   - *Confirm signup* → `confirmar.html` · «Confirma tu correo en CISNE»
   - *Reset password* → `recuperar.html` · «Recupera tu contraseña de CISNE»
   - *Change email address* → `cambio-email.html` · «Confirma tu nuevo correo en CISNE»
3. Guarda. El cisne se carga desde `https://cisneverso.dmaymo.es/email/cisne.png`, así que solo se ve cuando esa web está publicada.

Nota: el remitente «CISNE <hola@tu-dominio>», el límite de envíos y quitar el «powered by Supabase» exigen **SMTP propio (U3)**.

## 3. Conectar el frontend

1. Copia `.env.example` como `.env.local` (Git lo ignora).
2. Rellena:
   ```
   VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```
   > ⚠️ Solo el dominio, sin `/rest/v1` al final. Si lo pones, la web llama a `/rest/v1/rest/v1/…` y Supabase responde «Invalid path» (PGRST125).
3. Para el servidor de desarrollo y vuelve a lanzarlo: `npm run dev`. Las variables `VITE_*` se leen al arrancar.
4. Señal de que funciona: en *Entrar* ya no aparece la nota «Versión de prueba…».

Los poemas guardados en modo local no se copian a Supabase.

## 4. Probarlo (con dos usuarios)

Usa una ventana normal para la usuaria A y una de incógnito para la B.

- [ ] A se registra. Si *Confirm email* está activo, llega el correo, abre el enlace y queda dentro.
- [ ] A escribe sin haber entrado, pulsa *Publicar*, entra, y el texto sigue ahí. Publica con su nombre: aparece en *Explorar* y en `/autor/su-nombre`.
- [ ] A publica uno **anónimo**, uno con **pseudónimo**, uno **privado** y guarda un **borrador**.
- [ ] B (sin entrar) ve en *Explorar* el público, el anónimo («Anónimo», sin enlace) y el del pseudónimo (sin enlace). No ve el privado ni el borrador, ni buscando su texto.
- [ ] B abre la URL directa del poema privado de A → «Este poema no existe o es privado».
- [ ] B se registra, guarda un poema de A en su biblioteca y lo añade a una colección suya.
- [ ] A crea una colección **pública** con su poema firmado y su anónimo. B la ve con un solo poema (el anónimo no aparece: delataría a A).
- [ ] A cambia su bio y añade un enlace en *Ajustes → Perfil*; B lo ve en su página de autor.
- [ ] *Recuperar contraseña* envía el correo y `/nueva-contrasena` permite cambiarla.
- [ ] B elimina su cuenta en *Ajustes → Cuenta*: desaparecen sus colecciones y su biblioteca.

Las reglas de seguridad también tienen una prueba automática que no necesita Supabase: `npm run test:db` (aplica las migraciones en un Postgres embebido y comprueba casi 70 casos con dos usuarios).

## 5. Publicar en Cloudflare Pages

- [ ] *Settings → Environment variables* (Production y Preview): `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`. Se incrustan **al compilar**: tras añadirlas, lanza un nuevo despliegue.
- [ ] En Supabase, cambia la *Site URL* al dominio de Pages y comprueba las *Redirect URLs*.

## Mantenimiento

- **Denuncias**: se guardan en la tabla `reports` (*Table Editor*). Aún no hay botón «Denunciar» en la interfaz.
- **Cambios de esquema**: cada cambio es un archivo nuevo en `supabase/migrations/` (nunca editar uno ya aplicado). Antes de aplicarlo, `npm run test:db`.
- **Node 20**: `@supabase/supabase-js` está fijado en `2.109.0`, la última versión que admite Node 20. Las siguientes piden Node 22.
