import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Client } from "@/entities/Client";
import { API_BASE_URL, getAuthHeader } from "./apiConfig";

// Tipos de API
interface ApiClientResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address?: string;
  created_at?: string;
}

// Mappers
const mapApiClient = (apiClient: ApiClientResponse): Client => ({
  id: apiClient.id,
  name: apiClient.name,
  email: apiClient.email,
  phone: apiClient.phone,
  company: apiClient.company,
  address: apiClient.address,
  createdAt: new Date(apiClient.created_at || Date.now()),
});

// Funciones API
const fetchClientsApi = async (): Promise<Client[]> => {
  const response = await fetch(`${API_BASE_URL}/clients`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error("Error al obtener clientes");
  const data: ApiClientResponse[] = await response.json();
  return data.map(mapApiClient);
};

const addClientApi = async (client: Omit<Client, "id" | "createdAt">) => {
  const response = await fetch(`${API_BASE_URL}/clients`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(client),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al crear cliente");
  }
  return response.json();
};

const updateClientApi = async ({ id, data }: { id: string; data: Partial<Client> }) => {
  const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
    method: "PUT",
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al actualizar cliente");
  }
  return response.json();
};

const deleteClientApi = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al eliminar cliente");
  }
  return response.json();
};

export const useClient = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClientsApi,
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

  // Facade para mantener compatibilidad con los componentes existentes
  // aunque idealmente deberíamos retornar query y mutations directamente.
  
  const addClient = async (client: Omit<Client, "id" | "createdAt">) => {
    try {
      await addMutation.mutateAsync(client);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const updateClient = async (id: string, data: Partial<Client>) => {
    try {
      await updateMutation.mutateAsync({ id, data });
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const deleteClient = async (id: string) => {
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
    fetchClients: async () => { await query.refetch(); }, // Compatibilidad
    addClient,
    updateClient,
    deleteClient,
  };
};
