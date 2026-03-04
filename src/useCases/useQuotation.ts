import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Quotation } from "@/entities/Quotation";
import { QuotationItem } from "@/entities/QuotationItem";
import { API_BASE_URL, getAuthHeader } from "@/services/apiConfig";

// Tipos de API
interface ApiQuotationItemResponse {
  ID: number;
  ProductID: number;
  Product: {
    Name: string;
    Description: string;
  };
  Quantity: number;
  UnitPrice: number;
  Discount: number;
  Subtotal: number;
}

interface ApiQuotationResponse {
  ID: number;
  Number: string;
  ClientID: number;
  items: ApiQuotationItemResponse[];
  Subtotal: number;
  TaxRate: number;
  TaxAmount: number;
  Total: number;
  Status: 'draft' | 'sent' | 'approved' | 'rejected';
  Note?: string;
  ValidUntil: string;
  CreatedAt: string;
  UpdatedAt: string;
}

// Mappers
const mapApiQuotationItem = (item: ApiQuotationItemResponse): QuotationItem => ({
  ID: item.ID,
  ProductID: item.ProductID,
  ProductName: item.Product?.Name || '',
  Description: item.Product?.Description || '',
  Quantity: item.Quantity,
  UnitPrice: item.UnitPrice,
  Discount: item.Discount,
  Subtotal: item.Subtotal,
});

const mapApiQuotation = (apiQuotation: ApiQuotationResponse): Quotation => ({
  ID: apiQuotation.ID,
  Number: apiQuotation.Number,
  ClientID: apiQuotation.ClientID,
  ClientName: '',
  Items: apiQuotation.items?.map(mapApiQuotationItem) || [],
  Subtotal: apiQuotation.Subtotal,
  TaxRate: apiQuotation.TaxRate,
  TaxAmount: apiQuotation.TaxAmount,
  Total: apiQuotation.Total,
  Status: apiQuotation.Status,
  Note: apiQuotation.Note,
  ValidUntil: new Date(apiQuotation.ValidUntil),
  CreatedAt: new Date(apiQuotation.CreatedAt),
  UpdatedAt: new Date(apiQuotation.UpdatedAt),
});

const mapQuotationToApi = (quotation: Partial<Quotation>) => ({
  Number: quotation.Number,
  ClientID: quotation.ClientID,
  items: quotation.Items?.map((item) => ({
    ProductID: item.ProductID,
    Quantity: item.Quantity,
    UnitPrice: item.UnitPrice,
    Discount: item.Discount,
    Subtotal: item.Subtotal,
  })),
  Subtotal: quotation.Subtotal,
  TaxRate: quotation.TaxRate,
  TaxAmount: quotation.TaxAmount,
  Total: quotation.Total,
  Status: quotation.Status,
  Note: quotation.Note,
  ValidUntil: quotation.ValidUntil?.toISOString(),
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

const fetchQuotationByIdApi = async (id: string): Promise<Quotation> => {
  const response = await fetch(`${API_BASE_URL}/quotations/${id}`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) {
    if (response.status === 404) throw new Error('Cotización no encontrada');
    throw new Error('Error al obtener la cotización');
  }
  const data: ApiQuotationResponse = await response.json();
  return mapApiQuotation(data);
};

const addQuotationApi = async (quotationData: Omit<Quotation, "ID" | "CreatedAt" | "UpdatedAt">) => {
  const response = await fetch(`${API_BASE_URL}/quotations`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(mapQuotationToApi(quotationData)),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al crear cotización');
  }

  if (response.status === 204) return {};
  return response.json().catch(() => ({}));
};

const updateQuotationApi = async ({ id, data }: { id: string; data: Partial<Quotation> }) => {
  const response = await fetch(`${API_BASE_URL}/quotations/${id}`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify(mapQuotationToApi(data)),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al actualizar cotización');
  }

  if (response.status === 204) return {};
  return response.json().catch(() => ({}));
};

const deleteQuotationApi = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/quotations/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al eliminar cotización');
  }

  if (response.status === 204) return {};
  return response.json().catch(() => ({}));
};

const updateQuotationStatusApi = async ({ id, status }: { id: number; status: Quotation["Status"] }) => {
  const response = await fetch(`${API_BASE_URL}/quotations/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeader(),
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al actualizar estado');
  }

  if (response.status === 204) return {};
  return response.json().catch(() => ({}));
};

export const useQuotationById = (id: string | undefined) => {
  return useQuery({
    queryKey: ["quotations", id],
    queryFn: () => fetchQuotationByIdApi(id!),
    enabled: !!id,
  });
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
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["quotations"] }),
        queryClient.invalidateQueries({ queryKey: ["quotations", String(variables.id)] })
      ]);
    },
  });


  // Facade
  const addQuotation = async (quotationData: Omit<Quotation, "ID" | "CreatedAt" | "UpdatedAt">) => {
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

  const deleteQuotation = async (id: string | number) => {
    try {
      await deleteMutation.mutateAsync(id.toString());
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const updateQuotationStatus = async (id: number, status: Quotation["Status"]) => {
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