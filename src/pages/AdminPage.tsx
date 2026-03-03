import { useMemo, useState, type ChangeEvent } from 'react';
import Papa from 'papaparse';
import { Link } from 'react-router-dom';
import { useCompanies } from '../context/CompaniesContext';
import type { Company, ModerationStatus, Product } from '../types/company';
import { createSlug, formatStatusLabel } from '../utils/company';

const parseList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/[|,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const parseStatus = (value: unknown): ModerationStatus => {
  if (value === 'draft' || value === 'review' || value === 'published') {
    return value;
  }

  return 'review';
};

const parsePrice = (value: unknown): number | undefined => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === 'string') {
    const sanitized = value.replace(/[^\d.]/g, '');
    if (!sanitized) {
      return undefined;
    }

    const parsed = Number(sanitized);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
};

const normalizeProduct = (item: unknown, index: number): Product => {
  const product = typeof item === 'object' && item ? (item as Record<string, unknown>) : {};
  const fallbackName = `Producto ${index + 1}`;

  return {
    id: String(product.id ?? `prd-${crypto.randomUUID()}`),
    name: String(product.name ?? fallbackName),
    imageUrl: String(product.imageUrl ?? `https://picsum.photos/seed/import-product-${index + 1}/800/600`),
    shortDesc: String(product.shortDesc ?? 'Producto importado de forma masiva.'),
    price: parsePrice(product.price),
    sku: product.sku ? String(product.sku) : undefined,
    tags: parseList(product.tags),
  };
};

const normalizeUnknownCompany = (raw: unknown, index: number): Company => {
  const source = typeof raw === 'object' && raw ? (raw as Record<string, unknown>) : {};
  const name = String(source.name ?? `Empresa Importada ${index + 1}`);
  const slug = createSlug(String(source.slug ?? name)) || `empresa-importada-${index + 1}`;

  let products: Product[] = [];

  if (Array.isArray(source.products)) {
    products = source.products.map(normalizeProduct);
  } else {
    const simpleProductName = source.product_name ? String(source.product_name) : undefined;
    if (simpleProductName) {
      products = [
        {
          id: `prd-${crypto.randomUUID()}`,
          name: simpleProductName,
          imageUrl: String(source.product_image ?? `https://picsum.photos/seed/import-${index + 1}/800/600`),
          shortDesc: String(source.product_desc ?? 'Producto cargado por importacion CSV.'),
          price: parsePrice(source.product_price),
          sku: source.product_sku ? String(source.product_sku) : undefined,
          tags: parseList(source.product_tags),
        },
      ];
    }
  }

  if (products.length === 0) {
    products = [
      {
        id: `prd-${crypto.randomUUID()}`,
        name: `Oferta principal ${index + 1}`,
        imageUrl: `https://picsum.photos/seed/import-default-${index + 1}/800/600`,
        shortDesc: 'Producto de referencia para perfil importado.',
        tags: ['Importado'],
      },
    ];
  }

  const timestamp = new Date().toISOString();

  return {
    id: String(source.id ?? `cmp-${crypto.randomUUID()}`),
    name,
    slug,
    city: String(source.city ?? 'Ciudad por definir'),
    category: String(source.category ?? 'Servicios'),
    serviceType: String(source.serviceType ?? source.service_type ?? 'B2B'),
    summary: String(source.summary ?? 'Perfil importado en lote para dinamizacion comercial.'),
    description: String(
      source.description ?? 'Empresa cargada mediante utilitario de importacion masiva de Caja Union.',
    ),
    services: parseList(source.services),
    brands: parseList(source.brands),
    logoUrl: String(source.logoUrl ?? source.logo_url ?? `https://picsum.photos/seed/import-logo-${index + 1}/320/320`),
    bannerUrl: String(
      source.bannerUrl ?? source.banner_url ?? `https://picsum.photos/seed/import-banner-${index + 1}/1400/480`,
    ),
    galleryUrls: parseList(source.galleryUrls ?? source.gallery_urls),
    whatsapp: source.whatsapp ? String(source.whatsapp) : undefined,
    phone: source.phone ? String(source.phone) : undefined,
    address: source.address ? String(source.address) : undefined,
    website: source.website ? String(source.website) : undefined,
    schedule: source.schedule ? String(source.schedule) : undefined,
    status: parseStatus(source.status),
    createdAt: source.createdAt ? String(source.createdAt) : timestamp,
    updatedAt: timestamp,
    products,
  };
};

