import type { Company, CompanyDraftInput, Product } from '../types/company';

export const createSlug = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

export const normalizePhone = (phone?: string): string =>
  (phone ?? '').replace(/\D/g, '');

export const toWhatsappUrl = (phone: string | undefined, message: string): string => {
  const normalized = normalizePhone(phone);

  if (!normalized) {
    return '#';
  }

  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
};

export const currencyCop = (value?: number): string => {
  if (typeof value !== 'number') {
    return 'Precio a convenir';
  }

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatStatusLabel = (status: Company['status']): string => {
  switch (status) {
    case 'draft':
      return 'Borrador';
    case 'review':
      return 'En revision';
    default:
      return 'Publicado';
  }
};

export const buildCompanyFromInput = (
  payload: CompanyDraftInput,
  previous?: Company,
): Company => {
  const timestamp = new Date().toISOString();
  const id = previous?.id ?? `cmp-${crypto.randomUUID()}`;
  const safeSlug = createSlug(payload.name) || id;

  return {
    id,
    slug: previous?.slug ?? safeSlug,
    createdAt: previous?.createdAt ?? timestamp,
    updatedAt: timestamp,
    ...payload,
    products: payload.products.map((product) => ({
      ...product,
      id: product.id || `prd-${crypto.randomUUID()}`,
    })),
  };
};

export const ensureUniqueSlug = (companies: Company[], desiredSlug: string, currentId?: string): string => {
  const base = desiredSlug || 'empresa';
  let counter = 1;
  let candidate = base;

  while (companies.some((company) => company.slug === candidate && company.id !== currentId)) {
    counter += 1;
    candidate = `${base}-${counter}`;
  }

  return candidate;
};

export const buildSearchTokens = (company: Company): string =>
  [
    company.name,
    company.city,
    company.category,
    company.summary,
    company.description,
    company.services.join(' '),
    company.brands.join(' '),
    company.products.map((product) => `${product.name} ${product.shortDesc}`).join(' '),
  ]
    .join(' ')
    .toLowerCase();

export const createBulkDemoCompanies = (source: Company[], targetCount: number): Company[] => {
  if (source.length === 0 || targetCount <= source.length) {
    return source;
  }

  const generated = [...source];
  let index = 1;

  while (generated.length < targetCount) {
    const template = source[index % source.length];
    const suffix = generated.length + 1;
    const timestamp = new Date().toISOString();
    const newId = `cmp-demo-${suffix}`;
    const newSlug = `${template.slug}-demo-${suffix}`;

    generated.push({
      ...template,
      id: newId,
      slug: newSlug,
      name: `${template.name} Sede ${suffix}`,
      city: template.city,
      summary: `${template.summary} (registro demo ${suffix}).`,
      createdAt: timestamp,
      updatedAt: timestamp,
      status: 'published',
      products: template.products.map((product: Product, productIndex) => ({
        ...product,
        id: `${newId}-prd-${productIndex + 1}`,
        name: `${product.name} ${suffix}`,
        sku: product.sku ? `${product.sku}-${suffix}` : undefined,
      })),
    });

    index += 1;
  }

  return generated;
};
