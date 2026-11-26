export const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

export const parseResponseJson = async (response: Response) => {
  const text = await response.text();
  if (!response.ok) {
    let errorMessage = `Error HTTP ${response.status}`;
    if (text) {
      try {
        const json = JSON.parse(text);
        errorMessage = json.message || json.error || errorMessage;
      } catch {
        errorMessage = text;
      }
    }
    throw new Error(errorMessage);
  }
  if (!text || text.trim() === "") return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
};

export const getAuthHeader = (companyId?: number): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const activeCompanyId = companyId?.toString() || localStorage.getItem("active_company_id");

  if (activeCompanyId) {
    headers["X-Company-ID"] = activeCompanyId;
  }

  const authData = localStorage.getItem("ContAsist-auth");
  if (authData) {
    try {
      const { state } = JSON.parse(authData);
      if (!headers["X-Company-ID"] && state?.currentUser?.companyId) {
        headers["X-Company-ID"] = state.currentUser.companyId.toString();
      }
    } catch (error) {
      console.error("Error leyendo estado de autenticación:", error);
    }
  }

  return headers;
};

export const getFetchOptions = (companyId?: number, options: RequestInit = {}): RequestInit => {
  return {
    ...options,
    credentials: "include",
    headers: {
      ...getAuthHeader(companyId),
      ...(options.headers || {}),
    },
  };
};

