import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Invoice } from "@/entities/Invoice";
import { API_BASE_URL, getFetchOptions } from "@/services/apiConfig";
import { useCompany } from "./useCompany";

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

const fetchInvoicesApi = async (filter?: { status?: string; clientId?: number }, companyId?: number): Promise<Invoice[]> => {
  const params = new URLSearchParams();
  if (filter?.status) params.append("status", filter.status);
  if (filter?.clientId) params.append("clientId", filter.clientId.toString());

  const url = `${API_BASE_URL}/invoices${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await fetch(url, getFetchOptions(companyId));
  const data = await parseResponseJson(response);
  if (Array.isArray(data)) return data;
  return [];
};

const fetchInvoiceByIdApi = async (id: string | number, companyId?: number): Promise<Invoice | null> => {
  if (!id) return null;
  const response = await fetch(`${API_BASE_URL}/invoices/${id}`, getFetchOptions(companyId));
  return parseResponseJson(response);
};

export const useInvoices = (filter?: { status?: string; clientId?: number }) => {
  const { activeCompanyId } = useCompany();
  const numericCompanyId = activeCompanyId ? Number(activeCompanyId) : undefined;

  return useQuery({
    queryKey: ["invoices", filter, activeCompanyId],
    queryFn: () => fetchInvoicesApi(filter, numericCompanyId),
    enabled: Boolean(numericCompanyId),
  });
};

export const useInvoiceById = (id?: string | number) => {
  const { activeCompanyId } = useCompany();
  const numericCompanyId = activeCompanyId ? Number(activeCompanyId) : undefined;

  return useQuery({
    queryKey: ["invoice", id, activeCompanyId],
    queryFn: () => (id ? fetchInvoiceByIdApi(id, numericCompanyId) : null),
    enabled: Boolean(numericCompanyId) && !!id,
  });
};

export const useInvoice = () => {
  const queryClient = useQueryClient();
  const { data: invoices = [], isLoading, error, refetch } = useInvoices();

  const createInvoiceMutation = useMutation({
    mutationFn: async (payload: any) => {
      const response = await fetch(`${API_BASE_URL}/invoices`, getFetchOptions(undefined, {
        method: "POST",
        body: JSON.stringify(payload),
      }));
      return parseResponseJson(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  const convertQuotationMutation = useMutation({
    mutationFn: async ({ quotationId, data }: { quotationId: number; data?: any }) => {
      const response = await fetch(`${API_BASE_URL}/invoices/from-quotation/${quotationId}`, getFetchOptions(undefined, {
        method: "POST",
        body: JSON.stringify(data || {}),
      }));
      return parseResponseJson(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["quotation"] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`${API_BASE_URL}/invoices/${id}/status`, getFetchOptions(undefined, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }));
      return parseResponseJson(response);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice", variables.id] });
    },
  });

  const registerPaymentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { amount: number; paymentDate: string; paymentMethod: string; notes?: string } }) => {
      const response = await fetch(`${API_BASE_URL}/invoices/${id}/payments`, getFetchOptions(undefined, {
        method: "POST",
        body: JSON.stringify(data),
      }));
      return parseResponseJson(response);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice", variables.id] });
    },
  });

  return {
    invoices,
    isLoading: isLoading || createInvoiceMutation.isPending || convertQuotationMutation.isPending,
    error,
    refetch,
    createInvoice: async (payload: any) => {
      try {
        const result = await createInvoiceMutation.mutateAsync(payload);
        return { success: true, data: result };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },
    convertQuotationToInvoice: async (quotationId: number, data?: any) => {
      try {
        const result = await convertQuotationMutation.mutateAsync({ quotationId, data });
        return { success: true, data: result };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },
    updateInvoiceStatus: async (id: number, status: string) => {
      try {
        const result = await updateStatusMutation.mutateAsync({ id, status });
        return { success: true, data: result };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },
    registerPayment: async (id: number, data: { amount: number; paymentDate: string; paymentMethod: string; notes?: string }) => {
      try {
        const result = await registerPaymentMutation.mutateAsync({ id, data });
        return { success: true, data: result };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },
  };
};

