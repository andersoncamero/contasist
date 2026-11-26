import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dianPortalService } from "@/services/dianPortalService";
import {
  DianDocument,
  DianDocumentDirection,
  DianSessionStatus,
  DianSyncResult,
  DianTokenRequestBody,
  DianTokenRequestResponse,
} from "@/entities/dian";
import { useCompany } from "./useCompany";

export const DIAN_SESSION_STATUS_QUERY_KEY = ["dianSessionStatus"];
export const DIAN_DOCUMENTS_QUERY_KEY = "dianDocuments";

export const useDianSessionStatus = () => {
  const { activeCompanyId } = useCompany();

  return useQuery<DianSessionStatus, Error>({
    queryKey: [DIAN_SESSION_STATUS_QUERY_KEY, activeCompanyId],
    queryFn: dianPortalService.getSessionStatus,
    enabled: Boolean(activeCompanyId),
    retry: false,
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60,
    staleTime: 1000 * 30,
  });
};

export const useDianRequestToken = () => {
  const queryClient = useQueryClient();

  return useMutation<DianTokenRequestResponse, Error, DianTokenRequestBody>({
    mutationFn: (body: DianTokenRequestBody) => dianPortalService.requestToken(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DIAN_SESSION_STATUS_QUERY_KEY] });
    },
  });
};

export const useDianSyncDocuments = () => {
  const queryClient = useQueryClient();

  return useMutation<DianSyncResult, Error, void>({
    mutationFn: () => dianPortalService.syncDocuments(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DIAN_DOCUMENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [DIAN_SESSION_STATUS_QUERY_KEY] });
    },
  });
};

export const useDianDocuments = (direction: DianDocumentDirection) => {
  const { activeCompanyId } = useCompany();

  return useQuery<DianDocument[], Error>({
    queryKey: [DIAN_DOCUMENTS_QUERY_KEY, direction, activeCompanyId],
    queryFn: () => dianPortalService.getSyncedDocuments(direction),
    enabled: Boolean(activeCompanyId),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
};
