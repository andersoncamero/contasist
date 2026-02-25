import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Quotation } from "@/entities/Quotation";
import { QuotationItem } from "@/entities/QuotationItem";
import { API_BASE_URL, getAuthHeader } from "@/services/apiConfig";

// Tipos de API
interface ApiQuotationItemResponse {
  ID: string;
  ProductID: string;
  ProductName: string;
  Description: string;
  Quantity: number;
  UnitPrice: number;
  Discount: number;
  Subtotal: number;
}

interface ApiQuotationResponse {
  ID: string;
  Number: string;
  ClientID: string;
  ClientName: string;
  Items: ApiQuotationItemResponse[];
  Subtotal: number;
  TaxRate: number;
  TaxAmount: number;
  Total: number;
  Status: 'draft' | 'sent' | 'approved' | 'rejected';
  Notes?: string;
  ValidUntil: string;
  CreatedAt: string;
  UpdatedAt: string;
}

// Mappers
const mapApiQuotationItem = (item: ApiQuotationItemResponse): QuotationItem => ({
  ID: item.ID,
  ProductID: item.ProductID,
  ProductName: item.ProductName,
  Description: item.Description,
  Quantity: item.Quantity,
  UnitPrice: item.UnitPrice,
  Discount: item.Discount,
  Subtotal: item.Subtotal,
});

const mapApiQuotation = (apiQuotation: ApiQuotationResponse): Quotation => ({
  ID: apiQuotation.ID,
  Number: apiQuotation.Number,
  ClientID: apiQuotation.ClientID,
  ClientName: apiQuotation.ClientName,
  Items: apiQuotation.Items?.map(mapApiQuotationItem) || [],
  Subtotal: apiQuotation.Subtotal,
  TaxRate: apiQuotation.TaxRate,
  TaxAmount: apiQuotation.TaxAmount,
  Total: apiQuotation.Total,
  Status: apiQuotation.Status,
  Notes: apiQuotation.Notes,
  ValidUntil: new Date(apiQuotation.ValidUntil),
  CreatedAt: new Date(apiQuotation.CreatedAt),
  UpdatedAt: new Date(apiQuotation.UpdatedAt),
});

const mapQuotationToApi = (quotation: Partial<Quotation>) => ({
  Number: quotation.Number,
  ClientID: quotation.ClientID,
  ClientName: quotation.ClientName,
  Items: quotation.Items?.map((item) => ({
    ProductID: item.ProductID,
    ProductName: item.ProductName,
    Description: item.Description,
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
  Notes: quotation.Notes,
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

const updateQuotationStatusApi = async ({ id, status }: { id: string; status: Quotation["Status"] }) => {
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

  const updateQuotationStatus = async (id: string, status: Quotation["Status"]) => {
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