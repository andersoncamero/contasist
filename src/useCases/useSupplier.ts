import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL, getFetchOptions } from "@/services/apiConfig";
import { Supplier } from "@/entities/Supplier";
import { useCompany } from "./useCompany";

interface ApiSupplierResponse {
  ID?: number | string;
  id?: number | string;
  Name?: string;
  name?: string;
  Email?: string;
  email?: string;
  Phone?: string;
  phone?: string;
  Company?: string;
  company?: string;
  Address?: string;
  address?: string;
  PersonType?: string;
  personType?: string;
  TaxId?: string;
  taxId?: string;
  ContactName?: string;
  contactName?: string;
  CreatedAt?: string;
  created_at?: string;
}

const mapApiSupplier = (apiSupplier: ApiSupplierResponse): Supplier => {
  const rawId = apiSupplier.ID || apiSupplier.id || "0";
  return {
    ID: String(rawId),
    Name: apiSupplier.Name || apiSupplier.name || "",
    Email: apiSupplier.Email || apiSupplier.email || "",
    Phone: apiSupplier.Phone || apiSupplier.phone || "",
    Company: apiSupplier.Company || apiSupplier.company || "",
    Address: apiSupplier.Address || apiSupplier.address || "",
    PersonType: apiSupplier.PersonType || apiSupplier.personType || "PF",
    TaxId: apiSupplier.TaxId || apiSupplier.taxId || "",
    ContactName: apiSupplier.ContactName || apiSupplier.contactName || "",
    CreatedAt: new Date(apiSupplier.CreatedAt || apiSupplier.created_at || Date.now()),
  };
};

const fetchSuppliersApi = async (companyId?: number): Promise<Supplier[]> => {
  const response = await fetch(`${API_BASE_URL}/suppliers`, getFetchOptions(companyId));
  if (!response.ok) throw new Error("Error al obtener proveedores");
  const data: ApiSupplierResponse[] = await response.json();
  if (!Array.isArray(data)) return [];
  return data.map(mapApiSupplier);
};

const addSupplierApi = async (supplier: Omit<Supplier, "ID" | "CreatedAt">) => {
  const payload = {
    name: supplier.Name,
    email: supplier.Email,
    phone: supplier.Phone,
    company: supplier.Company || supplier.Name,
    address: supplier.Address || "N/A",
    personType: supplier.PersonType || "PF",
    taxId: supplier.TaxId || "0000000000-0",
  };

  const response = await fetch(`${API_BASE_URL}/suppliers`, getFetchOptions(undefined, {
    method: "POST",
    body: JSON.stringify(payload),
  }));

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Error al crear proveedor");
  }

  return response.json().catch(() => ({}));
};

const updateSupplierApi = async ({ id, data }: { id: string; data: Partial<Supplier> }) => {
  const payload: Record<string, string> = {};
  if (data.Name !== undefined) payload.name = data.Name;
  if (data.Email !== undefined) payload.email = data.Email;
  if (data.Phone !== undefined) payload.phone = data.Phone;
  if (data.Company !== undefined) payload.company = data.Company;
  if (data.Address !== undefined) payload.address = data.Address;
  if (data.PersonType !== undefined) payload.personType = data.PersonType;
  if (data.TaxId !== undefined) payload.taxId = data.TaxId;

  const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, getFetchOptions(undefined, {
    method: "PUT",
    body: JSON.stringify(payload),
  }));

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Error al actualizar proveedor");
  }

  if (response.status === 204) return {};
  return response.json().catch(() => ({}));
};

const deleteSupplierApi = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, getFetchOptions(undefined, {
    method: "DELETE",
  }));

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Error al eliminar proveedor");
  }

  return true;
};

export const useSupplier = () => {
  const queryClient = useQueryClient();
  const { activeCompanyId } = useCompany();
  const numericCompanyId = activeCompanyId ? Number(activeCompanyId) : undefined;

  const query = useQuery({
    queryKey: ["suppliers", activeCompanyId],
    queryFn: () => fetchSuppliersApi(numericCompanyId),
    enabled: Boolean(numericCompanyId),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
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
    isLoading: query.isLoading,
    isMutating: addMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    error: query.error ? (query.error as Error).message : null,
    fetchSuppliers: async () => {
      await query.refetch();
    },
    addSupplier,
    updateSupplier,
    deleteSupplier,
  };
};

