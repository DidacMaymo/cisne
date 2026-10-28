import { Link } from 'react-router-dom'
import { ContactLink, LegalPage, LegalSection } from '../components/LegalPage'

export function PrivacyPolicy() {
  return (
    <LegalPage title="Política de privacidad">
      <LegalSection title="Responsable">
        <p>
          El responsable del tratamiento de tus datos es CISNE. Puedes escribirnos a <ContactLink />.
        </p>
      </LegalSection>

      <LegalSection title="Qué datos tratamos">
        <p>Solo los que necesitas para usar CISNE:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>De tu cuenta: correo electrónico y contraseña (esta se guarda cifrada).</li>
          <li>De tu perfil: nombre visible, pseudónimos, biografía y enlaces.</li>
          <li>De tu actividad: poemas, colecciones, guardados, apoyos, comentarios y denuncias.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Para qué y con qué base legal">
        <p>
          Para prestarte el servicio que pides al crear una cuenta (ejecución del servicio). También por interés
          legítimo, para mantener la seguridad y atender las denuncias. No vendemos tus datos ni tomamos decisiones
          automatizadas sobre ti.
        </p>
      </LegalSection>

      <LegalSection title="Quién más accede a los datos">
        <p>Para funcionar usamos dos proveedores, que tratan datos por nuestra cuenta:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>Supabase: base de datos y cuentas.</li>
          <li>Cloudflare: alojamiento de la web.</li>
        </ul>
        <p>
          Pueden estar fuera del Espacio Económico Europeo. En ese caso, las transferencias se amparan en cláusulas
          contractuales tipo o en el Marco de Privacidad UE-EE. UU.
        </p>
      </LegalSection>

      <LegalSection title="Cuánto tiempo los conservamos">
        <p>
          Mientras tu cuenta exista. Si la borras desde{' '}
          <Link to="/ajustes/cuenta" className="underline underline-offset-4">
            Ajustes → Cuenta
          </Link>
          , se elimina lo asociado: perfil, poemas, colecciones, guardados, apoyos y comentarios, así como las denuncias que
          otras personas hicieran sobre tus poemas. Las denuncias que tú hayas enviado se conservan, pero sin vincularse
          a tu cuenta.
        </p>
      </LegalSection>

      <LegalSection title="Tus derechos">
        <p>
          Puedes pedir acceso, rectificación, supresión, oposición, portabilidad y limitación del tratamiento
          escribiendo a <ContactLink />. Si crees que no hemos respondido bien, puedes reclamar ante la Agencia Española
          de Protección de Datos (AEPD, aepd.es).
        </p>
      </LegalSection>
    </LegalPage>
  )
}
