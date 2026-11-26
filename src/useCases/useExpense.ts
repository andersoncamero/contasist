import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Expense } from "@/entities/Expense";
import { API_BASE_URL, getFetchOptions, parseResponseJson } from "@/services/apiConfig";
import { useCompany } from "./useCompany";

interface ApiExpenseResponse {
  ID: string;
  SupplierId: string;
  SupplierName?: string;
  CategoryId: string;
  CategoryName?: string;
  Date: string;
  DueDate: string;
  Amount: number;
  TaxAmount: number;
  TotalAmount: number;
  Status: "pending" | "paid" | "overdue";
  Reference?: string;
  Notes?: string;
  created_at?: string;
}

export interface ExpenseMutationResult {
  success: boolean;
  error?: string;
}

const mapApiExpense = (apiExpense: ApiExpenseResponse): Expense => ({
  ID: apiExpense.ID,
  SupplierId: apiExpense.SupplierId,
  SupplierName: apiExpense.SupplierName,
  CategoryId: apiExpense.CategoryId,
  CategoryName: apiExpense.CategoryName,
  Date: new Date(apiExpense.Date),
  DueDate: new Date(apiExpense.DueDate),
  Amount: apiExpense.Amount,
  TaxAmount: apiExpense.TaxAmount,
  TotalAmount: apiExpense.TotalAmount,
  Status: apiExpense.Status,
  Reference: apiExpense.Reference,
  Notes: apiExpense.Notes,
  CreatedAt: new Date(apiExpense.created_at || Date.now()),
});

const fetchExpensesApi = async (companyId?: number): Promise<Expense[]> => {
  const response = await fetch(`${API_BASE_URL}/expenses`, getFetchOptions(companyId));
  const data = (await parseResponseJson(response)) as ApiExpenseResponse[];
  return Array.isArray(data) ? data.map(mapApiExpense) : [];
};

const addExpenseApi = async (
  expense: Omit<Expense, "ID" | "CreatedAt" | "SupplierName" | "CategoryName">
) => {
  const response = await fetch(
    `${API_BASE_URL}/expenses`,
    getFetchOptions(undefined, {
      method: "POST",
      body: JSON.stringify(expense),
    })
  );
  return parseResponseJson(response);
};

const updateExpenseApi = async ({ id, data }: { id: string; data: Partial<Expense> }) => {
  const response = await fetch(
    `${API_BASE_URL}/expenses/${id}`,
    getFetchOptions(undefined, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  );
  return parseResponseJson(response);
};

const deleteExpenseApi = async (id: string) => {
  const response = await fetch(
    `${API_BASE_URL}/expenses/${id}`,
    getFetchOptions(undefined, {
      method: "DELETE",
    })
  );
  return parseResponseJson(response);
};

export const useExpense = () => {
  const queryClient = useQueryClient();
  const { activeCompanyId } = useCompany();
  const numericCompanyId = activeCompanyId ? Number(activeCompanyId) : undefined;

  const query = useQuery({
    queryKey: ["expenses", activeCompanyId],
    queryFn: () => fetchExpensesApi(numericCompanyId),
    enabled: Boolean(numericCompanyId),
  });

  const addMutation = useMutation({
    mutationFn: addExpenseApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateExpenseApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExpenseApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });

  const addExpense = async (
    expense: Omit<Expense, "ID" | "CreatedAt" | "SupplierName" | "CategoryName">
  ): Promise<ExpenseMutationResult> => {
    try {
      await addMutation.mutateAsync(expense);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error al registrar el gasto",
      };
    }
  };

  const updateExpense = async (
    id: string,
    data: Partial<Expense>
  ): Promise<ExpenseMutationResult> => {
    try {
      await updateMutation.mutateAsync({ id, data });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error al actualizar el gasto",
      };
    }
  };

  const markAsPaid = async (id: string): Promise<ExpenseMutationResult> => {
    return updateExpense(id, { Status: "paid" });
  };

  const deleteExpense = async (id: string): Promise<ExpenseMutationResult> => {
    try {
      await deleteMutation.mutateAsync(id);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error al eliminar el gasto",
      };
    }
  };

  return {
    expenses: query.data || [],
    isLoading:
      query.isLoading ||
      addMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
    error: query.error ? (query.error as Error).message : null,
    fetchExpenses: async () => {
      await query.refetch();
    },
    addExpense,
    updateExpense,
    markAsPaid,
    deleteExpense,
  };
};
