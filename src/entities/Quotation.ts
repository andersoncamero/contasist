import { QuotationItem } from "./QuotationItem";

export interface Quotation {
  ID?: number;
  Number: string;
  ClientID: string;
  ClientName: string;
  Items: QuotationItem[];
  Subtotal: number;
  TaxRate: number;
  TaxAmount: number;
  Total: number;
  Status: 'draft' | 'sent' | 'approved' | 'rejected';
  Notes?: string;
  ValidUntil: Date;
  CreatedAt: Date;
  UpdatedAt: Date;
}