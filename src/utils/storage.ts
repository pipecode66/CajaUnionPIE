import { companiesSeed } from '../data/companies.seed';
import type { Company } from '../types/company';

const STORAGE_KEY = 'cajaunion-pie-companies-v1';

const isCompanyArray = (value: unknown): value is Company[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'object' && item !== null && 'id' in item);

export const loadCompanies = (): Company[] => {
  if (typeof window === 'undefined') {
    return companiesSeed;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(companiesSeed));
    return companiesSeed;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (isCompanyArray(parsed)) {
      return parsed;
    }
  } catch {
    // Fallback to seed data when content is malformed.
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(companiesSeed));
  return companiesSeed;
};

export const saveCompanies = (companies: Company[]): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
};

export const resetCompanies = (): Company[] => {
  saveCompanies(companiesSeed);
  return companiesSeed;
};
