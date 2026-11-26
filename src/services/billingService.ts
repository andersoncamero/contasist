import { API_BASE_URL, getFetchOptions, parseResponseJson } from "./apiConfig";
import {
  BillingConfig,
  BillingConnectionTestResult,
  BillingSyncResult,
  EmitCreditNoteBody,
  EmitDocumentResult,
  EmitInvoiceBody,
  NumberingRange,
  UpdateBillingConfigBody,
} from "@/entities/billing";

export const billingService = {
  async getConfig(): Promise<BillingConfig> {
    const response = await fetch(
      `${API_BASE_URL}/billing/config`,
      getFetchOptions(undefined, { method: "GET" })
    );
    return parseResponseJson(response);
  },

  async updateConfig(body: UpdateBillingConfigBody): Promise<BillingConfig> {
    const response = await fetch(
      `${API_BASE_URL}/billing/config`,
      getFetchOptions(undefined, {
        method: "PUT",
        body: JSON.stringify(body),
      })
    );
    return parseResponseJson(response);
  },

  async testConnection(): Promise<BillingConnectionTestResult> {
    const response = await fetch(
      `${API_BASE_URL}/billing/test-connection`,
      getFetchOptions(undefined, { method: "POST" })
    );
    return parseResponseJson(response);
  },

  async getNumberingRanges(): Promise<NumberingRange[]> {
    const response = await fetch(
      `${API_BASE_URL}/billing/numbering-ranges`,
      getFetchOptions(undefined, { method: "GET" })
    );
    return parseResponseJson(response);
  },

  async syncDocuments(): Promise<BillingSyncResult> {
    const response = await fetch(
      `${API_BASE_URL}/billing/documents/sync`,
      getFetchOptions(undefined, { method: "POST" })
    );
    return parseResponseJson(response);
  },

  getDocumentPdfUrl(documentNumber: string): string {
    return `${API_BASE_URL}/billing/documents/${encodeURIComponent(documentNumber)}/pdf`;
  },

  getDocumentXmlUrl(documentNumber: string): string {
    return `${API_BASE_URL}/billing/documents/${encodeURIComponent(documentNumber)}/xml`;
  },

  async downloadDocumentPdf(documentNumber: string): Promise<Blob> {
    const response = await fetch(
      `${API_BASE_URL}/billing/documents/${encodeURIComponent(documentNumber)}/pdf`,
      getFetchOptions(undefined, { method: "GET", headers: {} })
    );
    if (!response.ok) {
      await parseResponseJson(response);
    }
    return response.blob();
  },

  async downloadDocumentXml(documentNumber: string): Promise<Blob> {
    const response = await fetch(
      `${API_BASE_URL}/billing/documents/${encodeURIComponent(documentNumber)}/xml`,
      getFetchOptions(undefined, { method: "GET", headers: {} })
    );
    if (!response.ok) {
      await parseResponseJson(response);
    }
    return response.blob();
  },

  async emitInvoice(body: EmitInvoiceBody): Promise<EmitDocumentResult> {
    const response = await fetch(
      `${API_BASE_URL}/billing/invoices`,
      getFetchOptions(undefined, {
        method: "POST",
        body: JSON.stringify(body),
      })
    );
    return parseResponseJson(response);
  },

  async emitCreditNote(body: EmitCreditNoteBody): Promise<EmitDocumentResult> {
    const response = await fetch(
      `${API_BASE_URL}/billing/credit-notes`,
      getFetchOptions(undefined, {
        method: "POST",
        body: JSON.stringify(body),
      })
    );
    return parseResponseJson(response);
  },
};
