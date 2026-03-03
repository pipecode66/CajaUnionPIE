import { Link } from 'react-router-dom';
import { Accordion } from '../components/common/Accordion';
import { useCompanies } from '../context/CompaniesContext';

const faqItems = [
  {
    id: 'faq-1',
    title: 'Quien puede participar en el programa?',
    content:
      'Empresas y emprendimientos formalizados que deseen visibilizar su oferta comercial y conectar con nuevas oportunidades.',
  },
  {
    id: 'faq-2',
    title: 'Como se publica una empresa?',
    content:
      'La empresa registra su perfil, adjunta catalogo y entra en estado En revision. Caja Union valida informacion y publica.',
  },
  {
    id: 'faq-3',
    title: 'Tiene costo participar?',
    content:
      'Los costos y condiciones dependen del plan vigente del programa. En este MVP se presenta informacion de referencia.',
  },
];

const steps = [
  {
    title: '1. Registro',
    detail: 'La empresa completa su perfil con servicios, marcas y datos de contacto.',
  },
  {
    title: '2. Curaduria',
    detail: 'Caja Union revisa el contenido para mantener calidad y confianza en el directorio.',
  },
  {
    title: '3. Publicacion',
    detail: 'El perfil se activa con banner, galeria y mini catalogo de productos.',
  },
  {
    title: '4. Conexion',
    detail: 'Clientes y aliados filtran, comparan y contactan empresas en un solo canal.',
  },
];

export function HomePage() {
  const { publishedCompanies } = useCompanies();
  const categories = Array.from(new Set(publishedCompanies.map((company) => company.category))).slice(0, 6);
  const withCatalog = publishedCompanies.filter((company) => company.products.length > 0).length;

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Respaldado por Caja Union</p>
            <h1>Programa de Integracion Empresarial</h1>
            <p>
              Plataforma digital para que mas de 150 empresas publiquen su portafolio, marcas y mini catalogo, y
              generen nuevas relaciones comerciales.
            </p>
            <div className="hero-actions">
              <Link to="/registro" className="primary-link">
                Registrar empresa
              </Link>
              <Link to="/directorio" className="secondary-link">
                Explorar empresas
              </Link>
            </div>
          </div>
          <aside className="hero-panel">
            <h3>Impacto comercial</h3>
            <ul>
              <li>{publishedCompanies.length}+ empresas activas en el directorio</li>
              <li>{withCatalog} perfiles con mini catalogo visible</li>
              <li>Busqueda por ciudad, categoria y tipo de servicio</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container two-col">
          <article>
            <h2>Que es el programa?</h2>
            <p>
              Es una iniciativa digital para dinamizar el tejido empresarial. Cada negocio obtiene un perfil publico con
              banner, servicios, marcas y catalogo para conectar con clientes y aliados.
            </p>
            <div className="chip-row">
              <span className="chip">Visibilidad comercial</span>
              <span className="chip">Respaldo institucional</span>
              <span className="chip">Canales de contacto directos</span>
            </div>
          </article>
          <article className="highlight-card">
            <h3>Beneficios clave</h3>
            <ul>
              <li>Presencia digital estandarizada para cada empresa participante.</li>
              <li>Mini catalogo visual para acelerar decisiones de compra.</li>
              <li>Moderacion y curaduria de contenidos por Caja Union.</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <h2>Como funciona</h2>
          <div className="steps-grid">
            {steps.map((step) => (
              <article key={step.title} className="step-card">
                <h3>{step.title}</h3>
                <p>{step.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Categorias destacadas</h2>
          <div className="chip-row">
            {categories.map((category) => (
              <span key={category} className="chip chip-large">
                {category}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container stats-grid">
          <article>
            <h3>+150</h3>
            <p>Meta de empresas vinculadas en la plataforma.</p>
          </article>
          <article>
            <h3>4.8/5</h3>
            <p>Valoracion de experiencia comercial (placeholder).</p>
          </article>
          <article>
            <h3>98%</h3>
            <p>Perfiles con contacto directo disponible (placeholder).</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>FAQ y requisitos</h2>
          <Accordion items={faqItems} />
        </div>
      </section>

      <section className="section cta-section">
        <div className="container cta-box">
          <div>
            <h2>Activa tu empresa en la red comercial de Caja Union</h2>
            <p>Registra tu perfil y empieza a recibir oportunidades de negocio desde una sola plataforma.</p>
          </div>
          <div className="hero-actions">
            <Link to="/registro" className="primary-link">
              Iniciar registro
            </Link>
            <a className="secondary-link" href="mailto:programa.empresarial@placeholder.co">
              Contacto
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
