import { useMemo, useState } from 'react';
import { useCompanies } from '../context/CompaniesContext';
import type { Company, CompanyDraftInput, Product } from '../types/company';
import { formatStatusLabel } from '../utils/company';
import { fileToDataUrl, validateImageFile } from '../utils/fileValidation';

const createEmptyProduct = (): Product => ({
  id: '',
  name: '',
  imageUrl: '',
  shortDesc: '',
  price: undefined,
  sku: '',
  tags: [],
});

const createEmptyForm = (): CompanyDraftInput => ({
  name: '',
  city: '',
  category: '',
  serviceType: 'B2C',
  summary: '',
  description: '',
  services: [],
  brands: [],
  logoUrl: '',
  bannerUrl: '',
  galleryUrls: [],
  whatsapp: '',
  phone: '',
  address: '',
  website: '',
  schedule: '',
  status: 'draft',
  products: [createEmptyProduct()],
});

const parseCsvTags = (value: string): string[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export function RegisterCompanyPage() {
  const { companies, upsertCompany } = useCompanies();
  const [selectedCompanyId, setSelectedCompanyId] = useState('new');
  const [form, setForm] = useState<CompanyDraftInput>(createEmptyForm());
  const [servicesInput, setServicesInput] = useState('');
  const [brandsInput, setBrandsInput] = useState('');
  const [productTagsInput, setProductTagsInput] = useState<string[]>(['']);
  const [galleryInput, setGalleryInput] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState('');
  const [loadingImageField, setLoadingImageField] = useState<string | null>(null);

  const sortedCompanies = useMemo(
    () => [...companies].sort((a, b) => a.name.localeCompare(b.name)),
    [companies],
  );

  const loadCompany = (company: Company) => {
    setForm({
      name: company.name,
      city: company.city,
      category: company.category,
      serviceType: company.serviceType,
      summary: company.summary,
      description: company.description,
      services: company.services,
      brands: company.brands,
      logoUrl: company.logoUrl,
      bannerUrl: company.bannerUrl,
      galleryUrls: company.galleryUrls,
      whatsapp: company.whatsapp,
      phone: company.phone,
      address: company.address,
      website: company.website,
      schedule: company.schedule,
      status: company.status,
      products: company.products,
    });
    setServicesInput(company.services.join(', '));
    setBrandsInput(company.brands.join(', '));
    setProductTagsInput(company.products.map((product) => product.tags.join(', ')));
    setGalleryInput(company.galleryUrls.join('\n'));
    setNotice(`Editando: ${company.name}`);
    setErrors([]);
  };

  const handleSelectorChange = (value: string) => {
    setSelectedCompanyId(value);
    if (value === 'new') {
      setForm(createEmptyForm());
      setServicesInput('');
      setBrandsInput('');
      setProductTagsInput(['']);
      setGalleryInput('');
      setErrors([]);
      setNotice('Formulario listo para una nueva empresa.');
      return;
    }

    const company = companies.find((item) => item.id === value);
    if (company) {
      loadCompany(company);
    }
  };

  const setField = <K extends keyof CompanyDraftInput>(key: K, value: CompanyDraftInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const setProductField = <K extends keyof Product>(index: number, key: K, value: Product[K]) => {
    setForm((current) => {
      const products = [...current.products];
      products[index] = { ...products[index], [key]: value };
      return { ...current, products };
    });
  };

  const addProduct = () => {
    setForm((current) => ({ ...current, products: [...current.products, createEmptyProduct()] }));
    setProductTagsInput((current) => [...current, '']);
  };

  const removeProduct = (index: number) => {
    setForm((current) => ({
      ...current,
      products: current.products.filter((_, itemIndex) => itemIndex !== index),
    }));
    setProductTagsInput((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const applyImageFile = async (
    file: File,
    onSuccess: (dataUrl: string) => void,
    fieldKey: string,
  ): Promise<void> => {
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setErrors([validation.message ?? 'Archivo invalido.']);
      return;
    }

    try {
      setLoadingImageField(fieldKey);
      const dataUrl = await fileToDataUrl(file);
      onSuccess(dataUrl);
      setErrors([]);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'No fue posible cargar la imagen.']);
    } finally {
      setLoadingImageField(null);
    }
  };

  const validateForm = (payload: CompanyDraftInput): string[] => {
    const localErrors: string[] = [];

    if (!payload.name.trim()) localErrors.push('El nombre de la empresa es obligatorio.');
    if (!payload.category.trim()) localErrors.push('La categoria es obligatoria.');
    if (!payload.city.trim()) localErrors.push('La ciudad es obligatoria.');
    if (!payload.summary.trim()) localErrors.push('El resumen de servicios es obligatorio.');
    if (!payload.description.trim()) localErrors.push('La descripcion completa es obligatoria.');
    if (payload.services.length === 0) localErrors.push('Debes registrar al menos un servicio.');
    if (!payload.logoUrl) localErrors.push('Carga un logo valido para continuar.');
    if (!payload.bannerUrl) localErrors.push('Carga un banner valido para continuar.');

    if (payload.products.length === 0) {
      localErrors.push('Debes agregar al menos un producto al mini catalogo.');
    }

    payload.products.forEach((product, index) => {
      if (!product.name.trim()) localErrors.push(`Producto ${index + 1}: nombre requerido.`);
      if (!product.shortDesc.trim()) localErrors.push(`Producto ${index + 1}: descripcion requerida.`);
      if (!product.imageUrl) localErrors.push(`Producto ${index + 1}: imagen requerida.`);
    });

    return localErrors;
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const payload: CompanyDraftInput = {
      ...form,
      services: parseCsvTags(servicesInput),
      brands: parseCsvTags(brandsInput),
      galleryUrls: galleryInput
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      products: form.products.map((product, index) => ({
        ...product,
        tags: parseCsvTags(productTagsInput[index] ?? ''),
      })),
    };

    const localErrors = validateForm(payload);
    if (localErrors.length > 0) {
      setErrors(localErrors);
      setNotice('');
      return;
    }

    const saved = upsertCompany(payload, selectedCompanyId === 'new' ? undefined : selectedCompanyId);
    setSelectedCompanyId(saved.id);
    setNotice(`Registro guardado. Estado actual: ${formatStatusLabel(saved.status)}.`);
    setErrors([]);
  };

  return (
    <section className="section">
      <div className="container register-layout">
        <header className="section-header">
          <h1>Registro / Panel de Empresa (MVP)</h1>
          <p>
            Carga o edita perfiles empresariales con moderacion local. Este flujo queda listo para conectar API y
            backend con controles adicionales (CSRF, autenticacion, permisos).
          </p>
        </header>

        <aside className="info-card">
          <h3>Editar registro existente</h3>
          <label>
            Empresa
            <select value={selectedCompanyId} onChange={(event) => handleSelectorChange(event.target.value)}>
              <option value="new">Nueva empresa</option>
              {sortedCompanies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name} ({formatStatusLabel(company.status)})
                </option>
              ))}
            </select>
          </label>
          <p className="muted-text">
            Recomendacion: publicar desde Admin para mantener control institucional del contenido.
          </p>
        </aside>

        <form className="company-form" onSubmit={onSubmit} noValidate>
          <div className="form-grid">
            <label>
              Nombre de la empresa *
              <input
                value={form.name}
                onChange={(event) => setField('name', event.target.value)}
                placeholder="Ej: Panaderia Fit Aurora"
                required
              />
            </label>

            <label>
              Categoria *
              <input value={form.category} onChange={(event) => setField('category', event.target.value)} required />
            </label>

            <label>
              Ciudad *
              <input value={form.city} onChange={(event) => setField('city', event.target.value)} required />
            </label>

            <label>
              Tipo de servicio *
              <select
                value={form.serviceType}
                onChange={(event) => setField('serviceType', event.target.value)}
                required
              >
                <option value="B2C">B2C</option>
                <option value="B2B">B2B</option>
                <option value="Profesional">Profesional</option>
              </select>
            </label>

            <label className="full-width">
              Resumen de servicios *
              <input
                value={form.summary}
                onChange={(event) => setField('summary', event.target.value)}
                placeholder="Resumen corto para cards del directorio"
                required
              />
            </label>

            <label className="full-width">
              Descripcion completa *
              <textarea
                rows={4}
                value={form.description}
                onChange={(event) => setField('description', event.target.value)}
                required
              />
            </label>

            <label className="full-width">
              Servicios (separados por coma) *
              <input
                value={servicesInput}
                onChange={(event) => setServicesInput(event.target.value)}
                placeholder="Ej: Venta, Instalacion, Soporte"
                required
              />
            </label>

            <label className="full-width">
              Marcas (separadas por coma)
              <input
                value={brandsInput}
                onChange={(event) => setBrandsInput(event.target.value)}
                placeholder="Ej: Marca A, Marca B"
              />
            </label>

            <label>
              WhatsApp
              <input value={form.whatsapp} onChange={(event) => setField('whatsapp', event.target.value)} />
            </label>

            <label>
              Telefono
              <input value={form.phone} onChange={(event) => setField('phone', event.target.value)} />
            </label>

            <label className="full-width">
              Direccion
              <input value={form.address} onChange={(event) => setField('address', event.target.value)} />
            </label>

            <label>
              Sitio web
              <input value={form.website} onChange={(event) => setField('website', event.target.value)} />
            </label>

            <label>
              Horario
              <input value={form.schedule} onChange={(event) => setField('schedule', event.target.value)} />
            </label>

            <label>
              Estado de moderacion
              <select
                value={form.status}
                onChange={(event) => setField('status', event.target.value as CompanyDraftInput['status'])}
              >
                <option value="draft">Borrador</option>
                <option value="review">En revision</option>
                <option value="published">Publicado</option>
              </select>
            </label>
          </div>

          <fieldset className="upload-fieldset">
            <legend>Logo y banner</legend>
            <div className="upload-grid">
              <label>
                Logo (JPG/PNG/WEBP, max 5MB) *
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) {
                      return;
                    }
                    void applyImageFile(file, (url) => setField('logoUrl', url), 'logo');
                  }}
                />
              </label>

              <label>
                Banner (JPG/PNG/WEBP, max 5MB) *
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) {
                      return;
                    }
                    void applyImageFile(file, (url) => setField('bannerUrl', url), 'banner');
                  }}
                />
              </label>
            </div>

            {loadingImageField && <p className="muted-text">Procesando imagen: {loadingImageField}...</p>}

            <div className="upload-preview-grid">
              {form.logoUrl && <img src={form.logoUrl} alt="Vista previa logo" className="preview-image" />}
              {form.bannerUrl && <img src={form.bannerUrl} alt="Vista previa banner" className="preview-image" />}
            </div>
          </fieldset>

          <label className="full-width">
            Galeria de fotos (una URL por linea)
            <textarea
              rows={4}
              value={galleryInput}
              onChange={(event) => setGalleryInput(event.target.value)}
              placeholder="https://..."
            />
          </label>

          <fieldset className="catalog-fieldset">
            <div className="fieldset-head">
              <legend>Mini catalogo de productos</legend>
              <button type="button" className="secondary-btn" onClick={addProduct}>
                Agregar producto
              </button>
            </div>

            {form.products.map((product, index) => (
              <article key={`product-form-${index}`} className="product-form-card">
                <div className="product-form-grid">
                  <label>
                    Nombre *
                    <input
                      value={product.name}
                      onChange={(event) => setProductField(index, 'name', event.target.value)}
                      required
                    />
                  </label>

                  <label>
                    SKU
                    <input
                      value={product.sku ?? ''}
                      onChange={(event) => setProductField(index, 'sku', event.target.value)}
                    />
                  </label>

                  <label>
                    Precio (opcional)
                    <input
                      type="number"
                      min="0"
                      value={product.price ?? ''}
                      onChange={(event) => {
                        const value = event.target.value;
                        setProductField(index, 'price', value ? Number(value) : undefined);
                      }}
                    />
                  </label>

                  <label className="full-width">
                    Descripcion corta *
                    <textarea
                      rows={2}
                      value={product.shortDesc}
                      onChange={(event) => setProductField(index, 'shortDesc', event.target.value)}
                      required
                    />
                  </label>

                  <label className="full-width">
                    Tags (separados por coma)
                    <input
                      value={productTagsInput[index] ?? ''}
                      onChange={(event) => {
                        const next = [...productTagsInput];
                        next[index] = event.target.value;
                        setProductTagsInput(next);
                      }}
                      placeholder="Ej: Promocion, Nuevo"
                    />
                  </label>

                  <label className="full-width">
                    Imagen del producto *
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) {
                          return;
                        }

                        void applyImageFile(file, (url) => setProductField(index, 'imageUrl', url), `producto-${index + 1}`);
                      }}
                    />
                  </label>
                </div>

                {product.imageUrl && <img src={product.imageUrl} alt={product.name || 'Producto'} className="preview-image" />}

                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => removeProduct(index)}
                  disabled={form.products.length === 1}
                >
                  Eliminar producto
                </button>
              </article>
            ))}
          </fieldset>

          {errors.length > 0 && (
            <div className="form-errors" role="alert" aria-live="polite">
              <h4>Revisa estos campos:</h4>
              <ul>
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {notice && <p className="form-success">{notice}</p>}

          <button type="submit" className="primary-link submit-btn">
            Guardar empresa
          </button>
        </form>
      </div>
    </section>
  );
}
