# PROYECTO WEB: CISNE
Plataforma minimalista de poesía en español

> Brief original del proyecto. Es la fuente de verdad de producto y diseño. `CLAUDE.md` resume cómo implementarlo.

## 1. Visión general

Quiero crear una plataforma web llamada CISNE, dedicada exclusivamente a la poesía en español.

CISNE será un espacio digital donde las personas puedan escribir, publicar, leer y descubrir poemas, crear sus propios poemarios y construir una identidad literaria.

La plataforma debe sentirse como una mezcla entre una editorial literaria independiente, un libro de poesía contemporáneo y una galería de arte minimalista.

No quiero una red social convencional. No quiero una interfaz saturada, llena de colores, notificaciones, estadísticas, botones innecesarios o elementos que distraigan de la lectura.

Quiero una experiencia íntima, elegante, tranquila, estética y extremadamente sencilla de utilizar.

La poesía es la protagonista absoluta. Todo lo demás debe quedar en segundo plano.

- Idioma principal y único de la experiencia inicial: español.
- Nombre de marca: CISNE.
- Símbolo de marca: un cisne minimalista, elegante y delicado, con formas que recuerden sutilmente a un corazón y a una pluma.
- Público: personas que escriben poesía, desde principiantes hasta escritores experimentados.

## 2. Objetivos principales

La web debe permitir que cualquier usuario pueda:

1. Leer poemas publicados por otras personas.
2. Publicar un poema de forma rápida y sencilla.
3. Elegir entre publicar con su nombre visible o utilizar un pseudónimo.
4. Crear y personalizar su perfil literario.
5. Organizar sus poemas en colecciones o poemarios.
6. Buscar poemas mediante palabras, autores y etiquetas.
7. Descubrir poesía según sus intereses o estados de ánimo.
8. Guardar poemas favoritos en su biblioteca personal.
9. Gestionar sus propios poemas y colecciones desde un espacio privado.

La experiencia debe ser intuitiva. Un usuario debería poder entrar, encontrar un poema interesante y empezar a leer en cuestión de segundos.

## 3. Identidad visual y dirección artística

Quiero una identidad visual MUY minimalista, editorial, elegante y reconocible.

### Paleta de colores

Utilizar exclusivamente una paleta neutra:

- Blanco: `#FFFFFF`
- Negro: `#111111`
- Gris muy claro: `#F5F5F3`
- Gris medio: `#888888`
- Gris de líneas y bordes: `#E7E7E4`

El blanco y el negro deben dominar la interfaz. Se pueden utilizar variaciones sutiles de gris para crear jerarquía visual, separación y profundidad. No utilizar colores llamativos. No utilizar degradados, sombras fuertes, efectos luminosos ni elementos decorativos excesivos.

### Tipografía

Utilizar una combinación tipográfica editorial:

- Una serif elegante y literaria para los títulos, nombres de autores y poemas.
- Una sans serif limpia y moderna para navegación, botones, formularios y elementos funcionales.

La combinación debe transmitir la sensación de una revista literaria de alta calidad. Las tipografías deben ser legibles, especialmente en poemas largos. Utilizar espacios amplios, márgenes generosos, interlineado cómodo y una jerarquía visual muy clara.

### El cisne como símbolo

El cisne es el elemento distintivo de CISNE. Utilizar un símbolo lineal minimalista de un cisne, preferiblemente con una curva que sugiera un corazón.

Debe aparecer de forma discreta y coherente en:

- El logotipo principal.
- El favicon y el icono de la web.
- La pantalla de bienvenida o carga, si existe.
- Los estados vacíos de la biblioteca y las colecciones.
- Pequeños detalles gráficos.
- Posibles separadores editoriales.

También se pueden incorporar referencias muy sutiles a plumas, alas y trazos caligráficos.

IMPORTANTE: no llenar toda la interfaz de ilustraciones de cisnes. El símbolo debe ser reconocible y especial precisamente porque se utiliza con moderación.

Si hay disponible un archivo del logotipo de CISNE, utilizar ese archivo como referencia visual y no sustituirlo arbitrariamente por otro símbolo.

### Detalles únicos de la marca

- Un separador muy fino inspirado en la silueta de una pluma.
- Una pequeña marca gráfica al final de determinados poemas.
- Una composición tipográfica cuidada para mostrar títulos y autores.
- Una página de lectura que parezca una página de un libro impreso.
- Transiciones suaves y discretas.
- Un diseño especial para los estados vacíos, utilizando el cisne de forma delicada.
- Un pequeño detalle editorial en los números de página o en los metadatos, cuando tenga sentido.

