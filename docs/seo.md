# SEO, analítica y anuncios — ideas

> Lista de mejoras posibles para que CISNE se encuentre en buscadores, saber
> cuánta gente entra y, si algún día hay tráfico, poder poner anuncios. No es
> backlog: cuando una idea se vaya a hacer, se convierte en una feature de
> `feature_list.md`. Lo marcado `[x]` está hecho (código en F11 y F20). Orden aproximado de impacto/esfuerzo.

## El problema de fondo: es una SPA

Hoy **todas las URLs devuelven el mismo HTML vacío** (`index.html` con
`<div id="root">`) y el mismo título, «CISNE — poesía en español». El
contenido lo pinta React en el navegador.

- **Google** ejecuta JavaScript, pero más tarde y con menos prioridad: indexa,
  aunque más lento y peor.
- **Bing, DuckDuckGo y otros** lo hacen peor o no lo hacen.
- **WhatsApp, Telegram, X, Facebook, LinkedIn** no ejecutan JavaScript: al
  compartir un poema, la vista previa sale siempre genérica. Para una web de
  poesía, que se comparte mucho, esto es lo que más se nota.

Casi todo lo de abajo ataca esto.

## Fase 1 — Lo básico (poco esfuerzo, hacerlo ya)

- [x] **Google Search Console** y **Bing Webmaster Tools**: dar de alta
  `cisneverso.es` (propiedad de dominio, verificada por DNS: hecho). Es la
  herramienta que dice qué se indexa, con qué búsquedas apareces y qué errores
  hay. Gratis.
- [x] **`public/robots.txt`**: permitir todo menos las zonas privadas
  (`/escribir`, `/mis/`, `/ajustes/`, `/entrar`, `/registro`, `/recuperar`,
  `/nueva-contrasena`) y apuntar al sitemap.
- [x] **Título y descripción por página**. React 19 permite poner `<title>` y
  `<meta name="description">` dentro de cualquier componente y los sube al
  `<head>`. Ejemplos:
  - Poema: «Título del poema — Autora · CISNE», descripción = primeros versos.
  - Autor: «Nombre — poemas en CISNE», descripción = su bio.
  - Etiqueta: «Poemas de #amor · CISNE».
  - Páginas privadas: `<meta name="robots" content="noindex">`.
- [x] **URL canónica** (`<link rel="canonical">`) en poema, autor, colección y
  etiqueta, para que `?ver=…` o mayúsculas no cuenten como páginas distintas.
- [x] **Imagen para compartir por defecto** (`og:image`, 1200×630): el cisne
  sobre blanco con «CISNE · poesía en español». Más `og:title`,
  `og:description`, `og:site_name` y `twitter:card` en `index.html`.
- [x] **Analítica sin cookies: Cloudflare Web Analytics** (activada el 2026-10-29). Ya estáis en
  Cloudflare: se activa en el panel, es gratis, no usa cookies y por tanto
  **no necesita banner de consentimiento**. Da visitas, páginas más vistas,
  países, de dónde llega la gente y Core Web Vitals. Para empezar sobra.

## Fase 2 — Que los buscadores y las redes vean el poema

- [x] **Worker que rellena el `<head>` en el servidor** para `/poema/:id`,
  `/autor/:nombre`, `/coleccion/:id` y `/etiqueta/:tag` (en producción desde
  el 2026-10-28; vista previa comprobada en opengraph.xyz). El Worker ya existe
  (`wrangler.jsonc`): se le añade un poco de código que pide el dato a la vista
  pública de Supabase (`public_poems`, etc.) y, con `HTMLRewriter`, escribe el
  título, la descripción, el `og:*` y la canónica en el `index.html` antes de
  enviarlo. La web sigue siendo la misma SPA; solo cambia el `<head>`.
  - Arregla las vistas previas al compartir en WhatsApp/X/Telegram.
  - Ayuda a Google, Bing y compañía.
  - Respeta el anonimato: solo usa lo que ya es público en `public_*`.
- [x] **`sitemap.xml` dinámico** servido por el mismo Worker: poemas públicos,
  autores, colecciones públicas y etiquetas, con `lastmod`. Enviado en Search
  Console.
- [x] **Bing Webmaster Tools**: importar la propiedad desde Search Console.
- [x] **Solicitar indexación** de la portada y algunos poemas (Search Console →
  Inspección de URLs).
