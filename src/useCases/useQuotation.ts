import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Quotation } from "@/entities/Quotation";
import { QuotationItem } from "@/entities/QuotationItem";
import { API_BASE_URL, getFetchOptions } from "@/services/apiConfig";
import { useCompany } from "./useCompany";

interface ApiQuotationItemResponse {
  ID?: number;
  id?: number;
  ProductID?: number;
  productID?: number;
  product_id?: number;
  Product?: {
    Name?: string;
    Description?: string;
    name?: string;
    description?: string;
  };
  product?: {
    Name?: string;
    Description?: string;
    name?: string;
    description?: string;
  };
  Quantity?: number;
  quantity?: number;
  UnitPrice?: number;
  unitPrice?: number;
  Discount?: number;
  discount?: number;
  Subtotal?: number;
  subtotal?: number;
}

interface ApiQuotationResponse {
  ID?: number;
  id?: number;
  Number?: string;
  number?: string;
  ClientID?: number;
  clientID?: number;
  client_id?: number;
  ClientName?: string;
  clientName?: string;
  items?: ApiQuotationItemResponse[];
  QuotationItems?: ApiQuotationItemResponse[];
  Subtotal?: number;
  subtotal?: number;
  TaxRate?: number;
  taxRate?: number;
  TaxAmount?: number;
  taxAmount?: number;
  Total?: number;
  total?: number;
  Status?: 'draft' | 'sent' | 'approved' | 'rejected';
  status?: 'draft' | 'sent' | 'approved' | 'rejected';
  Note?: string;
  note?: string;
  ValidUntil?: string;
  validUntil?: string;
  CreatedAt?: string;
  createdAt?: string;
  UpdatedAt?: string;
  updatedAt?: string;
}

const mapApiQuotationItem = (item: any): QuotationItem => ({
  ID: Number(item?.id ?? item?.ID ?? 0),
  ProductID: Number(item?.productID ?? item?.ProductID ?? item?.product_id ?? 0),
  ProductName: item?.productName ?? item?.ProductName ?? item?.Product?.Name ?? item?.Product?.name ?? item?.product?.Name ?? item?.product?.name ?? '',
  Description: item?.description ?? item?.Description ?? item?.Product?.Description ?? item?.Product?.description ?? item?.product?.Description ?? item?.product?.description ?? '',
  Quantity: Number(item?.quantity ?? item?.Quantity ?? 0),
  UnitPrice: Number(item?.unitPrice ?? item?.UnitPrice ?? 0),
  Discount: Number(item?.discount ?? item?.Discount ?? 0),
  Subtotal: Number(item?.subtotal ?? item?.Subtotal ?? 0),
});

const mapApiQuotation = (apiQuotation: any): Quotation => {
  const rawId = apiQuotation?.id ?? apiQuotation?.ID ?? 0;
  const rawItems = apiQuotation?.items ?? apiQuotation?.QuotationItems ?? apiQuotation?.quotationItems ?? [];
  const clientObj = apiQuotation?.Client ?? apiQuotation?.client;
  const clientName = apiQuotation?.clientName ?? apiQuotation?.ClientName ?? clientObj?.Name ?? clientObj?.name ?? '';
  const clientEmail = apiQuotation?.clientEmail ?? apiQuotation?.ClientEmail ?? clientObj?.Email ?? clientObj?.email ?? '';
  const clientPhone = apiQuotation?.clientPhone ?? apiQuotation?.ClientPhone ?? clientObj?.Phone ?? clientObj?.phone ?? '';
  const clientAddress = apiQuotation?.clientAddress ?? apiQuotation?.ClientAddress ?? clientObj?.Address ?? clientObj?.address ?? '';
  const clientCompany = apiQuotation?.clientCompany ?? apiQuotation?.ClientCompany ?? clientObj?.Company ?? clientObj?.company ?? '';
  
  return {
    ID: Number(rawId),
    Number: apiQuotation?.number ?? apiQuotation?.Number ?? '',
    ClientID: Number(apiQuotation?.clientID ?? apiQuotation?.ClientID ?? apiQuotation?.client_id ?? clientObj?.id ?? clientObj?.ID ?? 0),
    ClientName: clientName,
    ClientEmail: clientEmail,
    ClientPhone: clientPhone,
    ClientAddress: clientAddress,
    ClientCompany: clientCompany,
    Client: clientObj,
    Items: Array.isArray(rawItems) ? rawItems.map(mapApiQuotationItem) : [],
    Subtotal: Number(apiQuotation?.subtotal ?? apiQuotation?.Subtotal ?? 0),
    TaxRate: Number(apiQuotation?.taxRate ?? apiQuotation?.TaxRate ?? 0),
    TaxAmount: Number(apiQuotation?.taxAmount ?? apiQuotation?.TaxAmount ?? 0),
    Total: Number(apiQuotation?.total ?? apiQuotation?.Total ?? 0),
    Status: apiQuotation?.status ?? apiQuotation?.Status ?? 'sent',
    Note: apiQuotation?.note ?? apiQuotation?.Note ?? apiQuotation?.notes ?? apiQuotation?.Notes ?? '',
    IntroductionText: apiQuotation?.introductionText ?? apiQuotation?.IntroductionText ?? '',
    ScopeDetails: apiQuotation?.scopeDetails ?? apiQuotation?.ScopeDetails ?? '',
    WarrantyInfo: apiQuotation?.warrantyInfo ?? apiQuotation?.WarrantyInfo ?? '',
    PaymentTerms: apiQuotation?.paymentTerms ?? apiQuotation?.PaymentTerms ?? '',
    ValidUntil: apiQuotation?.validUntil || apiQuotation?.ValidUntil ? new Date(apiQuotation.validUntil || apiQuotation.ValidUntil) : new Date(),
    CreatedAt: apiQuotation?.createdAt || apiQuotation?.CreatedAt ? new Date(apiQuotation.createdAt || apiQuotation.CreatedAt) : new Date(),
    UpdatedAt: apiQuotation?.updatedAt || apiQuotation?.UpdatedAt ? new Date(apiQuotation.updatedAt || apiQuotation.UpdatedAt) : new Date(),
  };
};

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
  IntroductionText: quotation.IntroductionText,
  ScopeDetails: quotation.ScopeDetails,
  WarrantyInfo: quotation.WarrantyInfo,
  PaymentTerms: quotation.PaymentTerms,
  ValidUntil: quotation.ValidUntil?.toISOString(),
});

