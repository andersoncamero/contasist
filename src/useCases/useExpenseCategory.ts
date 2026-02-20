import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ExpenseCategory } from "@/entities/ExpenseCategory";
import { API_BASE_URL, getAuthHeader } from "@/services/apiConfig";

// Tipos de API
interface ApiCategoryResponse {
  ID: string;
  Name: string;
  Description?: string;
  Color?: string;
  created_at?: string;
}

// Mappers
const mapApiCategory = (apiCategory: ApiCategoryResponse): ExpenseCategory => ({
  ID: apiCategory.ID,
  Name: apiCategory.Name,
  Description: apiCategory.Description,
  Color: apiCategory.Color,
  CreatedAt: new Date(apiCategory.created_at || Date.now()),
});

// Funciones API
const fetchCategoriesApi = async (): Promise<ExpenseCategory[]> => {
  const response = await fetch(`${API_BASE_URL}/expense-categories`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error("Error al obtener categorías de gastos");
  const data: ApiCategoryResponse[] = await response.json();
  return data.map(mapApiCategory);
};

const addCategoryApi = async (category: Omit<ExpenseCategory, "ID" | "CreatedAt">) => {
  const response = await fetch(`${API_BASE_URL}/expense-categories`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(category),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al crear categoría de gasto");
  }
  return response.json();
};

const updateCategoryApi = async ({ id, data }: { id: string; data: Partial<ExpenseCategory> }) => {
  const response = await fetch(`${API_BASE_URL}/expense-categories/${id}`, {
    method: "PUT",
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al actualizar categoría de gasto");
  }
  return response.json();
};

const deleteCategoryApi = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/expense-categories/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al eliminar categoría de gasto");
  }
  return response.json();
};

export const useExpenseCategory = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["expense-categories"],
    queryFn: fetchCategoriesApi,
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

  const addCategory = async (category: Omit<ExpenseCategory, "ID" | "CreatedAt">) => {
    try {
      await addMutation.mutateAsync(category);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const updateCategory = async (id: string, data: Partial<ExpenseCategory>) => {
    try {
      await updateMutation.mutateAsync({ id, data });
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  return {
    categories: query.data || [],
    isLoading: query.isLoading || addMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    error: query.error ? (query.error as Error).message : null,
    fetchCategories: async () => { await query.refetch(); },
    addCategory,
    updateCategory,
    deleteCategory,
  };
};
