import { useEffect, useMemo, useState } from 'react';
import { CompanyCard } from '../components/company/CompanyCard';
import { Pagination } from '../components/common/Pagination';
import { CompanySkeletonCard } from '../components/common/SkeletonCard';
import { useCompanies } from '../context/CompaniesContext';
import type { Company } from '../types/company';
import { buildSearchTokens } from '../utils/company';

type SortOption = 'relevance' | 'az' | 'recent';

const PAGE_SIZE = 9;

const getRelevance = (company: Company, search: string): number => {
  if (!search.trim()) {
    return 0;
  }

  const query = search.toLowerCase();
  let score = 0;

  if (company.name.toLowerCase().includes(query)) {
    score += 6;
  }

  if (company.summary.toLowerCase().includes(query)) {
    score += 3;
  }

  if (company.services.some((service) => service.toLowerCase().includes(query))) {
    score += 4;
  }

  if (company.products.some((product) => product.name.toLowerCase().includes(query))) {
    score += 2;
  }

  const tokenMatch = buildSearchTokens(company).includes(query);
  if (tokenMatch) {
    score += 1;
  }

  return score;
};

export function DirectoryPage() {
  const { publishedCompanies } = useCompanies();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todas');
  const [city, setCity] = useState('Todas');
  const [serviceType, setServiceType] = useState('Todos');
  const [hasCatalog, setHasCatalog] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    const timer = window.setTimeout(() => setIsLoading(false), 420);
    return () => window.clearTimeout(timer);
  }, [isLoading]);

  const categories = useMemo(
    () => ['Todas', ...Array.from(new Set(publishedCompanies.map((company) => company.category)))],
    [publishedCompanies],
  );

  const cities = useMemo(
    () => ['Todas', ...Array.from(new Set(publishedCompanies.map((company) => company.city)))],
    [publishedCompanies],
  );

  const serviceTypes = useMemo(
    () => ['Todos', ...Array.from(new Set(publishedCompanies.map((company) => company.serviceType)))],
    [publishedCompanies],
  );

  const filteredCompanies = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = publishedCompanies.filter((company) => {
      const categoryMatch = category === 'Todas' || company.category === category;
      const cityMatch = city === 'Todas' || company.city === city;
      const serviceMatch = serviceType === 'Todos' || company.serviceType === serviceType;
      const catalogMatch = !hasCatalog || company.products.length > 0;
      const textMatch = !query || buildSearchTokens(company).includes(query);

      return categoryMatch && cityMatch && serviceMatch && catalogMatch && textMatch;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'az') {
        return a.name.localeCompare(b.name);
      }

      if (sortBy === 'recent') {
        return Number(new Date(b.updatedAt)) - Number(new Date(a.updatedAt));
      }

      const scoreA = getRelevance(a, query);
      const scoreB = getRelevance(b, query);
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }

      return Number(new Date(b.updatedAt)) - Number(new Date(a.updatedAt));
    });
  }, [publishedCompanies, search, category, city, serviceType, hasCatalog, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleCompanies = filteredCompanies.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <section className="section">
      <div className="container">
        <header className="section-header">
          <h1>Directorio de Empresas</h1>
          <p>Encuentra proveedores por nombre, servicio, categoria, ciudad y tipo de atencion.</p>
        </header>

        <div className="filters-grid" role="search">
          <label>
            Buscar
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
                setIsLoading(true);
              }}
              placeholder="Nombre de empresa o servicio"
            />
          </label>

          <label>
            Categoria
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setPage(1);
                setIsLoading(true);
              }}
            >
              {categories.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            Ciudad
            <select
              value={city}
              onChange={(event) => {
                setCity(event.target.value);
                setPage(1);
                setIsLoading(true);
              }}
            >
              {cities.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            Tipo de servicio
            <select
              value={serviceType}
              onChange={(event) => {
                setServiceType(event.target.value);
                setPage(1);
                setIsLoading(true);
              }}
            >
              {serviceTypes.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            Orden
            <select
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value as SortOption);
                setPage(1);
                setIsLoading(true);
              }}
            >
              <option value="relevance">Relevancia</option>
              <option value="az">A-Z</option>
              <option value="recent">Mas recientes</option>
            </select>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={hasCatalog}
              onChange={(event) => {
                setHasCatalog(event.target.checked);
                setPage(1);
                setIsLoading(true);
              }}
            />
            Tiene catalogo
          </label>
        </div>

        <p className="results-line">{filteredCompanies.length} empresas encontradas</p>

        {isLoading ? (
          <div className="cards-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <CompanySkeletonCard key={`skeleton-${index}`} />
            ))}
          </div>
        ) : visibleCompanies.length > 0 ? (
          <div className="cards-grid">
            {visibleCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No hay resultados con esos filtros</h3>
            <p>Ajusta criterios o elimina filtros para ampliar la busqueda.</p>
          </div>
        )}

        <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
      </div>
    </section>
  );
}
