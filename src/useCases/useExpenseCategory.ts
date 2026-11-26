import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ExpenseCategory } from "@/entities/ExpenseCategory";
import { API_BASE_URL, getFetchOptions, parseResponseJson } from "@/services/apiConfig";
import { useCompany } from "./useCompany";

interface ApiCategoryResponse {
  ID: string;
  Name: string;
  Description?: string;
  Color?: string;
  created_at?: string;
}

const mapApiCategory = (apiCategory: ApiCategoryResponse): ExpenseCategory => ({
  ID: apiCategory.ID,
  Name: apiCategory.Name,
  Description: apiCategory.Description,
  Color: apiCategory.Color,
  CreatedAt: new Date(apiCategory.created_at || Date.now()),
});

const fetchCategoriesApi = async (companyId?: number): Promise<ExpenseCategory[]> => {
  const response = await fetch(`${API_BASE_URL}/expense-categories`, getFetchOptions(companyId));
  const data = (await parseResponseJson(response)) as ApiCategoryResponse[];
  return Array.isArray(data) ? data.map(mapApiCategory) : [];
};

const addCategoryApi = async (category: Omit<ExpenseCategory, "ID" | "CreatedAt">) => {
  const response = await fetch(`${API_BASE_URL}/expense-categories`, getFetchOptions(undefined, {
    method: "POST",
    body: JSON.stringify(category),
  }));
  return parseResponseJson(response);
};

const updateCategoryApi = async ({ id, data }: { id: string; data: Partial<ExpenseCategory> }) => {
  const response = await fetch(`${API_BASE_URL}/expense-categories/${id}`, getFetchOptions(undefined, {
    method: "PUT",
    body: JSON.stringify(data),
  }));
  return parseResponseJson(response);
};

const deleteCategoryApi = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/expense-categories/${id}`, getFetchOptions(undefined, {
    method: "DELETE",
  }));
  return parseResponseJson(response);
};

export const useExpenseCategory = () => {
  const queryClient = useQueryClient();
  const { activeCompanyId } = useCompany();
  const numericCompanyId = activeCompanyId ? Number(activeCompanyId) : undefined;

  const query = useQuery({
    queryKey: ["expense-categories", activeCompanyId],
    queryFn: () => fetchCategoriesApi(numericCompanyId),
    enabled: Boolean(numericCompanyId),
  });

  const addMutation = useMutation({
    mutationFn: addCategoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateCategoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
    },
  });

  return {
    categories: query.data || [],
    isLoading: query.isLoading || addMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    error: query.error ? (query.error as Error).message : null,
    fetchCategories: async () => { await query.refetch(); },
    addCategory: addMutation.mutateAsync,
    updateCategory: updateMutation.mutateAsync,
    deleteCategory: deleteMutation.mutateAsync,
  };
};
