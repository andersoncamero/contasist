import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Supplier } from "@/entities/Supplier";
import { API_BASE_URL, getAuthHeader } from "@/services/apiConfig";

// Tipos de API
interface ApiSupplierResponse {
  ID: string;
  Name: string;
  Email: string;
  Phone: string;
  TaxId?: string;
  Address?: string;
  ContactName?: string;
  created_at?: string;
}

// Mappers
const mapApiSupplier = (apiSupplier: ApiSupplierResponse): Supplier => ({
  ID: apiSupplier.ID,
  Name: apiSupplier.Name,
  Email: apiSupplier.Email,
  Phone: apiSupplier.Phone,
  TaxId: apiSupplier.TaxId,
  Address: apiSupplier.Address,
  ContactName: apiSupplier.ContactName,
  CreatedAt: new Date(apiSupplier.created_at || Date.now()),
});

// Funciones API
const fetchSuppliersApi = async (): Promise<Supplier[]> => {
  const response = await fetch(`${API_BASE_URL}/suppliers`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error("Error al obtener proveedores");
  const data: ApiSupplierResponse[] = await response.json();
  return data.map(mapApiSupplier);
};

const addSupplierApi = async (supplier: Omit<Supplier, "ID" | "CreatedAt">) => {
  const response = await fetch(`${API_BASE_URL}/suppliers`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(supplier),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al crear proveedor");
  }
  return response.json();
};

const updateSupplierApi = async ({ id, data }: { id: string; data: Partial<Supplier> }) => {
  const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
    method: "PUT",
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al actualizar proveedor");
  }
  return response.json();
};

const deleteSupplierApi = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al eliminar proveedor");
  }
  return response.json();
};

export const useSupplier = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["suppliers"],
    queryFn: fetchSuppliersApi,
  });

  const addMutation = useMutation({
    mutationFn: addSupplierApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateSupplierApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSupplierApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
  
  const addSupplier = async (supplier: Omit<Supplier, "ID" | "CreatedAt">) => {
    try {
      await addMutation.mutateAsync(supplier);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const updateSupplier = async (id: string, data: Partial<Supplier>) => {
    try {
      await updateMutation.mutateAsync({ id, data });
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  return {
    suppliers: query.data || [],
    isLoading: query.isLoading || addMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    error: query.error ? (query.error as Error).message : null,
    fetchSuppliers: async () => { await query.refetch(); },
    addSupplier,
    updateSupplier,
    deleteSupplier,
  };
};
