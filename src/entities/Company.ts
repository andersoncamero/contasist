export interface Company {
  id?: number;
  ID?: number;
  name: string;
  nit: string;
  economicActivity?: string;
  status?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  pdfHeaderImage?: string;
  pdfShowBorder?: boolean;
  website?: string;
  defaultTaxRate?: string | number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCompanyReq {
  name: string;
  nit: string;
  economicActivity?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  pdfHeaderImage?: string;
  pdfShowBorder?: boolean;
  website?: string;
  defaultTaxRate?: string | number;
}
