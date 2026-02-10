import { QuotationItem } from "./QuotationItem";

export interface Quotation {
    id: string;
    number: string;
    clientId: string;
    clientName: string;
    items: QuotationItem[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    status: 'draft' | 'sent' | 'approved' | 'rejected';
    notes?: string;
    validUntil: Date;
    createdAt: Date;
    updatedAt: Date;
  }