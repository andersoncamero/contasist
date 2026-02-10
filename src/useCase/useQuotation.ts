import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Quotation } from "@/entities/Quotation";
import { QuotationItem } from "@/entities/QuotationItem";
import { API_BASE_URL, getAuthHeader } from "./apiConfig";

// Tipos de API
interface ApiQuotationItemResponse {
  id: string;
  product_id: string;
  product_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount: number;
  subtotal: number;
}

interface ApiQuotationResponse {
  id: string;
  number: string;
  client_id: string;
  client_name: string;
  items: ApiQuotationItemResponse[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  notes?: string;
  valid_until: string;
  created_at: string;
  updated_at: string;
}

// Mappers
const mapApiQuotationItem = (item: ApiQuotationItemResponse): QuotationItem => ({
  id: item.id,
  productId: item.product_id,
  productName: item.product_name,
  description: item.description,
  quantity: item.quantity,
  unitPrice: item.unit_price,
  discount: item.discount,
  subtotal: item.subtotal,
});

const mapApiQuotation = (apiQuotation: ApiQuotationResponse): Quotation => ({
  id: apiQuotation.id,
  number: apiQuotation.number,
  clientId: apiQuotation.client_id,
  clientName: apiQuotation.client_name,
  items: apiQuotation.items?.map(mapApiQuotationItem) || [],
  subtotal: apiQuotation.subtotal,
  taxRate: apiQuotation.tax_rate,
  taxAmount: apiQuotation.tax_amount,
  total: apiQuotation.total,
  status: apiQuotation.status,
  notes: apiQuotation.notes,
  validUntil: new Date(apiQuotation.valid_until),
  createdAt: new Date(apiQuotation.created_at),
  updatedAt: new Date(apiQuotation.updated_at),
});

const mapQuotationToApi = (quotation: Partial<Quotation>) => ({
  number: quotation.number,
  client_id: quotation.clientId,
  client_name: quotation.clientName,
  items: quotation.items?.map((item) => ({
    id: item.id,
    product_id: item.productId,
    product_name: item.productName,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    discount: item.discount,
    subtotal: item.subtotal,
  })),
  subtotal: quotation.subtotal,
  tax_rate: quotation.taxRate,
  tax_amount: quotation.taxAmount,
  total: quotation.total,
  status: quotation.status,
  notes: quotation.notes,
  valid_until: quotation.validUntil?.toISOString(),
});

// Funciones API
const fetchQuotationsApi = async (): Promise<Quotation[]> => {
  const response = await fetch(`${API_BASE_URL}/quotations`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error('Error al obtener cotizaciones');
  const data: ApiQuotationResponse[] = await response.json();
  return data.map(mapApiQuotation);
};

const addQuotationApi = async (quotationData: Omit<Quotation, "id" | "createdAt" | "updatedAt">) => {
  const response = await fetch(`${API_BASE_URL}/quotations`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(mapQuotationToApi(quotationData)),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al crear cotización');
  }
  return response.json();
};

const updateQuotationApi = async ({ id, data }: { id: string; data: Partial<Quotation> }) => {
  const response = await fetch(`${API_BASE_URL}/quotations/${id}`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify(mapQuotationToApi(data)),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al actualizar cotización');
  }
  return response.json();
};

const deleteQuotationApi = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/quotations/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al eliminar cotización');
  }
  return response.json();
};

const updateQuotationStatusApi = async ({ id, status }: { id: string; status: Quotation["status"] }) => {
  const response = await fetch(`${API_BASE_URL}/quotations/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeader(),
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al actualizar estado');
  }
  return response.json();
};

export const useQuotation = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["quotations"],
    queryFn: fetchQuotationsApi,
  });

  const addMutation = useMutation({
    mutationFn: addQuotationApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateQuotationApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteQuotationApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: updateQuotationStatusApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
    },
  });

  // Facade
  const addQuotation = async (quotationData: Omit<Quotation, "id" | "createdAt" | "updatedAt">) => {
    try {
      const response = await addMutation.mutateAsync(quotationData);
      return { success: true, id: response.id };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const updateQuotation = async (id: string, quotationData: Partial<Quotation>) => {
    try {
      await updateMutation.mutateAsync({ id, data: quotationData });
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const deleteQuotation = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const updateQuotationStatus = async (id: string, status: Quotation["status"]) => {
    try {
      await statusMutation.mutateAsync({ id, status });
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  return {
    quotations: query.data || [],
    isLoading: query.isLoading || addMutation.isPending || updateMutation.isPending || deleteMutation.isPending || statusMutation.isPending,
    error: query.error ? (query.error as Error).message : null,
    fetchQuotations: async () => { await query.refetch(); },
    addQuotation,
    updateQuotation,
    deleteQuotation,
    updateQuotationStatus,
  };
};