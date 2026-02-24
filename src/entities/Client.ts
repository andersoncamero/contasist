export interface Client {
  ID: string;
  Name: string;
  Email: string;
  Phone: string;
  PersonType?: 'natural' | 'juridica';
  Company?: string;
  Address?: string;
  TaxId?: string;
  CreatedAt: Date;
}

