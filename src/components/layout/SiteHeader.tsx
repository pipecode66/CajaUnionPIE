import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/directorio', label: 'Directorio' },
  { to: '/registro', label: 'Registro' },
  { to: '/admin', label: 'Admin' },
];

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container nav-shell">
        <Link to="/" className="brand-link" onClick={() => setIsOpen(false)}>
          <img
            src="/brand/logo-cajaunion.png"
            alt="Caja Union"
            className="brand-logo"
            loading="eager"
          />
          <div>
            <strong>Programa de Integracion Empresarial</strong>
            <small>Plataforma Digital de Conexion y Dinamizacion Comercial</small>
          </div>
        </Link>

        <button
          type="button"
          className="menu-toggle"
          onClick={() => setIsOpen((state) => !state)}
          aria-expanded={isOpen}
          aria-controls="main-menu"
        >
          Menu
        </button>

        <nav id="main-menu" className={`main-nav ${isOpen ? 'open' : ''}`}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
