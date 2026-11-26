import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { billingService } from "@/services/billingService";
import {
  BillingConfig,
  BillingConnectionTestResult,
  BillingSyncResult,
  EmitCreditNoteBody,
  EmitDocumentResult,
  EmitInvoiceBody,
  NumberingRange,
  UpdateBillingConfigBody,
} from "@/entities/billing";
import { DIAN_DOCUMENTS_QUERY_KEY } from "./useDianPortal";
import { useCompany } from "./useCompany";

export const BILLING_CONFIG_QUERY_KEY = ["billingConfig"];
export const BILLING_RANGES_QUERY_KEY = ["billingNumberingRanges"];

export const useBillingConfig = () => {
  const { activeCompanyId } = useCompany();

  return useQuery<BillingConfig, Error>({
    queryKey: [...BILLING_CONFIG_QUERY_KEY, activeCompanyId],
    queryFn: billingService.getConfig,
    enabled: Boolean(activeCompanyId),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateBillingConfig = () => {
  const queryClient = useQueryClient();
  const { activeCompanyId } = useCompany();

  return useMutation<BillingConfig, Error, UpdateBillingConfigBody>({
    mutationFn: (body: UpdateBillingConfigBody) => billingService.updateConfig(body),
    onSuccess: (data) => {
      queryClient.setQueryData([...BILLING_CONFIG_QUERY_KEY, activeCompanyId], data);
      queryClient.invalidateQueries({ queryKey: BILLING_CONFIG_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: BILLING_RANGES_QUERY_KEY });
    },
  });
};

export const useTestBillingConnection = () => {
  const queryClient = useQueryClient();

  return useMutation<BillingConnectionTestResult, Error, void>({
    mutationFn: billingService.testConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILLING_CONFIG_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: BILLING_RANGES_QUERY_KEY });
    },
  });
};

export const useBillingNumberingRanges = (enabled: boolean) => {
  const { activeCompanyId } = useCompany();

  return useQuery<NumberingRange[], Error>({
    queryKey: [...BILLING_RANGES_QUERY_KEY, activeCompanyId],
    queryFn: billingService.getNumberingRanges,
    enabled: Boolean(activeCompanyId) && enabled,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
};

export const useSyncBillingDocuments = () => {
  const queryClient = useQueryClient();

  return useMutation<BillingSyncResult, Error, void>({
    mutationFn: billingService.syncDocuments,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DIAN_DOCUMENTS_QUERY_KEY] });
    },
  });
};

export const useEmitInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation<EmitDocumentResult, Error, EmitInvoiceBody>({
    mutationFn: (body: EmitInvoiceBody) => billingService.emitInvoice(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DIAN_DOCUMENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: BILLING_RANGES_QUERY_KEY });
    },
  });
};

export const useEmitCreditNote = () => {
  const queryClient = useQueryClient();

  return useMutation<EmitDocumentResult, Error, EmitCreditNoteBody>({
    mutationFn: (body: EmitCreditNoteBody) => billingService.emitCreditNote(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DIAN_DOCUMENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: BILLING_RANGES_QUERY_KEY });
    },
  });
};
