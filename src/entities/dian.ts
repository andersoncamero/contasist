export type DianProvider = "gmail" | "outlook";

export interface ProviderStatus {
  configured: boolean;
  authenticated: boolean;
  email?: string;
}

export interface DianOAuthStatus {
  gmail: ProviderStatus;
  outlook: ProviderStatus;
}

export interface DianAuthUrlResponse {
  auth_url: string;
  provider: string;
}

export interface DianTokenAvailable {
  has_token: true;
  token: string;
  token_url: string;
  date: string;
  fetched_at: string;
}

export interface DianTokenUnavailable {
  has_token: false;
  message?: string;
}

export type DianTokenResponse = DianTokenAvailable | DianTokenUnavailable;

export interface DianMonitorConfig {
  interval_minutes: number;
  default_interval_minutes: number;
  min_interval_minutes: number;
  max_interval_minutes: number;
  monitoring: boolean;
  session_active: boolean;
}

export interface UpdateDianMonitorConfigBody {
  interval_minutes: number;
}

export function formatDianIntervalText(minutes: number): string {
  return minutes === 1 ? "1 minuto" : `${minutes} minutos`;
}

export function formatDianDateTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

export interface DianSessionInfo {
  active: boolean;
  authenticatedAt?: string;
  expiresAt?: string;
}

export interface DianSessionStatus {
  session: DianSessionInfo;
  token: {
    available: boolean;
    date?: string | null;
    fetched_at?: string | null;
  };
}

export interface DianTokenRequestBody {
  user_document_id: string;
  user_type?: number;
}

export interface DianTokenRequestResponse {
  message: string;
  company: string;
}

export interface DianSyncResult {
  sentSynced: number;
  receivedSynced: number;
}

export type DianDocumentDirection = "SENT" | "RECEIVED";

export interface DianDocument {
  id: number;
  companyId: number;
  direction: DianDocumentDirection;
  documentKey: string;
  documentNumber: string;
  counterpartNit: string;
  counterpartName: string;
  issueDate: string;
  totalAmount: number;
  status: string;
  documentType: string;
  syncedAt: string;
}
