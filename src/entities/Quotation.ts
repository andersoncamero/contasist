import { QuotationItem } from "./QuotationItem";

export interface Quotation {
  ID?: number;
  Number: string;
  ClientID: number;
  ClientName: string;
  ClientEmail?: string;
  ClientPhone?: string;
  ClientAddress?: string;
  ClientCompany?: string;
  Client?: any;
  Items: QuotationItem[];
  Subtotal: number;
  TaxRate: number;
  TaxAmount: number;
  Total: number;
  Status: 'draft' | 'sent' | 'approved' | 'accepted' | 'rejected' | 'billed';
  Note?: string;
  Notes?: string;
  IntroductionText?: string;
  ScopeDetails?: string;
  WarrantyInfo?: string;
  PaymentTerms?: string;
  ValidUntil: Date;
  CreatedAt: Date;
  UpdatedAt: Date;
}