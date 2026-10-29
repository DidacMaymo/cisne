import { ContactLink, LegalPage, LegalSection } from '../components/LegalPage'

export function CookiePolicy() {
  return (
    <LegalPage title="Política de cookies" path="/cookies">
      <LegalSection title="En resumen">
        <p>
          CISNE no usa cookies de publicidad ni de seguimiento. Solo guarda en tu navegador lo imprescindible para que
          la web funcione, y mide las visitas con una herramienta de analítica que no usa cookies (ver abajo). Por eso
          no te mostramos un banner de cookies: no hay nada que aceptar.
        </p>
      </LegalSection>

      <LegalSection title="Analítica de visitas">
        <p>
          Usamos Cloudflare Web Analytics para saber cuánto se usa CISNE. No usa cookies ni guarda nada en tu
          navegador, no crea huella digital tuya ni te sigue entre webs. Solo obtiene datos agregados de las visitas:
          páginas vistas, país, navegador y rendimiento.
        </p>
      </LegalSection>

      <LegalSection title="Qué se guarda en tu navegador">
        <ul className="list-disc space-y-1 pl-6">
          <li>Tu sesión, si has entrado en tu cuenta, para que no tengas que identificarte en cada visita.</li>
          <li>El borrador que estás escribiendo, que se autoguarda para que no pierdas el poema.</li>
          <li>Tus preferencias, como ocultar o no el modo «cisne negro» en Explorar.</li>
        </ul>
        <p>
          Se guarda en el almacenamiento local del navegador y no se usa para identificarte entre webs ni se cede a
          terceros. Puedes borrarlo cuando quieras desde los ajustes de tu navegador; si lo haces, tendrás que volver a
          entrar y perderás los borradores que no hayas publicado.
        </p>
      </LegalSection>

      <LegalSection title="Dudas">
        <p>
          Escríbenos a <ContactLink />.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
