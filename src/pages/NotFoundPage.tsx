import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="section">
      <div className="container empty-state">
        <h1>404 - Pagina no encontrada</h1>
        <p>La ruta solicitada no existe en la plataforma.</p>
        <Link to="/" className="primary-link">
          Ir al inicio
        </Link>
      </div>
    </section>
  );
}
