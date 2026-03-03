/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Company, CompanyDraftInput, ModerationStatus } from '../types/company';
import { buildCompanyFromInput, createBulkDemoCompanies, createSlug, ensureUniqueSlug } from '../utils/company';
import { companiesSeed } from '../data/companies.seed';
import { loadCompanies, saveCompanies } from '../utils/storage';

interface CompaniesContextValue {
  companies: Company[];
  publishedCompanies: Company[];
  upsertCompany: (payload: CompanyDraftInput, companyId?: string) => Company;
  patchCompany: (companyId: string, payload: Partial<Company>) => void;
  updateStatus: (companyId: string, status: ModerationStatus) => void;
  importCompanies: (incoming: Company[]) => void;
  generateMassiveDemo: (target?: number) => void;
  resetToSeed: () => void;
}

const CompaniesContext = createContext<CompaniesContextValue | undefined>(undefined);

const sortByLatest = (items: Company[]): Company[] =>
  [...items].sort((a, b) => Number(new Date(b.updatedAt)) - Number(new Date(a.updatedAt)));

export function CompaniesProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>(() => sortByLatest(loadCompanies()));

  const persist = (next: Company[]) => {
    const normalized = sortByLatest(next);
    setCompanies(normalized);
    saveCompanies(normalized);
  };

  const upsertCompany = (payload: CompanyDraftInput, companyId?: string): Company => {
    const previous = companies.find((company) => company.id === companyId);
    const base = buildCompanyFromInput(payload, previous);
    const desiredSlug = createSlug(payload.name);
    const slug = ensureUniqueSlug(companies, desiredSlug, previous?.id);
    const candidate: Company = {
      ...base,
      slug,
    };

    if (previous) {
      persist(companies.map((company) => (company.id === previous.id ? candidate : company)));
    } else {
      persist([candidate, ...companies]);
    }

    return candidate;
  };

  const updateStatus = (companyId: string, status: ModerationStatus) => {
    persist(
      companies.map((company) =>
        company.id === companyId ? { ...company, status, updatedAt: new Date().toISOString() } : company,
      ),
    );
  };

  const patchCompany = (companyId: string, payload: Partial<Company>) => {
    persist(
      companies.map((company) =>
        company.id === companyId
          ? {
              ...company,
              ...payload,
              id: company.id,
              updatedAt: new Date().toISOString(),
            }
          : company,
      ),
    );
  };

  const importCompanies = (incoming: Company[]) => {
    if (incoming.length === 0) {
      return;
    }

    const map = new Map(companies.map((company) => [company.id, company]));

    incoming.forEach((company) => {
      map.set(company.id, company);
    });

    persist(Array.from(map.values()));
  };

  const generateMassiveDemo = (target = 150) => {
    const base = companies.length > 0 ? companies : companiesSeed;
    const expanded = createBulkDemoCompanies(base, target);
    persist(expanded);
  };

  const resetToSeed = () => {
    persist(companiesSeed);
  };

  const value: CompaniesContextValue = {
    companies,
    publishedCompanies: companies.filter((company) => company.status === 'published'),
    upsertCompany,
    patchCompany,
    updateStatus,
    importCompanies,
    generateMassiveDemo,
    resetToSeed,
  };

  return <CompaniesContext.Provider value={value}>{children}</CompaniesContext.Provider>;
}

export const useCompanies = (): CompaniesContextValue => {
  const context = useContext(CompaniesContext);
  if (!context) {
    throw new Error('useCompanies debe usarse dentro de CompaniesProvider');
  }

  return context;
};
