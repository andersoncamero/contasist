export type PersonType = 'PN' | 'PJ' | 'natural' | 'juridica';

export interface Client {
  id?: number;
  ID?: number;
  companyId?: number;
  name?: string;
  Name?: string;
  email?: string;
  Email?: string;
  phone?: string;
  Phone?: string;
  company?: string;
  Company?: string;
  address?: string;
  Address?: string;
  personType?: PersonType;
  PersonType?: PersonType;
  taxId?: string;
  TaxID?: string;
  createdAt?: string | Date;
  CreatedAt?: Date | string;
  updatedAt?: string | Date;
}
