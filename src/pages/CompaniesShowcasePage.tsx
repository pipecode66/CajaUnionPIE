import { useMemo, useState, type FormEventHandler } from 'react';
import { ProductCard } from '../components/company/ProductCard';
import { ProductModal } from '../components/company/ProductModal';
import { useCompanies } from '../context/CompaniesContext';
import type { Company, Product } from '../types/company';
import { buildSearchTokens, toWhatsappUrl } from '../utils/company';

interface CompanyReview {
  id: string;
  companyId: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

type ReviewMap = Record<string, CompanyReview[]>;

const PAGE_SIZE = 3;
const REVIEWS_STORAGE_KEY = 'cajaunion-pie-company-reviews-v1';
const DEFAULT_MAP_ADDRESS = 'Carrera 7 #32-16, Bogota';

const programBannerUrl =
  'https://image.pollinations.ai/prompt/' +
  encodeURIComponent(
    'institucional comercial networking empresarial caja union feria empresarial moderna con empresas y stands',
  ) +
  '?model=flux&seed=12062026&width=1800&height=420&nologo=true';

const featuredSlots = [
  {
    id: 'feature-aurora',
    companyId: 'cmp-aurora',
    title: 'Alimentos saludables para oficinas',
    imageUrl:
      'https://image.pollinations.ai/prompt/' +
      encodeURIComponent('panaderia saludable empresarial productos frescos exhibicion comercial') +
      '?model=flux&seed=3001&width=900&height=360&nologo=true',
  },
  {
    id: 'feature-tecno',
    companyId: 'cmp-tecnoplus',
    title: 'Tecnologia y accesorios con alta rotacion',
    imageUrl:
      'https://image.pollinations.ai/prompt/' +
      encodeURIComponent('vitrina de accesorios tecnologicos smartphones cargadores audifonos tienda moderna') +
      '?model=flux&seed=3002&width=900&height=360&nologo=true',
  },
  {
    id: 'feature-moda',
    companyId: 'cmp-moda57',
    title: 'Moda corporativa y urbana personalizada',
    imageUrl:
      'https://image.pollinations.ai/prompt/' +
      encodeURIComponent('coleccion de ropa urbana y uniformes corporativos en showroom') +
      '?model=flux&seed=3003&width=900&height=360&nologo=true',
  },
];

const clampRating = (rating: number): number => Math.min(5, Math.max(1, rating));

const formatReviewDate = (isoDate: string): string =>
  new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoDate));

const toStars = (rating: number): string => {
  const safeRating = clampRating(Math.round(rating));
  return `${'★'.repeat(safeRating)}${'☆'.repeat(5 - safeRating)}`;
};

const loadReviews = (): ReviewMap => {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    const entries = Object.entries(parsed as Record<string, unknown>).map(([companyId, reviews]) => {
      if (!Array.isArray(reviews)) {
        return [companyId, []] as const;
      }

      const sanitized = reviews
        .filter((item) => typeof item === 'object' && item !== null)
        .map((item) => {
          const review = item as Partial<CompanyReview>;

          return {
            id: String(review.id ?? `review-${crypto.randomUUID()}`),
            companyId,
            author: String(review.author ?? 'Usuario'),
            rating: clampRating(Number(review.rating ?? 5)),
            comment: String(review.comment ?? ''),
            createdAt: String(review.createdAt ?? new Date().toISOString()),
          };
        })
        .filter((review) => review.comment.trim().length > 0);

      return [companyId, sanitized] as const;
    });

    return Object.fromEntries(entries);
  } catch {
    return {};
  }
};

const persistReviews = (reviewsByCompany: ReviewMap): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviewsByCompany));
};

