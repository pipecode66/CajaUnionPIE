export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-shell">
        <a href="/" className="brand-link" aria-label="Inicio Caja Union PIE">
          <img src="/brand/logo-cajaunion.png" alt="Caja Union" className="brand-logo" loading="eager" />
        </a>
        <div className="header-copy">
          <strong>Programa de Integracion Empresarial</strong>
          <small>Plataforma Digital de Conexion y Dinamizacion Comercial</small>
        </div>
      </div>
    </header>
  );
}
