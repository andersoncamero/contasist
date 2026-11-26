import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Product } from "@/entities/Product";
import { productService } from "@/services/productService";
import { useCompany } from "./useCompany";

export const useProduct = (companyId?: number) => {
  const queryClient = useQueryClient();
  const { activeCompanyId } = useCompany();
  const effectiveCompanyId = companyId ?? (activeCompanyId ? Number(activeCompanyId) : undefined);

  const queryKey = ["products", effectiveCompanyId ?? "none"];

  const query = useQuery({
    queryKey,
    queryFn: () => productService.getProducts(effectiveCompanyId),
    enabled: Boolean(effectiveCompanyId),
  });

  const addMutation = useMutation({
    mutationFn: (productData: Partial<Product>) =>
      productService.createProduct(productData, effectiveCompanyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Product> }) =>
      productService.updateProduct(id, data, effectiveCompanyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      productService.deleteProduct(id, effectiveCompanyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const addProduct = async (product: Partial<Product>) => {
    try {
      const created = await addMutation.mutateAsync(product);
      return { success: true, data: created };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const updateProduct = async (id: number, data: Partial<Product>) => {
    try {
      const updated = await updateMutation.mutateAsync({ id, data });
      return { success: true, data: updated };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  return {
    products: query.data || [],
    isLoading: query.isLoading || addMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    error: query.error ? (query.error as Error).message : null,
    refetch: async () => { await query.refetch(); },
    addProduct,
    updateProduct,
    deleteProduct,
  };
};
