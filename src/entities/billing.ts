export type BillingProviderType = "factus" | "dian_portal";
export type BillingEnvironment = "sandbox" | "production";

export interface BillingConfig {
  companyId: number;
  provider: BillingProviderType;
  environment: BillingEnvironment;
  baseUrl: string;
  clientId: string;
  hasClientSecret: boolean;
  username: string;
  hasPassword: boolean;
  numberingRangeId: number;
  configured: boolean;
  hasActiveToken: boolean;
  tokenExpiresAt?: string | null;
}

export interface UpdateBillingConfigBody {
  provider: BillingProviderType;
  environment: BillingEnvironment;
  baseUrl?: string;
  clientId: string;
  clientSecret?: string;
  username: string;
  password?: string;
  numberingRangeId: number;
}

export interface BillingConnectionTestResult {
  connected: boolean;
  provider: BillingProviderType;
  environment: BillingEnvironment;
  message: string;
}

export interface NumberingRange {
  id: number;
  document: string;
  prefix: string;
  from: number;
  to: number;
  current: number;
  resolutionNumber: string;
  startDate: string;
  endDate: string;
  isExpired: boolean;
  isActive: boolean;
}

export interface BillingSyncResult {
  provider: string;
  sentSynced: number;
  receivedSynced: number;
}

export interface BillingCustomer {
  identificationDocumentCode: string;
  identification: string;
  dv?: string;
  legalOrganizationCode: string;
  tributeCode?: string;
  company?: string;
  names?: string;
  email?: string;
  phone?: string;
  address?: string;
  municipalityCode?: string;
}

export interface BillingItemTax {
  code: string;
  rate: string;
  isExcluded?: boolean;
}

export interface BillingInvoiceItem {
  codeReference: string;
  name: string;
  quantity: number;
  discountRate?: number;
  price: number;
  unitMeasureCode: string;
  standardCode: string;
  taxes: BillingItemTax[];
}

export interface BillingPaymentDetail {
  paymentForm: string;
  paymentMethodCode: string;
  amount: string;
  dueDate?: string;
  referenceCode?: string;
}

export interface EmitInvoiceBody {
  numberingRangeId?: number;
  referenceCode: string;
  observation?: string;
  paymentDetails: BillingPaymentDetail[];
  customer: BillingCustomer;
  items: BillingInvoiceItem[];
}

export interface EmitCreditNoteBody {
  numberingRangeId?: number;
  referenceCode: string;
  correctionConceptCode: string;
  billNumber: string;
  observation?: string;
  paymentDetails: BillingPaymentDetail[];
  customer: BillingCustomer;
  items: BillingInvoiceItem[];
}

export interface EmitDocumentResult {
  number: string;
  cufe: string;
  qrCode: string;
  publicUrl: string;
  status: string;
}
