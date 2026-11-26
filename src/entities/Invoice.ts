import { Client } from "./Client";
import { Product } from "./Product";

export interface InvoiceItem {
  id?: number;
  ID?: number;
  invoiceId?: number;
  InvoiceID?: number;
  productId?: number;
  ProductID?: number;
  product?: Product;
  Product?: Product;
  description: string;
  Description?: string;
  quantity: number;
  Quantity?: number;
  unitPrice: number;
  UnitPrice?: number;
  discount?: number;
  Discount?: number;
  taxRate?: number;
  TaxRate?: number;
  subtotal: number;
  Subtotal?: number;
  total: number;
  Total?: number;
}

export interface Invoice {
  id?: number;
  ID?: number;
  companyId?: number;
  CompanyID?: number;
  clientId: number;
  ClientID?: number;
  client?: Client;
  Client?: Client;
  userId?: number;
  UserID?: number;
  quotationId?: number;
  QuotationID?: number;
  number: string;
  Number?: string;
  status: 'draft' | 'issued' | 'paid' | 'partially_paid' | 'cancelled';
  Status?: 'draft' | 'issued' | 'paid' | 'partially_paid' | 'cancelled';
  paymentMethod: string;
  PaymentMethod?: string;
  paymentTerms?: string;
  PaymentTerms?: string;
  issueDate: string | Date;
  IssueDate?: string | Date;
  dueDate: string | Date;
  DueDate?: string | Date;
  subtotal: number;
  Subtotal?: number;
  taxRate?: number;
  TaxRate?: number;
  taxAmount: number;
  TaxAmount?: number;
  total: number;
  Total?: number;
  balance: number;
  Balance?: number;
  notes?: string;
  Notes?: string;
  cufe?: string;
  CUFE?: string;
  qrCode?: string;
  QRCode?: string;
  dianStatus?: string;
  DIANStatus?: string;
  items?: InvoiceItem[];
  InvoiceItems?: InvoiceItem[];
  createdAt?: string | Date;
  CreatedAt?: string | Date;
}

