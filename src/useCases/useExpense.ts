import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Expense } from "@/entities/Expense";
import { API_BASE_URL, getAuthHeader } from "@/services/apiConfig";

// Tipos de API
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
  Status: 'pending' | 'paid' | 'overdue';
  Reference?: string;
  Notes?: string;
  created_at?: string;
}

// Mappers
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

// Funciones API
const fetchExpensesApi = async (): Promise<Expense[]> => {
  const response = await fetch(`${API_BASE_URL}/expenses`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error("Error al obtener los gastos");
  const data: ApiExpenseResponse[] = await response.json();
  return data.map(mapApiExpense);
};

const addExpenseApi = async (expense: Omit<Expense, "ID" | "CreatedAt" | "SupplierName" | "CategoryName">) => {
  const response = await fetch(`${API_BASE_URL}/expenses`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(expense),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al registrar el gasto");
  }
  return response.json();
};

const updateExpenseApi = async ({ id, data }: { id: string; data: Partial<Expense> }) => {
  const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: "PUT",
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al actualizar el gasto");
  }
  return response.json();
};

const deleteExpenseApi = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al eliminar el gasto");
  }
  return response.json();
};

export const useExpense = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["expenses"],
    queryFn: fetchExpensesApi,
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

  const addExpense = async (expense: Omit<Expense, "ID" | "CreatedAt" | "SupplierName" | "CategoryName">) => {
    try {
      await addMutation.mutateAsync(expense);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const updateExpense = async (id: string, data: Partial<Expense>) => {
    try {
      await updateMutation.mutateAsync({ id, data });
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const markAsPaid = async (id: string) => {
    return updateExpense(id, { Status: 'paid' });
  };

  return {
    expenses: query.data || [],
    isLoading: query.isLoading || addMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    error: query.error ? (query.error as Error).message : null,
    fetchExpenses: async () => { await query.refetch(); },
    addExpense,
    updateExpense,
    deleteExpense,
    markAsPaid,
  };
};
