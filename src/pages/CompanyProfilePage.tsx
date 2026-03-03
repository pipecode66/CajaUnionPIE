import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ProductCard } from '../components/company/ProductCard';
import { ProductModal } from '../components/company/ProductModal';
import { ProductSkeletonCard } from '../components/common/SkeletonCard';
import { useCompanies } from '../context/CompaniesContext';
import type { Product } from '../types/company';
import { formatStatusLabel, toWhatsappUrl } from '../utils/company';

type ProfileTab = 'catalogo' | 'galeria' | 'info';

export function CompanyProfilePage() {
  const { slug } = useParams();
  const { companies } = useCompanies();
  const [tab, setTab] = useState<ProfileTab>('catalogo');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 420);
    return () => window.clearTimeout(timer);
  }, [slug]);

  const company = useMemo(() => companies.find((item) => item.slug === slug), [companies, slug]);

  if (isLoading) {
    return (
      <section className="section">
        <div className="container">
          <div className="profile-skeleton" />
          <div className="products-grid">
            {Array.from({ length: 3 }).map((_, index) => (
              <ProductSkeletonCard key={`profile-skeleton-${index}`} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!company) {
    return (
      <section className="section">
        <div className="container empty-state">
          <h1>Empresa no encontrada</h1>
          <p>El perfil solicitado no existe o fue removido.</p>
          <Link to="/directorio" className="primary-link">
            Volver al directorio
          </Link>
        </div>
      </section>
    );
  }

  const whatsappMessage = `Hola, quiero informacion sobre ${company.name}.`;

  return (
    <section className="section">
      <div className="container">
        <article className="profile-head">
          <img src={company.bannerUrl} alt={`Banner ${company.name}`} className="profile-banner" />
          <div className="profile-main">
            <img src={company.logoUrl} alt={`${company.name} logo`} className="profile-logo" />
            <div>
              <p className="eyebrow">Respaldado por Caja Union</p>
              <h1>{company.name}</h1>
              <p>{company.description}</p>
              <div className="chip-row">
                <span className="chip">{company.category}</span>
                <span className="chip">{company.city}</span>
                <span className="chip">{company.serviceType}</span>
                <span className="chip">{formatStatusLabel(company.status)}</span>
              </div>
              <div className="chip-row">
                {company.services.map((service) => (
                  <span key={service} className="chip chip-soft">
                    {service}
                  </span>
                ))}
              </div>
              <div className="chip-row">
                {company.brands.map((brand) => (
                  <span key={brand} className="chip chip-soft">
                    Marca: {brand}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="profile-contact-grid">
            {company.whatsapp && (
              <a href={toWhatsappUrl(company.whatsapp, whatsappMessage)} className="primary-link" target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            )}
            {company.phone && (
              <a href={`tel:${company.phone.replace(/\s/g, '')}`} className="secondary-link">
                Llamar
              </a>
            )}
            {company.website && (
              <a href={company.website} target="_blank" rel="noreferrer" className="secondary-link">
                Sitio web
              </a>
            )}
            {company.address && (
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(company.address)}`}
                target="_blank"
                rel="noreferrer"
                className="secondary-link"
              >
                Ubicacion
              </a>
            )}
          </div>
        </article>

        <div className="tabs-row" role="tablist" aria-label="Secciones de la empresa">
          <button
            type="button"
            role="tab"
            className={tab === 'catalogo' ? 'active' : ''}
            onClick={() => setTab('catalogo')}
            aria-selected={tab === 'catalogo'}
          >
            Mini Catalogo
          </button>
          <button
            type="button"
            role="tab"
            className={tab === 'galeria' ? 'active' : ''}
            onClick={() => setTab('galeria')}
            aria-selected={tab === 'galeria'}
          >
            Galeria
          </button>
          <button
            type="button"
            role="tab"
            className={tab === 'info' ? 'active' : ''}
            onClick={() => setTab('info')}
            aria-selected={tab === 'info'}
          >
            Informacion
          </button>
        </div>

        {tab === 'catalogo' && (
          <section>
            <h2>Mini Catalogo</h2>
            <div className="products-grid">
              {company.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  companyName={company.name}
                  companyWhatsapp={company.whatsapp}
                  onView={setSelectedProduct}
                />
              ))}
            </div>
          </section>
        )}

        {tab === 'galeria' && (
          <section>
            <h2>Galeria de fotos</h2>
            <div className="gallery-grid">
              {company.galleryUrls.length > 0 ? (
                company.galleryUrls.map((image) => <img key={image} src={image} alt={`${company.name} galeria`} />)
              ) : (
                <p>La empresa aun no tiene fotos cargadas.</p>
              )}
            </div>
          </section>
        )}

        {tab === 'info' && (
          <section className="info-grid">
            <article className="info-card">
              <h3>Datos de contacto</h3>
              <ul>
                <li>Ciudad: {company.city}</li>
                <li>Direccion: {company.address ?? 'No registrada'}</li>
                <li>Telefono: {company.phone ?? 'No registrado'}</li>
                <li>Horario: {company.schedule ?? 'Por definir'}</li>
              </ul>
            </article>
            <article className="info-card">
              <h3>Servicios y marcas</h3>
              <p>{company.services.join(', ')}</p>
              <p className="muted-text">Marcas: {company.brands.join(', ') || 'No registradas'}</p>
            </article>
          </section>
        )}

        <ProductModal company={company} product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      </div>
    </section>
  );
}
