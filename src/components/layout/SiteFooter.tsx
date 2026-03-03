import { Link } from 'react-router-dom';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <img src="/brand/logo-cajaunion.png" alt="Caja Union" className="footer-logo" />
          <p>
            Plataforma del Programa de Integracion Empresarial respaldada por Caja Union para dinamizar la
            conexion comercial entre empresas afiliadas.
          </p>
        </div>

        <div>
          <h4>Contacto</h4>
          <ul>
            <li>Linea institucional: +57 600 000 0000</li>
            <li>Correo: programa.empresarial@placeholder.co</li>
            <li>Horario: Lunes a Viernes, 8:00 a.m. - 5:00 p.m.</li>
          </ul>
        </div>

        <div>
          <h4>Legales</h4>
          <ul>
            <li>
              <Link to="/">Terminos y condiciones</Link>
            </li>
            <li>
              <Link to="/">Politica de privacidad</Link>
            </li>
            <li>
              <Link to="/">Tratamiento de datos</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-copy">Caja Union - Programa de Integracion Empresarial - 2026</div>
    </footer>
  );
}
