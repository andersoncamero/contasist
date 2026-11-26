import { API_BASE_URL, getFetchOptions, parseResponseJson } from "./apiConfig";
import {
  DianDocument,
  DianDocumentDirection,
  DianSessionStatus,
  DianSyncResult,
  DianTokenRequestBody,
  DianTokenRequestResponse,
} from "@/entities/dian";

export const dianPortalService = {
  async requestToken(body: DianTokenRequestBody): Promise<DianTokenRequestResponse> {
    const response = await fetch(
      `${API_BASE_URL}/dian/token/request`,
      getFetchOptions(undefined, {
        method: "POST",
        body: JSON.stringify(body),
      })
    );
    return parseResponseJson(response);
  },

  async getSessionStatus(): Promise<DianSessionStatus> {
    const response = await fetch(
      `${API_BASE_URL}/dian/session/status`,
      getFetchOptions(undefined, {
        method: "GET",
      })
    );
    return parseResponseJson(response);
  },

  async syncDocuments(): Promise<DianSyncResult> {
    const response = await fetch(
      `${API_BASE_URL}/dian/documents/sync`,
      getFetchOptions(undefined, {
        method: "POST",
      })
    );
    return parseResponseJson(response);
  },

  async getSyncedDocuments(direction: DianDocumentDirection): Promise<DianDocument[]> {
    const response = await fetch(
      `${API_BASE_URL}/dian/documents?direction=${direction}`,
      getFetchOptions(undefined, {
        method: "GET",
      })
    );
    const data = await parseResponseJson(response);
    return Array.isArray(data) ? data : [];
  },
};
