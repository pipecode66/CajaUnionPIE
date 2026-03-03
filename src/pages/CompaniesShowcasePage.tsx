import { useMemo, useState } from 'react';
import { ProductCard } from '../components/company/ProductCard';
import { ProductModal } from '../components/company/ProductModal';
import { useCompanies } from '../context/CompaniesContext';
import type { Company, Product } from '../types/company';
import { buildSearchTokens, toWhatsappUrl } from '../utils/company';

export function CompaniesShowcasePage() {
  const { publishedCompanies } = useCompanies();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todas');
  const [city, setCity] = useState('Todas');
  const [selectedCompanyId, setSelectedCompanyId] = useState(publishedCompanies[0]?.id ?? '');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  const categories = useMemo(
    () => ['Todas', ...Array.from(new Set(publishedCompanies.map((company) => company.category)))],
    [publishedCompanies],
  );

  const cities = useMemo(
    () => ['Todas', ...Array.from(new Set(publishedCompanies.map((company) => company.city)))],
    [publishedCompanies],
  );

  const filteredCompanies = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return publishedCompanies
      .filter((company) => {
        const categoryMatch = category === 'Todas' || company.category === category;
        const cityMatch = city === 'Todas' || company.city === city;
        const textMatch = !normalized || buildSearchTokens(company).includes(normalized);
        return categoryMatch && cityMatch && textMatch;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [publishedCompanies, query, category, city]);

  const selectedCompany = useMemo<Company | undefined>(() => {
    const selected = filteredCompanies.find((company) => company.id === selectedCompanyId);
    if (selected) {
      return selected;
    }

    return filteredCompanies[0] ?? publishedCompanies[0];
  }, [filteredCompanies, selectedCompanyId, publishedCompanies]);

  return (
    <section className="section showcase-page">
      <div className="container">
        <header className="showcase-hero">
          <div>
            <p className="eyebrow">Respaldado por Caja Union</p>
            <h1>Vitrina Empresarial Caja Union</h1>
            <p>
              Explora empresas, abre su menu comercial y revisa productos con imagenes IA alineadas con cada oferta.
              Todo en una sola pantalla.
            </p>
          </div>
          <div className="showcase-stats">
            <article>
              <strong>{publishedCompanies.length}</strong>
              <span>Empresas publicadas</span>
            </article>
            <article>
              <strong>{publishedCompanies.reduce((sum, company) => sum + company.products.length, 0)}</strong>
              <span>Productos en menu</span>
            </article>
          </div>
        </header>

        <section className="filters-bar" aria-label="Filtros de empresas">
          <label className="filter-field wide">
            Buscar empresa o producto
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ej: panaderia, ortodoncia, cargador..."
            />
          </label>

          <label className="filter-field">
            Categoria
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            Ciudad
            <select value={city} onChange={(event) => setCity(event.target.value)}>
              {cities.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <p className="results-pill">{filteredCompanies.length} empresas visibles</p>
        </section>

        <section className="company-viewport">
          <aside className="company-list-panel" aria-label="Empresas">
            {filteredCompanies.length === 0 && (
              <article className="list-empty">
                <h3>Sin coincidencias</h3>
                <p>Prueba otro filtro para encontrar empresas.</p>
              </article>
            )}

            {filteredCompanies.map((company) => {
              const active = company.id === selectedCompany?.id;

              return (
                <button
                  type="button"
                  key={company.id}
                  className={`company-list-item ${active ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCompanyId(company.id);
                    setActiveProduct(null);
                  }}
                >
                  <img src={company.bannerUrl} alt={`Banner ${company.name}`} className="list-banner" />
                  <div className="list-body">
                    <img src={company.logoUrl} alt={`${company.name} logo`} className="list-logo" />
                    <div>
                      <h3>{company.name}</h3>
                      <p>
                        {company.category} - {company.city}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </aside>

          <article className="company-detail-panel">
            {!selectedCompany && (
              <div className="list-empty">
                <h2>No hay empresa seleccionada</h2>
              </div>
            )}

            {selectedCompany && (
              <>
                <header className="detail-header">
                  <img src={selectedCompany.bannerUrl} alt={`Banner ${selectedCompany.name}`} className="detail-banner" />
                  <div className="detail-main">
                    <img src={selectedCompany.logoUrl} alt={`${selectedCompany.name} logo`} className="detail-logo" />
                    <div>
                      <h2>{selectedCompany.name}</h2>
                      <p>{selectedCompany.description}</p>
                      <div className="chip-row">
                        {selectedCompany.services.map((service) => (
                          <span className="chip" key={service}>
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="detail-actions">
                    {selectedCompany.whatsapp && (
                      <a
                        href={toWhatsappUrl(selectedCompany.whatsapp, `Hola, deseo informacion sobre ${selectedCompany.name}.`)}
                        target="_blank"
                        rel="noreferrer"
                        className="primary-link"
                      >
                        WhatsApp
                      </a>
                    )}
                    {selectedCompany.phone && (
                      <a href={`tel:${selectedCompany.phone.replace(/\s/g, '')}`} className="secondary-link">
                        Llamar
                      </a>
                    )}
                    {selectedCompany.website && (
                      <a href={selectedCompany.website} target="_blank" rel="noreferrer" className="secondary-link">
                        Sitio web
                      </a>
                    )}
                  </div>
                </header>

                <section className="menu-section">
                  <div className="menu-heading">
                    <h3>Menu de productos</h3>
                    <p>Imagenes generadas por IA segun nombre y descripcion de cada producto.</p>
                  </div>
                  <div className="products-grid">
                    {selectedCompany.products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        companyName={selectedCompany.name}
                        companyWhatsapp={selectedCompany.whatsapp}
                        onView={setActiveProduct}
                      />
                    ))}
                  </div>
                </section>

                <section className="gallery-block">
                  <h3>Galeria empresarial</h3>
                  <div className="gallery-grid">
                    {selectedCompany.galleryUrls.map((image, index) => (
                      <img key={`${selectedCompany.id}-gallery-${index + 1}`} src={image} alt={`${selectedCompany.name} galeria ${index + 1}`} />
                    ))}
                  </div>
                </section>
              </>
            )}
          </article>
        </section>
      </div>

      {selectedCompany && <ProductModal company={selectedCompany} product={activeProduct} onClose={() => setActiveProduct(null)} />}
    </section>
  );
}