Todos estos detalles deben ser sutiles. No quiero animaciones excesivas ni elementos decorativos que dificulten el uso.

## 4. Estructura general de la web

La navegación principal debe ser muy sencilla.

En escritorio, crear una cabecera limpia con:

- Logotipo de CISNE a la izquierda.
- Inicio.
- Explorar.
- Colecciones.
- Un botón discreto para escribir o publicar.
- Perfil del usuario o acceso a su cuenta.

En móvil, adaptar la navegación de manera natural, con un menú compacto y accesible. Se puede utilizar una barra inferior si mejora la experiencia, pero sin saturarla.

No crear demasiadas secciones. Las secciones principales deben ser:

1. Inicio.
2. Explorar.
3. Publicar poema.
4. Mis colecciones.
5. Mi perfil.
6. Biblioteca de favoritos.

Las funciones de configuración, edición y gestión deben estar disponibles sin ocupar un lugar protagonista en la navegación.

## 5. Página de inicio

La página de inicio debe ser el corazón de CISNE. Quiero una página limpia, elegante y muy visual, donde los poemas se puedan descubrir fácilmente.

### Cabecera

Mostrar el logotipo de CISNE y la navegación principal. Debajo, incluir una frase breve y elegante, por ejemplo:

«Un lugar para las palabras que merecen quedarse.»

No utilizar grandes bloques de marketing ni explicaciones interminables.

### Listado de poemas

Mostrar los poemas publicados por los usuarios en un flujo editorial limpio. Cada publicación debe incluir:

- Título del poema, si lo tiene.
- Fragmento inicial del poema.
- Nombre o pseudónimo del autor.
- Fecha de publicación, de forma discreta.
- Etiquetas, si existen.
- Acceso al poema completo.
- Acción para guardar en favoritos.
- Acceso al perfil del autor.

El contenido debe tener espacio suficiente para respirar. No mostrar cada poema dentro de una tarjeta con sombra. Priorizar un diseño abierto, con márgenes generosos y separadores finos.

El título puede utilizar una tipografía serif. El fragmento debe ser legible y conservar, en la medida de lo posible, los saltos de línea. No mostrar poemas completos excesivamente largos en el listado principal. Utilizar un fragmento y permitir abrir la página de lectura.

### Orden de los poemas

Permitir alternar entre:

- **Recientes**: mostrará primero las publicaciones más nuevas.
- **Descubrir**: puede utilizar un criterio de descubrimiento que ayude a encontrar contenido diverso, sin convertir la plataforma en una competición de popularidad.

No crear rankings agresivos ni destacar únicamente a los autores con más interacciones.

### Estados vacíos

Si todavía no hay poemas publicados, mostrar un mensaje elegante, por ejemplo:

«Toda obra empieza con una primera palabra.»

Añadir un botón discreto: «Escribir mi primer poema». No mostrar una página vacía o un error.

## 6. Publicar un poema

Esta es una de las funciones más importantes. Publicar un poema debe ser extremadamente sencillo y agradable.

Crear un botón claramente identificable llamado «Escribir un poema». Al pulsarlo, abrir un editor limpio, sin distracciones.

### Campos del editor

1. Título del poema: opcional.
2. Texto del poema: obligatorio.
3. Etiquetas: opcionales.
4. Colección a la que pertenece: opcional.
5. Visibilidad: pública o privada.
6. Identidad de publicación: nombre del perfil o pseudónimo.

El editor debe permitir escribir varias estrofas y conservar los saltos de línea. El texto no debe convertirse en un párrafo único al guardarse o publicarse. Utilizar un área de escritura amplia, con una tipografía cómoda y un interlineado generoso.

### Acciones

Mostrar únicamente las acciones necesarias:

- Guardar borrador.
- Vista previa.
- Publicar poema.

La acción principal debe ser «Publicar poema». Al pulsarla, validar los campos, guardar el poema y mostrar una confirmación discreta.

Si la publicación es pública, debe aparecer en el listado de inicio sin que el usuario tenga que realizar pasos adicionales.

No simular la publicación. El poema debe guardarse realmente en la base de datos y aparecer en la web para los usuarios autorizados.

Si ocurre un error, conservar el texto escrito y explicar cómo solucionarlo.

### Borradores

