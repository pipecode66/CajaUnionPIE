export type ModerationStatus = 'draft' | 'review' | 'published';

export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  shortDesc: string;
  price?: number;
  sku?: string;
  tags: string[];
}

export interface CompanyLocation {
  label: string;
  address: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  city: string;
  category: string;
  serviceType: string;
  summary: string;
  description: string;
  services: string[];
  brands: string[];
  logoUrl: string;
  bannerUrl: string;
  galleryUrls: string[];
  whatsapp?: string;
  phone?: string;
  address?: string;
  locations?: CompanyLocation[];
  website?: string;
  schedule?: string;
  status: ModerationStatus;
  createdAt: string;
  updatedAt: string;
  products: Product[];
}

export interface CompanyDraftInput {
  name: string;
  city: string;
  category: string;
  serviceType: string;
  summary: string;
  description: string;
  services: string[];
  brands: string[];
  logoUrl: string;
  bannerUrl: string;
  galleryUrls: string[];
  whatsapp?: string;
  phone?: string;
  address?: string;
  locations?: CompanyLocation[];
  website?: string;
  schedule?: string;
  status: ModerationStatus;
  products: Product[];
}