- [x] **Datos estructurados (JSON-LD)**: `CreativeWork` (con `genre: "poesía"`,
  autor, fecha, idioma `es`) en cada poema y `Person` en la página de autor.
  Para anónimos, sin autor. Ayuda a que Google entienda qué es cada página.
- [ ] (Opcional) **Imagen para compartir por poema**: una tarjeta con el
  título y los primeros versos en Cormorant sobre blanco, generada por el
  Worker. Muy vistosa en redes; más trabajo.

## Fase 3 — Rendimiento (Google lo puntúa)

- [x] **Cargar menos JavaScript al principio** (F11, hecho): leer un poema no
  necesita el editor ni los ajustes.
- [x] **Fuentes** (F20: 169 → 42 ficheros): se generaban ~170 ficheros de fuente, con alfabetos
  cirílico, griego y vietnamita que una web en español no usa. Dejar solo
  `latin` y `latin-ext`, y precargar (`<link rel="preload">`) la Cormorant
  regular. Mejora el LCP (lo que tarda en verse el contenido principal).
- [ ] Mirar **PageSpeed Insights** y el informe de Core Web Vitals de Search
  Console de vez en cuando.

## Fase 4 — Contenido y crecimiento

- [ ] **Las etiquetas son páginas de entrada**: «poemas de amor», «poemas sobre
  el duelo»… son búsquedas reales. Una frase breve de introducción en las
  etiquetas más usadas las hace más útiles para el buscador y para el lector.
- [ ] **Enlaces internos**: poemas relacionados (ya existe), enlace a la
  etiqueta y a la colección desde cada poema, autor ↔ colecciones.
- [x] **Página «Sobre CISNE»** y **contacto** (F21): dan confianza a buscadores y a
  redes de anuncios (y la piden).
- [ ] **Redes** (U4): compartir poemas (con permiso) enlazando a CISNE. Los
  enlaces que llegan de fuera son lo que más pesa en SEO.
- [x] **Dominio propio**: `cisneverso.es` (el antiguo `cisneverso.dmaymo.es`
  está retirado).
- [ ] **Respeto a los autores**: opción «no mostrar este poema en buscadores»
  (`noindex`) por poema o por autor. Mucha gente escribe poesía para un
  círculo pequeño; encaja con el espíritu de CISNE.

## Fase 5 — Anuncios (cuando haya tráfico)

- [ ] **Antes de pedir AdSense**: página de privacidad (F18), «Sobre CISNE»,
  contacto, dominio verificado y contenido original suficiente. Google no pide
  un mínimo de visitas oficial, pero rechaza webs con poco contenido.
- [ ] **Consentimiento de cookies (UE)**: los anuncios de Google usan cookies,
  así que en Europa hace falta un banner con un **CMP certificado por Google**
  (el de Google, Cookiebot, etc.). Hasta entonces, con la analítica sin
  cookies, no hace falta banner.
- [ ] **`public/ads.txt`** con el ID de editor de AdSense.
- [ ] **Dónde poner anuncios sin romper CISNE**: nunca dentro de un poema ni
  entre versos; como mucho un espacio discreto en listados o al final de la
  página. El brief pide «sin publicidad invasiva».
- [ ] **Alternativas que encajan mejor**: donaciones (Ko-fi, Buy Me a Coffee),
  edición en papel de colecciones, patrocinio de una antología. Con poco
  tráfico suelen rendir más que AdSense.

## ¿Google Analytics?

No hace falta al principio:

| Herramienta | Qué da | Cookies / banner | Coste |
|---|---|---|---|
| **Search Console** | Qué búsquedas os traen gente y en qué posición | No | Gratis |
| **Cloudflare Web Analytics** | Visitas, páginas, países, origen, rendimiento | No | Gratis |
| Umami / Plausible | Lo anterior más eventos (p. ej. «poema publicado») | No | Umami gratis en vuestro VPS; Plausible ~9 €/mes |
| **Google Analytics 4** | Todo, y se conecta con AdSense | **Sí: necesita banner** | Gratis |

Recomendación: **Search Console + Cloudflare Web Analytics ya**. GA4 solo si
llegáis a los anuncios y queréis cruzar datos con AdSense, y entonces junto con
el banner de consentimiento.