export function AdminPage() {
  const { companies, updateStatus, patchCompany, importCompanies, generateMassiveDemo, resetToSeed } = useCompanies();
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const stats = useMemo(() => {
    const published = companies.filter((company) => company.status === 'published').length;
    const review = companies.filter((company) => company.status === 'review').length;
    const draft = companies.filter((company) => company.status === 'draft').length;
    return { published, review, draft };
  }, [companies]);

  const importFromFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setNotice('');
    setError('');

    try {
      const text = await file.text();
      let normalized: Company[] = [];

      if (file.name.toLowerCase().endsWith('.json')) {
        const parsed = JSON.parse(text) as unknown;
        if (!Array.isArray(parsed)) {
          throw new Error('El JSON debe contener un arreglo de empresas.');
        }

        normalized = parsed.map(normalizeUnknownCompany);
      } else if (file.name.toLowerCase().endsWith('.csv')) {
        const result = Papa.parse<Record<string, string>>(text, {
          header: true,
          skipEmptyLines: true,
        });

        if (result.errors.length > 0) {
          throw new Error(`Error CSV: ${result.errors[0].message}`);
        }

        normalized = result.data.map(normalizeUnknownCompany);
      } else {
        throw new Error('Formato no soportado. Usa JSON o CSV.');
      }

      importCompanies(normalized);
      setNotice(`Importacion exitosa: ${normalized.length} empresas procesadas.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No fue posible procesar el archivo.');
    } finally {
      event.target.value = '';
    }
  };

  return (
    <section className="section">
      <div className="container admin-layout">
        <header className="section-header">
          <h1>Admin Caja Union</h1>
          <p>Moderacion de estado, edicion rapida e importacion masiva para escalar el directorio empresarial.</p>
        </header>

        <div className="stats-grid compact">
          <article>
            <h3>{companies.length}</h3>
            <p>Total empresas</p>
          </article>
          <article>
            <h3>{stats.published}</h3>
            <p>Publicadas</p>
          </article>
          <article>
            <h3>{stats.review}</h3>
            <p>En revision</p>
          </article>
          <article>
            <h3>{stats.draft}</h3>
            <p>Borrador</p>
          </article>
        </div>

        <section className="admin-tools">
          <h2>Importacion masiva</h2>
          <p>Adjunta un archivo `.json` o `.csv` para registrar lotes de empresas y sus datos base.</p>
          <input type="file" accept=".json,.csv" onChange={importFromFile} />
          <div className="chip-row">
            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                generateMassiveDemo(150);
                setNotice('Dataset demo ampliado a 150 empresas.');
                setError('');
              }}
            >
              Generar demo +150 empresas
            </button>
            <button
              type="button"
              className="ghost-btn"
              onClick={() => {
                if (window.confirm('Se restaurara el dataset inicial. Deseas continuar?')) {
                  resetToSeed();
                  setNotice('Se restablecio el seed inicial.');
                  setError('');
                }
              }}
            >
              Restaurar seed inicial
            </button>
          </div>
          {notice && <p className="form-success">{notice}</p>}
          {error && <p className="form-error-inline">{error}</p>}
        </section>

        <section>
          <h2>Moderacion de perfiles</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Categoria</th>
                  <th>Ciudad</th>
                  <th>Estado</th>
                  <th>Resumen</th>
                  <th>Perfil</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id}>
                    <td>
                      <strong>{company.name}</strong>
                      <div className="muted-text small">{company.serviceType}</div>
                    </td>
                    <td>{company.category}</td>
                    <td>{company.city}</td>
                    <td>
                      <label className="sr-only" htmlFor={`status-${company.id}`}>
                        Estado {company.name}
                      </label>
                      <select
                        id={`status-${company.id}`}
                        value={company.status}
                        onChange={(event) => updateStatus(company.id, event.target.value as ModerationStatus)}
                      >
                        <option value="draft">Borrador</option>
                        <option value="review">En revision</option>
                        <option value="published">Publicado</option>
                      </select>
                      <div className="muted-text small">{formatStatusLabel(company.status)}</div>
                    </td>
                    <td>
                      <label className="sr-only" htmlFor={`summary-${company.id}`}>
                        Resumen {company.name}
                      </label>
                      <input
                        id={`summary-${company.id}`}
                        defaultValue={company.summary}
                        onBlur={(event) => patchCompany(company.id, { summary: event.target.value })}
                      />
                    </td>
                    <td>
                      <Link to={`/empresa/${company.slug}`} className="inline-link">
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  );
}