Permitir guardar poemas sin publicarlos. Los borradores solo deben ser visibles para su autor. Al volver al editor, el usuario debe poder continuar escribiendo.

### Privacidad

Un poema privado solo será visible para su autor. No debe aparecer en el inicio, en las búsquedas públicas, en los perfiles públicos ni en las colecciones públicas.

La visibilidad debe aplicarse también en el servidor y en las consultas a la base de datos, no únicamente ocultando elementos en la interfaz.

## 7. Nombre visible, pseudónimo y anonimato

Quiero que CISNE sea un lugar donde las personas puedan compartir lo que escriben sin sentirse obligadas a revelar su identidad real.

Distinguir claramente entre:

- Nombre real o nombre de cuenta.
- Nombre público o pseudónimo.
- Email privado.
- Identidad elegida para cada publicación.

El email nunca debe mostrarse públicamente. En el perfil, permitir que el usuario elija su nombre público o pseudónimo.

En el editor de cada poema, ofrecer dos opciones:

- Publicar con mi nombre público.
- Publicar con otro pseudónimo.

Si el usuario no tiene un pseudónimo configurado, permitir crear uno directamente desde el editor. Si selecciona un pseudónimo diferente para un poema, mostrar ese pseudónimo en la publicación sin revelar automáticamente su nombre de cuenta.

Ofrecer también una opción de publicación anónima, si es posible implementarla correctamente. Para las publicaciones anónimas, mostrar una etiqueta neutra como «Anónimo», sin enlazar el poema al perfil del autor ni revelar su identidad en la interfaz pública.

IMPORTANTE: el anonimato debe ser real frente a otros usuarios de la plataforma. No prometer anonimato absoluto frente a administradores, registros técnicos o requisitos legales. No exponer identificadores internos ni información privada mediante la API.

El autor debe poder seguir gestionando sus poemas desde su cuenta.

## 8. Página de lectura de un poema

La lectura debe ser una de las experiencias más cuidadas de CISNE. Al abrir un poema, mostrar una página casi como un libro.

Elementos:

- Título.
- Nombre o pseudónimo, o «Anónimo».
- Texto completo.
- Etiquetas.
- Colección, si pertenece a una.
- Fecha de publicación, de forma discreta.
- Botón para guardar en favoritos.
- Enlace al perfil del autor, cuando corresponda.
- Botón para compartir el enlace.
- Acciones de edición o eliminación únicamente para el propietario.

El texto debe ocupar una columna de anchura cómoda, sin extenderse por toda la pantalla. Conservar todos los saltos de línea, espacios entre estrofas y la estructura del poema.

No mostrar una barra lateral llena de recomendaciones. Al final, se puede incluir una pequeña sección de poemas relacionados, basada en etiquetas o temas, siempre de forma discreta.

## 9. Perfil de usuario

Crear una página de perfil personalizable y minimalista. Dividir los datos en información privada de la cuenta e información pública del perfil.

### Datos de la cuenta

- Email.
- Contraseña y opciones de seguridad.
- Nombre de cuenta.
- Fecha de creación de la cuenta.

El email y los datos de autenticación deben ser privados.

### Información del perfil

Permitir rellenar y editar:

- Nombre visible.
- Pseudónimo principal.
- Biografía breve.
- Fotografía de perfil opcional.
- Pronombres opcionales.
- Fecha de cumpleaños opcional.
- Género opcional.
- Ciudad o país opcionales.
- Enlaces personales opcionales.
- Preferencias literarias opcionales.

No obligar a proporcionar información personal que no sea necesaria. El género, los pronombres, la ubicación y el cumpleaños deben ser campos opcionales. Permitir decidir si determinada información puede aparecer públicamente.

Para el cumpleaños, permitir elegir entre mantener la fecha privada o mostrar únicamente día y mes, si el usuario lo desea.

No mostrar la edad, la fecha de nacimiento, el email ni la ubicación de forma pública por defecto.

### Perfil público

Mostrar:

- Nombre visible o pseudónimo.
- Biografía.
- Avatar opcional.
- Poemas publicados públicamente.
- Colecciones públicas.
- Etiquetas o intereses literarios, si el usuario los ha configurado.

No mostrar estadísticas innecesarias como puntuaciones, niveles, rachas de escritura o clasificaciones. El perfil debe parecer una pequeña página de autor.

### Perfil privado

Desde el área de gestión personal, permitir acceder a:

- Mis poemas.
- Mis borradores.
- Mis colecciones.
- Mis favoritos.
- Editar perfil.
- Ajustes de privacidad.
- Configuración de cuenta.

