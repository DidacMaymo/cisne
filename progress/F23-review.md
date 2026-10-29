# Review — F23
**Veredicto:** APPROVED

> Transcrito por el líder: el reviewer no tenía herramienta de escritura en esa sesión y devolvió el veredicto en su respuesta.

## Aceptación
- [x] Manifiesto `public/manifest.webmanifest`: name, short_name, lang es, start_url "/", standalone, #FFFFFF en background y theme, iconos 192/512 any y 512 maskable. Tamaños verificados con `file`: 192x192, 512x512, 512x512 y apple-touch 180x180, RGB opacos.
- [x] Iconos: cisne en tinta sobre blanco; el maskable con el cisne a ~60 % del lienzo, centrado, dentro de la zona segura. Sin dependencias nuevas.
- [x] `index.html:7-8` enlaza manifest y apple-touch-icon. `wrangler.jsonc`: `run_worker_first` solo lista poema, autor, colección, etiqueta y sitemap; manifiesto e iconos los sirven los assets. Test nuevo en `worker/worker.test.ts:39` (`matchRoute` devuelve null para los cuatro paths).
- [x] `/sobre`: h2 «¿Y en el móvil?», texto «por ahora una web / no descartamos una app», dos `ol` con los pasos de iPhone/Safari y Android/Chrome. Tono sobrio.
- [x] «Apoyar el proyecto»: h2 propio, compartir y publicar. `kofiUrl` en `social.ts:7` = `null`; el enlace solo se pinta con `kofiUrl &&`.
- [x] `./init.sh` → `[OK] Entorno listo` (RLS 87 casos, tests unitarios OK).

## Checkpoints
R1 Alcance [x] · R2 Arquitectura [x] · R3 Diseño y accesibilidad [x] · R4 Tests [x] · R5 Build [x] · R6 Higiene [x]. Sin fugas de privacidad.

## Cambios requeridos
Ninguno.

## Observaciones (no bloquean)
- El Content-Type `application/manifest+json` solo se comprueba tras desplegar en cisneverso.es.
- Los iconos `any` ocupan ~78 % del lienzo; válido.
