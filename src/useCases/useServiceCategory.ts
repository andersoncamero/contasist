import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AddServiceCategoryReq,
  ServiceCategory,
  UpdateServiceCategoryReq,
} from "@/entities/ServiceCategory";
import {
  createServiceCategory,
  deleteServiceCategory,
  getServiceCategories,
  updateServiceCategory,
} from "@/services/serviceCategoryService";
import { useCompany } from "@/useCases/useCompany";

interface ActionResult {
  success: boolean;
  error?: string;
}

const SERVICE_CATEGORIES_QUERY_KEY = "serviceCategories";

export const useServiceCategory = () => {
  const queryClient = useQueryClient();
  const { activeCompanyId, hasCompanies } = useCompany();
  const numericCompanyId = activeCompanyId ? Number(activeCompanyId) : undefined;

  const query = useQuery<ServiceCategory[]>({
    queryKey: [SERVICE_CATEGORIES_QUERY_KEY, numericCompanyId],
    queryFn: () => getServiceCategories(numericCompanyId),
    enabled: Boolean(numericCompanyId),
  });

  const invalidateCategories = () =>
    queryClient.invalidateQueries({ queryKey: [SERVICE_CATEGORIES_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: (req: AddServiceCategoryReq) =>
      createServiceCategory(req, numericCompanyId),
    onSuccess: invalidateCategories,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, req }: { id: number; req: UpdateServiceCategoryReq }) =>
      updateServiceCategory(id, req, numericCompanyId),
    onSuccess: invalidateCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteServiceCategory(id, numericCompanyId),
    onSuccess: invalidateCategories,
  });

  const createCategory = async (req: AddServiceCategoryReq): Promise<ActionResult> => {
    try {
      await createMutation.mutateAsync(req);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error al crear la categoría",
      };
    }
  };

  const updateCategory = async (
    id: number,
    req: UpdateServiceCategoryReq
  ): Promise<ActionResult> => {
    try {
      await updateMutation.mutateAsync({ id, req });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error al actualizar la categoría",
      };
    }
  };

  const deleteCategory = async (id: number): Promise<ActionResult> => {
    try {
      await deleteMutation.mutateAsync(id);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error al eliminar la categoría",
      };
    }
  };

  return {
    categories: query.data ?? [],
    hasCompanies,
    isLoading: query.isLoading,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    error: query.error instanceof Error ? query.error.message : null,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