## 10. Colecciones y poemarios

Crear un apartado llamado «Mis colecciones». Los usuarios deben poder organizar sus poemas en poemarios propios. Una colección puede representar, por ejemplo, una etapa de la vida, una relación, una emoción, un tema o un proyecto literario.

### Crear colección

Campos:

- Título.
- Descripción opcional.
- Portada opcional.
- Poemas incluidos.
- Orden de los poemas.
- Visibilidad: pública o privada.

Permitir añadir poemas ya publicados a una colección y retirarlos sin borrar el poema original. Permitir cambiar el orden de los poemas. Permitir editar el título y la descripción de una colección. Permitir eliminar una colección con una confirmación clara. Eliminar una colección no debe borrar automáticamente los poemas que contiene.

### Presentación de las colecciones

No quiero una cuadrícula llena de portadas coloridas. Mostrar las colecciones con un diseño editorial sobrio, utilizando tipografía, espacio en blanco y pequeños detalles lineales.

Si no existe portada, generar una portada tipográfica elegante con el título de la colección.

Las colecciones públicas deben poder abrirse mediante una URL propia y compartirse. Las colecciones privadas no deben ser accesibles para otros usuarios.

## 11. Explorar y buscar poemas

Crear una sección llamada «Explorar». El buscador debe ser visible, sencillo y útil.

Permitir buscar por:

- Título del poema.
- Texto del poema.
- Nombre o pseudónimo público del autor.
- Etiquetas.

Los resultados deben ser claros y minimalistas. Añadir filtros discretos para:

- Poemas recientes.
- Etiquetas.
- Autor, cuando corresponda.

No crear un sistema de filtros complejo.

### Etiquetas

Permitir añadir etiquetas a cada poema, por ejemplo: #amor #nostalgia #duelo #esperanza #soledad #naturaleza #desamor #vida #libertad #melancolía

El usuario podrá escribir una etiqueta o elegir entre sugerencias existentes. Normalizar las etiquetas para evitar duplicados por diferencias de mayúsculas o espacios.

En la interfaz, las etiquetas deben verse pequeñas y discretas, sin colores llamativos ni bloques grandes. Al pulsar una etiqueta, mostrar otros poemas públicos que la utilicen.

Permitir varias etiquetas por poema, pero recomendar una cantidad moderada para mantener la organización.

### Descubrimiento

La página de exploración debe facilitar el descubrimiento de voces y estilos distintos. No utilizar exclusivamente el número de favoritos para decidir qué poemas se muestran. Evitar que la plataforma se convierta en una competición por conseguir popularidad.

## 12. Biblioteca de favoritos

Permitir guardar poemas de otros autores en una biblioteca privada. Cada usuario tendrá una sección llamada «Guardados» o «Mi biblioteca».

Los favoritos serán privados por defecto. Permitir quitar un poema de los favoritos en cualquier momento. No notificar al autor sobre cada acción de guardado, salvo que en el futuro se diseñe una función específica para ello. No crear colecciones de favoritos complejas en la primera versión.

## 13. Detalles diferenciadores de CISNE

Quiero que CISNE tenga una personalidad propia, no que parezca una copia de otras plataformas.

- **A. La lectura como experiencia editorial.** Cada poema debe sentirse como una pequeña obra independiente. La tipografía, el espacio y los saltos de línea son más importantes que los adornos.
- **B. El cisne como firma visual.** Utilizar el símbolo del cisne de forma sutil en los lugares adecuados. No colocar ilustraciones en cada sección.
- **C. La pluma como elemento de transición.** Crear un separador lineal muy fino inspirado en una pluma para separar determinadas secciones editoriales.
- **D. Una experiencia de escritura tranquila.** El editor no debe mostrar distracciones ni notificaciones innecesarias.
- **E. La identidad literaria por encima de la identidad personal.** Permitir que los autores se expresen mediante pseudónimos y que puedan publicar de manera anónima sin revelar sus datos personales.
- **F. Una plataforma sin competición.** No utilizar puntuaciones, tablas de clasificación, insignias, contadores de popularidad destacados ni mecanismos que presionen al usuario para publicar más.

## 14. Funciones que NO quiero

Evitar expresamente:

