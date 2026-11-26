import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PriceList } from "@/entities/PriceList";
import { priceListService } from "@/services/priceListService";
import { useCompany } from "./useCompany";

export const usePriceList = (companyId?: number, search = "") => {
  const queryClient = useQueryClient();
  const { activeCompanyId } = useCompany();
  const effectiveCompanyId = companyId ?? (activeCompanyId ? Number(activeCompanyId) : undefined);
  const queryKey = ["priceLists", effectiveCompanyId ?? "none", search];

  const query = useQuery({
    queryKey,
    queryFn: () => priceListService.getPriceLists(effectiveCompanyId, search),
    enabled: Boolean(effectiveCompanyId),
  });

  const addMutation = useMutation({
    mutationFn: (data: Omit<PriceList, "id">) => priceListService.createPriceList(data, effectiveCompanyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["priceLists"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PriceList> }) =>
      priceListService.updatePriceList(id, data, effectiveCompanyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["priceLists"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => priceListService.deletePriceList(id, effectiveCompanyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["priceLists"] });
    },
  });

  const addPriceList = async (priceList: Omit<PriceList, "id">) => {
    try {
      const created = await addMutation.mutateAsync(priceList);
      return { success: true, data: created };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  const updatePriceList = async (id: number, data: Partial<PriceList>) => {
    try {
      const updated = await updateMutation.mutateAsync({ id, data });
      return { success: true, data: updated };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  const deletePriceList = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  const resolvePriceList = async (customerId?: number) => {
    try {
      const priceList = await priceListService.getPriceListByCustomer(customerId, effectiveCompanyId);
      return priceList;
    } catch {
      return undefined;
    }
  };

  return {
    priceLists: query.data || [],
    isLoading: query.isLoading || addMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    error: query.error ? (query.error as Error).message : null,
    refetch: async () => { await query.refetch(); },
    addPriceList,
    updatePriceList,
    deletePriceList,
    resolvePriceList,
  };
};
