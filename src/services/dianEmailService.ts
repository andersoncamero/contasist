import { API_BASE_URL, getFetchOptions, parseResponseJson } from "./apiConfig";
import {
  DianAuthUrlResponse,
  DianMonitorConfig,
  DianOAuthStatus,
  DianProvider,
  DianTokenResponse,
} from "@/entities/dian";

export const dianEmailService = {
  async getOAuthStatus(): Promise<DianOAuthStatus> {
    const response = await fetch(
      `${API_BASE_URL}/dian/oauth/status`,
      getFetchOptions(undefined, {
        method: "GET",
      })
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(
        data.message || data.error || "Error al obtener estado de OAuth"
      );
    }

    return response.json();
  },

  async getAuthUrl(provider: DianProvider): Promise<DianAuthUrlResponse> {
    const response = await fetch(
      `${API_BASE_URL}/dian/oauth/${provider}/url`,
      getFetchOptions(undefined, {
        method: "GET",
      })
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(
        data.message ||
          data.error ||
          `Error al obtener la URL de autorización para ${provider}`
      );
    }

    return response.json();
  },

  async disconnectProvider(provider: DianProvider): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/dian/oauth/${provider}`,
      getFetchOptions(undefined, {
        method: "DELETE",
      })
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(
        data.message || data.error || `Error al desconectar ${provider}`
      );
    }
  },

  async getLatestToken(): Promise<DianTokenResponse> {
    const response = await fetch(
      `${API_BASE_URL}/dian/token`,
      getFetchOptions(undefined, {
        method: "GET",
      })
    );

    const data = await response.json().catch(() => ({}));

    if (response.status === 404 || data.has_token === false) {
      return {
        has_token: false,
        message:
          data.message ||
          "no DIAN token available yet; the monitor polls the mailbox automatically",
      };
    }

    if (!response.ok) {
      throw new Error(
        data.message || data.error || "Error al consultar el último token DIAN"
      );
    }

    return data;
  },

  async getMonitorConfig(): Promise<DianMonitorConfig> {
    const response = await fetch(
      `${API_BASE_URL}/dian/monitor/config`,
      getFetchOptions(undefined, {
        method: "GET",
      })
    );

    return parseResponseJson(response);
  },

  async updateMonitorConfig(
    intervalMinutes: number
  ): Promise<DianMonitorConfig> {
    const response = await fetch(
      `${API_BASE_URL}/dian/monitor/config`,
      getFetchOptions(undefined, {
        method: "PUT",
        body: JSON.stringify({ interval_minutes: intervalMinutes }),
      })
    );

    return parseResponseJson(response);
  },

  async startMonitor(): Promise<DianMonitorConfig> {
    const response = await fetch(
      `${API_BASE_URL}/dian/monitor/start`,
      getFetchOptions(undefined, {
        method: "POST",
      })
    );

    return parseResponseJson(response);
  },
};