- Chat entre usuarios.
- Mensajería privada.
- Historias temporales.
- Vídeos.
- Reels.
- Publicaciones de imágenes como elemento principal.
- Seguimiento complejo de usuarios.
- Rankings de poetas.
- Gamificación.
- Puntos, niveles o recompensas.
- Notificaciones constantes.
- Publicidad invasiva.
- Animaciones exageradas.
- Ventanas emergentes innecesarias.
- Muros de tarjetas con sombras.
- Paneles administrativos visibles para usuarios normales.
- Funciones sociales que no sean necesarias para escribir, leer y descubrir poesía.

CISNE debe mantener su sencillez.

## 15. Diseño responsive

La web debe funcionar perfectamente en ordenadores, portátiles, tablets y móviles. Diseñar con enfoque mobile-first.

En móvil, el editor debe seguir siendo cómodo y el texto de los poemas debe poder leerse sin ampliar manualmente. Los botones deben tener un tamaño táctil adecuado. La navegación debe adaptarse al espacio disponible sin perder la estética. Evitar desplazamientos horizontales y elementos que se corten.

## 16. Accesibilidad y experiencia de usuario

La elegancia no debe perjudicar la usabilidad. Asegurar:

- Contraste suficiente entre texto y fondo.
- Tamaños de fuente legibles.
- Formularios con etiquetas claras.
- Estados de error comprensibles.
- Navegación mediante teclado.
- Indicadores de foco visibles.
- Botones con nombres accesibles.
- Textos alternativos para imágenes relevantes.
- Respeto por las preferencias de movimiento reducido.

No depender únicamente del color para comunicar errores o estados.

## 17. Arquitectura y tecnología

Quiero una aplicación web funcional, mantenible y preparada para crecer.

Antes de programar, revisa el entorno y las herramientas disponibles. Si el proyecto ya contiene código, conserva lo que funcione y adapta la implementación existente en lugar de reconstruirlo todo innecesariamente. Si empiezas desde cero, utiliza una arquitectura moderna y sencilla.

Stack sugerido, siempre que sea compatible con el entorno:

- Next.js.
- TypeScript.
- Tailwind CSS.
- Componentes reutilizables.
- Supabase para autenticación, base de datos y almacenamiento, si se dispone de este servicio.

No es obligatorio utilizar exactamente estas tecnologías si el entorno exige otras. Prioriza una implementación estable, segura y sencilla de mantener.

### Modelo de datos

Diseña una base de datos con entidades equivalentes a:

**Profiles**: id, account_name, display_name, primary_pseudonym, bio, avatar_url, email privado gestionado por el sistema de autenticación, birth_date opcional, gender opcional, pronouns opcionales, location opcional, website_url opcional, literary_interests opcionales, created_at, updated_at.

**Poems**: id, author_id, title opcional, content, visibility (public o private), publication_identity (profile_name, pseudonym o anonymous), displayed_pseudonym opcional, created_at, updated_at, published_at opcional.

**Tags**: id, name, normalized_name.

**PoemTags**: poem_id, tag_id.

**Collections**: id, owner_id, title, description opcional, cover_url opcional, visibility, created_at, updated_at.

**CollectionPoems**: collection_id, poem_id, position.

**Favorites**: user_id, poem_id, created_at.

**Drafts**: puedes utilizar la misma tabla Poems con un estado draft, siempre que el modelo y las políticas de seguridad garanticen que los borradores nunca se expongan públicamente.

Añade las relaciones, índices y restricciones necesarias. Utiliza identificadores únicos y marcas temporales. La estructura final debe evitar duplicidades innecesarias y garantizar la integridad de los datos.

## 18. Autenticación, seguridad y privacidad

Implementar:

- Registro de usuarios.
- Inicio de sesión.
- Cierre de sesión.
- Recuperación de contraseña.
- Protección de rutas privadas.
- Edición segura del perfil.
- Gestión de sesiones.

Los usuarios solo pueden editar y eliminar sus propios poemas y colecciones. Los favoritos y borradores son privados. Las colecciones privadas y los poemas privados nunca deben aparecer en resultados públicos.

Implementar políticas de autorización en el servidor y en la base de datos. Si se utiliza Supabase, configurar correctamente Row Level Security (RLS).

Validar los datos recibidos en el servidor. No exponer claves secretas en el código del navegador. No utilizar el email como identificador público.

Permitir que el usuario elimine su cuenta, con información clara sobre las consecuencias.

Añadir mecanismos básicos para denunciar contenido inapropiado y proteger la plataforma frente a spam o abuso, sin convertir la interfaz en un panel de moderación complejo.

No almacenar datos personales que no sean necesarios.

