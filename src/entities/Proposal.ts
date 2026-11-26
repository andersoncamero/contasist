export type ProposalStatus = 'draft' | 'sent' | 'approved' | 'rejected';

export interface ProposalItem {
  id?: number;
  proposalId?: number;
  productId?: number;
  productName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Proposal {
  id: number;
  number: string;
  title: string;
  clientId: number;
  clientName: string;
  objective?: string;
  scope?: string;
  deliverables?: string;
  methodology?: string;
  executionTime?: string;
  validityDays?: number;
  commercialTerms?: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  status: ProposalStatus;
  items: ProposalItem[];
  createdAt?: string;
  updatedAt?: string;
}
