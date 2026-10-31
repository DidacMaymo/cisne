# Cómo publicar un artículo en la Comunidad de escritores

Esta guía es para quien escribe los artículos, sin necesidad de saber programar.

## Qué es un artículo

Cada artículo es **un fichero de texto** en la carpeta `content/comunidad/`, escrito en
**Markdown**: un modo de dar formato con signos sencillos (`##` para un título,
`**negrita**`, `- ` para listas) que la web convierte en texto bonito. No hay panel de
administración: el fichero es el artículo.

## Crear uno

1. Copia `content/comunidad/_plantilla.md` y renómbralo, p. ej. `como-escribir-un-soneto.md`.
   El nombre es la dirección: `cisneverso.es/comunidad/como-escribir-un-soneto`. Usa solo
   minúsculas, números y guiones, y no cambies el nombre una vez publicado.
2. Rellena la cabecera (entre las dos líneas `---`) y escribe el texto debajo.
3. Mientras trabajas, deja `borrador: true`: solo se ve en tu ordenador (`npm run dev`).
   Para publicar, borra esa línea o pon `borrador: false`.

## Campos de la cabecera

| Campo | Qué poner |
|---|---|
| `titulo` | El título. Incluye lo que la gente buscaría. |
| `descripcion` | Una frase de **160 caracteres como máximo**; es el texto que ve Google. |
| `fecha` | `AAAA-MM-DD`, p. ej. `2026-11-05`. Los más recientes salen primero. |
| `autor` | Quién firma. |
| `etiquetas` | Lista entre corchetes: `[escritura, métrica]`. Puede ser `[]`. |
| `borrador` | Opcional. `true` = no se publica. |

Si algo está mal (falta un campo, la fecha no existe…), el artículo no se publica y la
construcción de la web falla avisando del fichero y del motivo.

## Formato admitido

Párrafos (separados por una línea en blanco), `## Título` y `### Subtítulo`, listas con
`- ` o `1. `, `**negrita**`, `*cursiva*`, `[texto](https://enlace)`, y citas con `> `.
Nada más: el HTML escrito a mano **no** funciona (se muestra como texto). Un enlace a otra
página de CISNE se escribe `[escribir](/escribir)`.

## Buenas prácticas de SEO

- **El primer párrafo responde a la búsqueda.** Quien llega desde Google debe encontrar
  la respuesta en las primeras líneas.
- Una idea por sección `##`, con títulos que digan algo («Cómo contar las sílabas»,
  no «Parte 2»).
- Título y descripción únicos, con la palabra clave de forma natural, sin repetirla.
- Párrafos cortos; entre 600 y 1.500 palabras suele ir bien.
- Cierra con «Para seguir leyendo» (libros y recursos con enlace) y una invitación a
  escribir en CISNE.
- No cambies el nombre del fichero de un artículo ya publicado: se rompería su dirección.

## Cómo se publica

Cada cambio en la rama `main` **se publica en producción** al fusionarse. Dos caminos:

1. **Pídeselo a Claude**: «publica esta entrada» (con el texto). Claude crea el fichero,
   abre un Pull Request y, con la comprobación automática en verde, lo fusiona.
2. **A mano en GitHub**: sube o crea el fichero en `content/comunidad/` desde la web de
   GitHub, abre un **Pull Request** (una propuesta de cambio), espera a que las
   comprobaciones salgan en verde y pulsa **Merge**. En un par de minutos está en
   `cisneverso.es/comunidad`.

Para retirar un artículo, pon `borrador: true` y repite el proceso.

## Programar un artículo

Pon en `fecha` un día **futuro** (sin `borrador`) y publica como siempre. El artículo queda
**programado**: sale solo ese día, sin volver a desplegar. Así puedes dejar escritos varios
con fechas consecutivas y que salga uno al día.

- «Hoy» es la fecha de **Madrid** (`Europe/Madrid`): a las 00:00 de Madrid ya está publicado.
  Regla: publicado = sin `borrador` y `fecha` ≤ hoy.
- Quien entra antes de tiempo no ve nada: ni en la portada, ni en `/comunidad`, ni en el
  sitemap; `/comunidad/<slug>` muestra «no encontrado» con `noindex`. Un enlace de otro
  artículo a uno aún programado lleva a ese «no encontrado» hasta su día.
- Con `npm run dev` ves los programados (y borradores) con la marca «programado».
- Retraso: el Worker y las cachés retienen la página hasta 5 minutos (el sitemap, 30), y un
  navegador con la web ya abierta ve el cambio al recargar o navegar.
- Aviso: el texto de un programado viaja dentro del JavaScript de la web (es un sitio
  estático), así que no sirve para guardar secretos, solo para escalonar la salida.
