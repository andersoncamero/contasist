import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dianEmailService } from "@/services/dianEmailService";
import {
  DianAuthUrlResponse,
  DianMonitorConfig,
  DianOAuthStatus,
  DianProvider,
  DianTokenResponse,
} from "@/entities/dian";

export const DIAN_OAUTH_STATUS_QUERY_KEY = ["dianOAuthStatus"];
export const DIAN_LATEST_TOKEN_QUERY_KEY = ["dianLatestToken"];
export const DIAN_MONITOR_CONFIG_QUERY_KEY = ["dianMonitorConfig"];

export const useDianOAuthStatus = () => {
  return useQuery<DianOAuthStatus, Error>({
    queryKey: DIAN_OAUTH_STATUS_QUERY_KEY,
    queryFn: dianEmailService.getOAuthStatus,
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: false,
    staleTime: 1000 * 60 * 5,
  });
};

export const useDianAuthUrl = () => {
  return useMutation<DianAuthUrlResponse, Error, DianProvider>({
    mutationFn: (provider: DianProvider) => dianEmailService.getAuthUrl(provider),
  });
};

export const useDianDisconnect = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DianProvider>({
    mutationFn: (provider: DianProvider) =>
      dianEmailService.disconnectProvider(provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DIAN_OAUTH_STATUS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DIAN_LATEST_TOKEN_QUERY_KEY });
    },
  });
};

export const useDianLatestToken = () => {
  return useQuery<DianTokenResponse, Error>({
    queryKey: DIAN_LATEST_TOKEN_QUERY_KEY,
    queryFn: dianEmailService.getLatestToken,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 1000 * 60 * 5,
  });
};

export const useDianMonitorConfig = () => {
  return useQuery<DianMonitorConfig, Error>({
    queryKey: DIAN_MONITOR_CONFIG_QUERY_KEY,
    queryFn: dianEmailService.getMonitorConfig,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: 1000 * 30,
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateDianMonitorConfig = () => {
  const queryClient = useQueryClient();

  return useMutation<DianMonitorConfig, Error, number>({
    mutationFn: (intervalMinutes: number) =>
      dianEmailService.updateMonitorConfig(intervalMinutes),
    onSuccess: (data) => {
      queryClient.setQueryData(DIAN_MONITOR_CONFIG_QUERY_KEY, data);
      queryClient.invalidateQueries({ queryKey: DIAN_MONITOR_CONFIG_QUERY_KEY });
    },
  });
};

export const useStartDianMonitor = () => {
  const queryClient = useQueryClient();

  return useMutation<DianMonitorConfig, Error, void>({
    mutationFn: dianEmailService.startMonitor,
    onSuccess: (data) => {
      queryClient.setQueryData(DIAN_MONITOR_CONFIG_QUERY_KEY, data);
      queryClient.invalidateQueries({ queryKey: DIAN_MONITOR_CONFIG_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DIAN_LATEST_TOKEN_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["dianSessionStatus"] });
    },
  });
};

export const useDianEmail = () => {
  const statusQuery = useDianOAuthStatus();
  const authUrlMutation = useDianAuthUrl();
  const disconnectMutation = useDianDisconnect();
  const latestTokenQuery = useDianLatestToken();
  const monitorConfigQuery = useDianMonitorConfig();
  const updateMonitorConfigMutation = useUpdateDianMonitorConfig();
  const startMonitorMutation = useStartDianMonitor();

  return {
    statusData: statusQuery.data,
    isStatusLoading: statusQuery.isLoading,
    isStatusError: statusQuery.isError,
    refetchStatus: statusQuery.refetch,

    getAuthUrl: authUrlMutation.mutate,
    getAuthUrlAsync: authUrlMutation.mutateAsync,
    isAuthUrlLoading: authUrlMutation.isPending,

    disconnectProvider: disconnectMutation.mutate,
    disconnectProviderAsync: disconnectMutation.mutateAsync,
    isDisconnecting: disconnectMutation.isPending,

    tokenData: latestTokenQuery.data,
    isTokenLoading: latestTokenQuery.isLoading,
    isTokenError: latestTokenQuery.isError,
    refetchToken: latestTokenQuery.refetch,
    isTokenRefetching: latestTokenQuery.isRefetching,

    monitorConfig: monitorConfigQuery.data,
    isMonitorConfigLoading: monitorConfigQuery.isLoading,
    updateMonitorInterval: updateMonitorConfigMutation.mutate,
    updateMonitorIntervalAsync: updateMonitorConfigMutation.mutateAsync,
    isUpdatingMonitorInterval: updateMonitorConfigMutation.isPending,

    startMonitor: startMonitorMutation.mutate,
    startMonitorAsync: startMonitorMutation.mutateAsync,
    isStartingMonitor: startMonitorMutation.isPending,
  };
};