const fetchQuotationsApi = async (companyId?: number): Promise<Quotation[]> => {
  const response = await fetch(`${API_BASE_URL}/quotations`, getFetchOptions(companyId));
  if (!response.ok) throw new Error('Error al obtener cotizaciones');
  const data = await response.json();
  if (!Array.isArray(data)) return [];
  return data.map(mapApiQuotation);
};

const fetchQuotationByIdApi = async (id: string | number, companyId?: number): Promise<Quotation> => {
  if (!id || id === 'undefined') throw new Error('ID de cotización no provisto');
  const response = await fetch(`${API_BASE_URL}/quotations/${id}`, getFetchOptions(companyId));
  if (!response.ok) {
    if (response.status === 404) throw new Error('Cotización no encontrada');
    throw new Error('Error al obtener la cotización');
  }
  const data: ApiQuotationResponse = await response.json();
  return mapApiQuotation(data);
};

const addQuotationApi = async (quotationData: Omit<Quotation, "ID" | "CreatedAt" | "UpdatedAt">) => {
  const response = await fetch(`${API_BASE_URL}/quotations`, getFetchOptions(undefined, {
    method: 'POST',
    body: JSON.stringify(mapQuotationToApi(quotationData)),
  }));

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al crear cotización');
  }

  if (response.status === 204) return {};
  return response.json().catch(() => ({}));
};

const updateQuotationApi = async ({ id, data }: { id: string; data: Partial<Quotation> }) => {
  if (!id || id === 'undefined') throw new Error('ID de cotización no provisto');
  const response = await fetch(`${API_BASE_URL}/quotations/${id}`, getFetchOptions(undefined, {
    method: 'PUT',
    body: JSON.stringify(mapQuotationToApi(data)),
  }));

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al actualizar cotización');
  }

  if (response.status === 204) return {};
  return response.json().catch(() => ({}));
};

const deleteQuotationApi = async (id: string | number) => {
  if (!id || id === 'undefined') throw new Error('ID de cotización no provisto');
  const response = await fetch(`${API_BASE_URL}/quotations/${id}`, getFetchOptions(undefined, {
    method: 'DELETE',
  }));

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al eliminar cotización');
  }

  if (response.status === 204) return {};
  return response.json().catch(() => ({}));
};

const updateQuotationStatusApi = async ({ id, status }: { id: number | string; status: Quotation["Status"] }) => {
  if (!id || id === 'undefined') throw new Error('ID de cotización no provisto');
  const response = await fetch(`${API_BASE_URL}/quotations/${id}/status`, getFetchOptions(undefined, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }));

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al actualizar estado');
  }

  if (response.status === 204) return {};
  return response.json().catch(() => ({}));
};

export const useQuotationById = (id: string) => {
  const { activeCompanyId } = useCompany();
  const numericCompanyId = activeCompanyId ? Number(activeCompanyId) : undefined;

  return useQuery({
    queryKey: ['quotation', id, activeCompanyId],
    queryFn: () => fetchQuotationByIdApi(id, numericCompanyId),
    enabled: Boolean(numericCompanyId) && !!id && id !== 'undefined',
  });
};

export const useQuotation = () => {
  const queryClient = useQueryClient();
  const { activeCompanyId } = useCompany();
  const numericCompanyId = activeCompanyId ? Number(activeCompanyId) : undefined;

  const query = useQuery({
    queryKey: ['quotations', activeCompanyId],
    queryFn: () => fetchQuotationsApi(numericCompanyId),
    enabled: Boolean(numericCompanyId),
  });

  const addMutation = useMutation({
    mutationFn: addQuotationApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateQuotationApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteQuotationApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: updateQuotationStatusApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });

  const updateQuotationStatus = async (id: number | string, status: Quotation["Status"]) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotation', String(id)] });
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const deleteQuotation = async (id: number | string) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    quotations: query.data || [],
    isLoading: query.isLoading || addMutation.isPending || updateMutation.isPending || deleteMutation.isPending || updateStatusMutation.isPending,
    error: query.error ? (query.error as Error).message : null,
    fetchQuotations: async () => { await query.refetch(); },
    fetchQuotationById: fetchQuotationByIdApi,
    addQuotation: addMutation.mutateAsync,
    updateQuotation: updateMutation.mutateAsync,
    deleteQuotation,
    updateQuotationStatus,
  };
};