export function CompaniesShowcasePage() {
  const { publishedCompanies } = useCompanies();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todas');
  const [city, setCity] = useState('Todas');
  const [page, setPage] = useState(1);
  const [selectedCompanyId, setSelectedCompanyId] = useState(publishedCompanies[0]?.id ?? '');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [reviewsByCompany, setReviewsByCompany] = useState<ReviewMap>(() => loadReviews());
  const [reviewForm, setReviewForm] = useState({
    author: '',
    rating: 5,
    comment: '',
  });
  const [reviewError, setReviewError] = useState('');

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

  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedCompanies = filteredCompanies.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const selectedCompany = useMemo<Company | undefined>(() => {
    const selected = filteredCompanies.find((company) => company.id === selectedCompanyId);
    if (selected) {
      return selected;
    }

    return filteredCompanies[0] ?? publishedCompanies[0];
  }, [filteredCompanies, selectedCompanyId, publishedCompanies]);

  const selectedCompanyReviews = selectedCompany ? reviewsByCompany[selectedCompany.id] ?? [] : [];
  const averageRating =
    selectedCompanyReviews.length > 0
      ? selectedCompanyReviews.reduce((sum, review) => sum + review.rating, 0) / selectedCompanyReviews.length
      : null;

  const featuredCompanies = featuredSlots
    .map((slot) => {
      const company = publishedCompanies.find((item) => item.id === slot.companyId);
      if (!company) {
        return null;
      }

      return {
        ...slot,
        company,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const selectCompany = (companyId: string, moveToDetails = false) => {
    setSelectedCompanyId(companyId);
    setActiveProduct(null);
    setReviewError('');

    if (moveToDetails) {
      window.setTimeout(() => {
        document.getElementById('detalle-empresa')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    }
  };

  const submitReview: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    if (!selectedCompany) {
      return;
    }

    const author = reviewForm.author.trim();
    const comment = reviewForm.comment.trim();
    const rating = clampRating(reviewForm.rating);

    if (author.length < 2) {
      setReviewError('Ingresa tu nombre para registrar el comentario.');
      return;
    }

    if (comment.length < 6) {
      setReviewError('Escribe un comentario de al menos 6 caracteres.');
      return;
    }

    const newReview: CompanyReview = {
      id: `review-${crypto.randomUUID()}`,
      companyId: selectedCompany.id,
      author,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };

    setReviewsByCompany((current) => {
      const next = {
        ...current,
        [selectedCompany.id]: [newReview, ...(current[selectedCompany.id] ?? [])],
      };
      persistReviews(next);
      return next;
    });

    setReviewForm({ author: '', rating: 5, comment: '' });
    setReviewError('');
  };

  return (
    <section className="section showcase-page">
      <div className="container">
        <header className="program-banner">
          <img src={programBannerUrl} alt="Banner general del programa empresarial" className="program-banner-image" />
        </header>

        <header className="showcase-hero">
          <div>
            <p className="eyebrow">Respaldado por Caja Union</p>
            <h1>Directorio Empresarial Integrado</h1>
            <p>
              Explora empresas por categoria y ciudad. Cada card abre su detalle comercial con productos,
              descripcion, servicios y botones directos de contacto.
            </p>
          </div>
          <div className="showcase-stats">
            <article>
              <strong>{publishedCompanies.length}</strong>
              <span>Empresas publicadas</span>
            </article>
            <article>
              <strong>{publishedCompanies.reduce((sum, company) => sum + company.products.length, 0)}</strong>
              <span>Productos exhibidos</span>
            </article>
          </div>
        </header>

        <section className="filters-bar" aria-label="Filtros de empresas">
          <label className="filter-field wide">
            Buscar empresa o producto
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Ej: odontologia, panaderia, accesorios..."
            />
          </label>

          <label className="filter-field">
            Categoria
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setPage(1);
              }}
            >
              {categories.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            Ciudad
            <select
              value={city}
              onChange={(event) => {
                setCity(event.target.value);
                setPage(1);
              }}
            >
              {cities.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <p className="results-pill">{filteredCompanies.length} empresas visibles</p>
        </section>

        <section className="featured-section" aria-label="Empresas destacadas">
          <div className="section-title-row">
            <h2>Empresas destacadas</h2>
            <p>Agrega o reemplaza estas imagenes destacadas en `featuredSlots` para linkearlas a otra empresa.</p>
          </div>
          <div className="featured-grid">
            {featuredCompanies.map((item) => (
              <button
                key={item.id}
                type="button"
                className="featured-card"
                onClick={() => selectCompany(item.company.id, true)}
              >
                <img src={item.imageUrl} alt={item.title} />
                <div className="featured-overlay">
                  <strong>{item.company.name}</strong>
                  <span>{item.title}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="directory-section" aria-label="Listado de empresas">
          <div className="section-title-row">
            <h2>Empresas</h2>
            <p>Tarjetas clickeables, mostradas en bloques de 3 por pagina.</p>
          </div>

          {pagedCompanies.length === 0 && (
            <article className="list-empty">
              <h3>Sin resultados</h3>
              <p>Prueba otros filtros para volver a cargar empresas en el directorio.</p>
            </article>
          )}

          <div className="directory-grid">
            {pagedCompanies.map((company) => {
              const isActive = selectedCompany?.id === company.id;

              return (
                <button
                  type="button"
                  key={company.id}
                  className={`directory-card ${isActive ? 'active' : ''}`}
                  onClick={() => selectCompany(company.id, true)}
                >
                  <img src={company.bannerUrl} alt={`Banner ${company.name}`} className="directory-card-banner" />
                  <div className="directory-card-body">
                    <div className="directory-card-head">
                      <img src={company.logoUrl} alt={`${company.name} logo`} className="directory-card-logo" />
                      <div>
                        <h3>{company.name}</h3>
                        <p>
                          {company.category} - {company.city}
                        </p>
                      </div>
                    </div>
                    <p>{company.summary}</p>
                    <div className="chip-row">
                      {company.services.slice(0, 2).map((service) => (
                        <span className="chip" key={`${company.id}-${service}`}>
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <nav className="directory-pagination" aria-label="Paginacion empresas">
            <button type="button" onClick={() => setPage(safePage - 1)} disabled={safePage <= 1}>
              Anterior
            </button>
            <span>
              Pagina {safePage} de {totalPages}
            </span>
            <button type="button" onClick={() => setPage(safePage + 1)} disabled={safePage >= totalPages}>
              Siguiente
            </button>
          </nav>
        </section>

        <section id="detalle-empresa" className="company-detail-panel" aria-label="Detalle de empresa">
          {!selectedCompany && (
            <article className="list-empty">
              <h3>No hay empresa seleccionada</h3>
            </article>
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
                    <p className="detail-summary">Servicio general: {selectedCompany.summary}</p>
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

                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(selectedCompany.address ?? DEFAULT_MAP_ADDRESS)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="secondary-link"
                  >
                    Google Maps
                  </a>

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

              <section className="map-section">
                <h3>Ubicacion</h3>
                <p>{selectedCompany.address ?? DEFAULT_MAP_ADDRESS}</p>
                <iframe
                  className="map-frame"
                  title={`Mapa ${selectedCompany.name}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(selectedCompany.address ?? DEFAULT_MAP_ADDRESS)}&output=embed`}
                />
              </section>

              <section className="menu-section">
                <div className="section-title-row">
                  <h3>Productos y servicios que ofrece</h3>
                  <p>Visualiza una muestra del portafolio sin mostrar precios.</p>
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

              <section className="reviews-section">
                <div className="section-title-row">
                  <h3>Comentarios y valoraciones</h3>
                  <p>
                    {averageRating
                      ? `${averageRating.toFixed(1)} / 5 (${selectedCompanyReviews.length} valoraciones)`
                      : 'Aun no hay valoraciones para esta empresa.'}
                  </p>
                </div>

                <form className="review-form" onSubmit={submitReview}>
                  <label>
                    Nombre
                    <input
                      type="text"
                      value={reviewForm.author}
                      onChange={(event) => setReviewForm((current) => ({ ...current, author: event.target.value }))}
                      placeholder="Tu nombre"
                    />
                  </label>

                  <label>
                    Valoracion
                    <select
                      value={reviewForm.rating}
                      onChange={(event) =>
                        setReviewForm((current) => ({
                          ...current,
                          rating: clampRating(Number(event.target.value)),
                        }))
                      }
                    >
                      <option value={5}>5 - Excelente</option>
                      <option value={4}>4 - Muy buena</option>
                      <option value={3}>3 - Buena</option>
                      <option value={2}>2 - Regular</option>
                      <option value={1}>1 - Baja</option>
                    </select>
                  </label>

                  <label className="review-form-comment">
                    Comentario
                    <textarea
                      rows={3}
                      value={reviewForm.comment}
                      onChange={(event) => setReviewForm((current) => ({ ...current, comment: event.target.value }))}
                      placeholder="Comparte tu experiencia con esta empresa"
                    />
                  </label>

                  {reviewError && (
                    <p className="review-error" role="alert" aria-live="polite">
                      {reviewError}
                    </p>
                  )}

                  <button type="submit" className="primary-link">
                    Enviar comentario
                  </button>
                </form>

                <div className="reviews-list">
                  {selectedCompanyReviews.length === 0 && <p className="muted-text">Todavia no hay comentarios registrados.</p>}

                  {selectedCompanyReviews.map((review) => (
                    <article key={review.id} className="review-card">
                      <div className="review-head">
                        <strong>{review.author}</strong>
                        <span>{formatReviewDate(review.createdAt)}</span>
                      </div>
                      <p className="review-stars" aria-label={`Valoracion ${review.rating} de 5`}>
                        {toStars(review.rating)}
                      </p>
                      <p>{review.comment}</p>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}
        </section>
      </div>

      {selectedCompany && <ProductModal company={selectedCompany} product={activeProduct} onClose={() => setActiveProduct(null)} />}
    </section>
  );
}

