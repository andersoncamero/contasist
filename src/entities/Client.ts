export interface Client {
  ID: number;
  Name: string;
  Email: string;
  Phone: string;
  PersonType?: 'natural' | 'juridica';
  Company?: string;
  Address?: string;
  TaxID?: string;
  CreatedAt: Date;
}

