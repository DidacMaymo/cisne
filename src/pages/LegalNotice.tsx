import { ContactLink, LegalPage, LegalSection } from '../components/LegalPage'

export function LegalNotice() {
  return (
    <LegalPage title="Aviso legal y condiciones de uso">
      <LegalSection title="Quién está detrás">
        <p>
          CISNE es una plataforma de poesía en español para leer, escribir y publicar poemas. El responsable de la web
          y su contacto es <ContactLink />.
        </p>
      </LegalSection>

      <LegalSection title="Condiciones de uso">
        <p>Al usar CISNE aceptas estas condiciones. Para publicar, te pedimos que:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>El contenido sea original y propio, o tengas derecho a publicarlo. No se admite el plagio.</li>
          <li>No publiques contenido de odio, acoso o amenazas, ni nada que vulnere la ley.</li>
          <li>Respetes a las demás personas, en los poemas y en los comentarios.</li>
        </ul>
        <p>
          Quien tenga cuenta puede denunciar un poema que no sea suyo. Retiraremos el contenido que incumpla estas
          condiciones o la ley, y podremos cerrar las cuentas que lo repitan. También puedes avisarnos en{' '}
          <ContactLink />.
        </p>
      </LegalSection>

      <LegalSection title="Propiedad intelectual">
        <p>
          Los poemas son de sus autores. CISNE solo recibe el permiso necesario para mostrarlos mientras sigan
          publicados. Puedes borrar tus poemas cuando quieras y, con ellos, ese permiso termina.
        </p>
        <p>El diseño, el nombre y el código de CISNE pertenecen a su responsable.</p>
      </LegalSection>

      <LegalSection title="Pseudónimos y anonimato">
        <p>
          Puedes publicar con tu nombre, con un pseudónimo o de forma anónima. Esa protección es real frente a las demás
          personas usuarias, pero no frente al responsable de la web ni a los requerimientos de autoridades que prevea
          la ley.
        </p>
      </LegalSection>

      <LegalSection title="Responsabilidad">
        <p>
          Cada autor responde de lo que publica. CISNE no revisa los contenidos antes de que aparezcan y no se hace
          responsable de ellos, pero actuará en cuanto tenga conocimiento de que algo es ilícito. Tampoco garantizamos
          que el servicio esté siempre disponible.
        </p>
      </LegalSection>

      <LegalSection title="Ley aplicable">
        <p>Estas condiciones se rigen por la ley española.</p>
      </LegalSection>
    </LegalPage>
  )
}
