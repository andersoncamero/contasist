import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Client, PersonType } from "@/entities/Client";
import { API_BASE_URL, getFetchOptions } from "@/services/apiConfig";
import { useCompany } from "./useCompany";

interface ApiClientResponse {
  id?: number;
  ID?: number;
  companyId?: number;
  name?: string;
  Name?: string;
  email?: string;
  Email?: string;
  phone?: string;
  Phone?: string;
  company?: string;
  Company?: string;
  address?: string;
  Address?: string;
  personType?: PersonType;
  PersonType?: PersonType;
  taxId?: string;
  TaxID?: string;
  status?: string;
  IsActive?: boolean;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
}

const mapApiClient = (apiClient: ApiClientResponse): Client => {
  const clientID = apiClient.id ?? apiClient.ID ?? 0;
  const clientName = apiClient.name ?? apiClient.Name ?? "";
  const clientEmail = apiClient.email ?? apiClient.Email ?? "";
  const clientPhone = apiClient.phone ?? apiClient.Phone ?? "";
  const clientCompany = apiClient.company ?? apiClient.Company ?? "";
  const clientAddress = apiClient.address ?? apiClient.Address ?? "";
  const rawPersonType = apiClient.personType ?? apiClient.PersonType ?? "PJ";
  const clientPersonType: PersonType = (rawPersonType === "PN" || rawPersonType === "natural") ? "natural" : "juridica";
  const clientTaxID = apiClient.taxId ?? apiClient.TaxID ?? "";
  const createdDate = apiClient.createdAt || apiClient.created_at || new Date().toISOString();

  return {
    id: clientID,
    ID: clientID,
    companyId: apiClient.companyId,
    name: clientName,
    Name: clientName,
    email: clientEmail,
    Email: clientEmail,
    phone: clientPhone,
    Phone: clientPhone,
    company: clientCompany,
    Company: clientCompany,
    address: clientAddress,
    Address: clientAddress,
    personType: clientPersonType,
    PersonType: clientPersonType,
    taxId: clientTaxID,
    TaxID: clientTaxID,
    createdAt: createdDate,
    CreatedAt: new Date(createdDate),
    updatedAt: apiClient.updatedAt,
  };
};

const parseResponseJson = async (response: Response) => {
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

const fetchClientsApi = async (companyId?: number): Promise<Client[]> => {
  const response = await fetch(`${API_BASE_URL}/clients`, getFetchOptions(companyId));
  const data: ApiClientResponse[] = await parseResponseJson(response);
  return Array.isArray(data) ? data.map(mapApiClient) : [];
};

const addClientApi = async (client: Partial<Client>) => {
  const payload = {
    name: client.name || client.Name,
    email: client.email || client.Email,
    phone: client.phone || client.Phone,
    company: client.company || client.Company,
    address: client.address || client.Address,
    personType: client.personType || client.PersonType || "PJ",
    taxId: client.taxId || client.TaxID,
  };

  const response = await fetch(`${API_BASE_URL}/clients`, getFetchOptions(undefined, {
    method: "POST",
    body: JSON.stringify(payload),
  }));
  return parseResponseJson(response);
};

const updateClientApi = async ({ id, data }: { id: number; data: Partial<Client> }) => {
  const payload = {
    name: data.name || data.Name,
    email: data.email || data.Email,
    phone: data.phone || data.Phone,
    company: data.company || data.Company,
    address: data.address || data.Address,
    personType: data.personType || data.PersonType,
    taxId: data.taxId || data.TaxID,
  };

  const response = await fetch(`${API_BASE_URL}/clients/${id}`, getFetchOptions(undefined, {
    method: "PUT",
    body: JSON.stringify(payload),
  }));
  return parseResponseJson(response);
};

const deleteClientApi = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/clients/${id}`, getFetchOptions(undefined, {
    method: "DELETE",
  }));
  return parseResponseJson(response);
};

const fetchClientByIdApi = async (id: number | string, companyId?: number): Promise<Client | null> => {
  if (!id || id === 0 || id === "0") return null;
  const response = await fetch(`${API_BASE_URL}/clients/${id}`, getFetchOptions(companyId));
  if (!response.ok) return null;
  const data: ApiClientResponse = await parseResponseJson(response);
  return data && (data.id || data.ID) ? mapApiClient(data) : null;
};

export const useClientById = (id?: number | string) => {
  const { activeCompanyId } = useCompany();
  const numericCompanyId = activeCompanyId ? Number(activeCompanyId) : undefined;

  return useQuery({
    queryKey: ["client", id, activeCompanyId],
    queryFn: () => fetchClientByIdApi(id!, numericCompanyId),
    enabled: Boolean(numericCompanyId) && Boolean(id && id !== 0 && id !== "0"),
  });
};

export const useClient = () => {
  const queryClient = useQueryClient();
  const { activeCompanyId } = useCompany();
  const numericCompanyId = activeCompanyId ? Number(activeCompanyId) : undefined;

  const query = useQuery({
    queryKey: ["clients", activeCompanyId],
    queryFn: () => fetchClientsApi(numericCompanyId),
    enabled: Boolean(numericCompanyId),
  });

  const addMutation = useMutation({
    mutationFn: addClientApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateClientApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClientApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const addClient = async (client: Partial<Client>) => {
    try {
      await addMutation.mutateAsync(client);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const updateClient = async (id: number, data: Partial<Client>) => {
    try {
      await updateMutation.mutateAsync({ id, data });
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const deleteClient = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  return {
    clients: query.data || [],
    isLoading: query.isLoading || addMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    error: query.error ? (query.error as Error).message : null,
    fetchClients: async () => { await query.refetch(); },
    addClient,
    updateClient,
    deleteClient,
  };
};
