import { Link } from 'react-router-dom';
import type { Company } from '../../types/company';
import { formatStatusLabel } from '../../utils/company';

export function CompanyCard({ company }: { company: Company }) {
  return (
    <article className="company-card">
      <img src={company.bannerUrl} alt={`Banner ${company.name}`} className="company-banner" />
      <div className="company-card-body">
        <div className="company-top-row">
          <img src={company.logoUrl} alt={`${company.name} logo`} className="company-logo" />
          <div>
            <h3>{company.name}</h3>
            <p className="muted-text">
              {company.category} - {company.city}
            </p>
          </div>
        </div>

        <p>{company.summary}</p>

        <div className="chip-row">
          <span className="chip">{company.serviceType}</span>
          <span className="chip">{formatStatusLabel(company.status)}</span>
          {company.products.length > 0 && <span className="chip">Con catalogo</span>}
        </div>

        <Link to={`/empresa/${company.slug}`} className="cta-link">
          Ver perfil
        </Link>
      </div>
    </article>
  );
}
