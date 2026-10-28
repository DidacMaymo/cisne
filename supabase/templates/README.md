# Plantillas de correo de CISNE

HTML con tablas y estilos en línea (compatible con Gmail y móvil). El cisne es
`public/email/cisne.png`, servido por la propia web
(`https://cisneverso.es/email/cisne.png`).

| Fichero | Casilla del panel (*Authentication → Emails → Templates*) | Asunto |
|---|---|---|
| `confirmar.html` | *Confirm signup* | Confirma tu correo en CISNE |
| `recuperar.html` | *Reset password* | Recupera tu contraseña de CISNE |
| `cambio-email.html` | *Change email address* | Confirma tu nuevo correo en CISNE |

Variables usadas (sintaxis Go de Supabase): `{{ .ConfirmationURL }}`,
`{{ .Email }}`, `{{ .NewEmail }}` (solo en el cambio de email).

Guía de uso: `docs/SUPABASE.md`, sección «Correos de CISNE».