## 19. Publicación y gestión de contenido

El sistema debe distinguir claramente entre borradores, poemas públicos y poemas privados.

- Un poema solo se publica cuando el usuario pulsa explícitamente «Publicar poema».
- Al editar un poema publicado, guardar los cambios de forma segura.
- Antes de eliminar un poema, solicitar confirmación.
- Si un poema forma parte de una colección, gestionar la relación de forma coherente.
- Si el usuario selecciona «Anónimo», no incluir un enlace al perfil en la página pública del poema.
- Si un poema es privado, impedir el acceso mediante URL directa y API.
- Evitar que un error de carga o guardado provoque la pérdida del texto escrito.

## 20. Calidad y rendimiento

La aplicación debe ser rápida y ligera. Optimizar las fuentes y las imágenes. Evitar dependencias innecesarias. No introducir librerías grandes para resolver tareas sencillas. Evitar saltos visuales durante la carga. Mostrar estados de carga, error y éxito con un diseño coherente con CISNE.

Crear componentes reutilizables para: cabecera, navegación, logotipo, elemento de poema, vista de lectura, editor, etiquetas, perfil, colección, formularios, diálogos de confirmación y mensajes de estado.

## 21. Plan de implementación

Trabaja por fases.

- **Fase 1. Identidad visual y estructura**: configurar el proyecto; crear la paleta y el sistema tipográfico; implementar la navegación; crear la página de inicio; diseñar el componente de poema; crear la página de lectura; preparar el diseño responsive.
- **Fase 2. Autenticación y perfiles**: registro e inicio de sesión; creación del perfil; edición de datos; gestión de privacidad.
- **Fase 3. Poemas**: editor; borradores; publicación; edición y eliminación; identidad pública, pseudónimos y anonimato.
- **Fase 4. Colecciones**: crear y editar colecciones; añadir poemas; ordenar poemas; gestionar visibilidad.
- **Fase 5. Descubrimiento**: buscador; etiquetas; filtros; favoritos.
- **Fase 6. Revisión**: comprobar permisos; probar los flujos principales; revisar la experiencia móvil; corregir errores; mejorar accesibilidad y rendimiento.

Si no es posible implementar todo de una sola vez, prioriza una primera versión funcional con autenticación, perfiles, publicación de poemas, página de lectura, búsqueda y colecciones.

## 22. Criterios de aceptación

La primera versión se considerará funcional cuando:

1. Un usuario pueda registrarse e iniciar sesión.
2. Pueda crear y editar su perfil.
3. Pueda escribir un poema y guardarlo como borrador.
4. Pueda publicar un poema y verlo en la página de inicio.
5. El poema conserve sus saltos de línea.
6. Pueda elegir una identidad pública o publicar de forma anónima.
7. Pueda editar y eliminar sus propios poemas.
8. Pueda crear una colección y añadir poemas.
9. Pueda buscar poemas y filtrarlos por etiquetas.
10. Pueda guardar poemas en favoritos.
11. Los poemas y colecciones privados no sean accesibles para otros usuarios.
12. La web funcione correctamente en móvil y escritorio.
13. No haya botones principales que no hagan nada.
14. No se utilicen datos de demostración como si fueran publicaciones reales.
15. El diseño mantenga una estética minimalista, coherente y elegante.

## 23. Instrucciones finales

No quiero únicamente una descripción, una propuesta visual ni una maqueta estática. Quiero que implementes la web y que las funciones principales funcionen de verdad.

Antes de empezar, inspecciona el entorno disponible y determina qué tecnologías, servicios y archivos existen.

Si falta una clave, una cuenta de Supabase u otro servicio externo, explícame exactamente qué necesito configurar. No finjas que una función está conectada si no lo está.

Si necesitas crear datos de ejemplo para desarrollar, mantenlos claramente separados de los datos reales y no los presentes como contenido auténtico de usuarios.

No sacrifiques la calidad visual por añadir más funciones. Prioriza el diseño, la lectura, la escritura y la simplicidad. Cada pantalla debe tener un propósito claro. Cada botón debe tener una función real. Cada elemento decorativo debe justificar su presencia.

**La esencia de CISNE: menos ruido, más poesía.**

Empieza inspeccionando el proyecto, define una arquitectura adecuada y después implementa la primera versión funcional. Toma decisiones de diseño coherentes sin pedirme confirmación para cada detalle. Si existe una limitación técnica importante, explícala y ofrece una solución concreta.
