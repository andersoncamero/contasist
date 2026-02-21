import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Product } from "@/entities/Product";
import { API_BASE_URL, getAuthHeader } from "@/services/apiConfig";

// Tipos de API
interface ApiProductResponse {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  is_service: boolean;
  initial_stock: number;
  min_stock: number;
}

// Mappers
const mapApiProduct = (apiProduct: ApiProductResponse): Product => ({
  id: apiProduct.id,
  code: apiProduct.code || "",
  name: apiProduct.name,
  description: apiProduct.description,
  category: apiProduct.category,
  unit: apiProduct.unit,
  price: apiProduct.price,
  isService: apiProduct.is_service,
  initialStock: apiProduct.initial_stock || 0,
  minStock: apiProduct.min_stock || 0,
});

// Funciones API
const fetchProductsApi = async (): Promise<Product[]> => {
  const response = await fetch(`${API_BASE_URL}/products`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error("Error al obtener productos");
  const data: ApiProductResponse[] = await response.json();
  return data.map(mapApiProduct);
};

const addProductApi = async (product: Omit<Product, "id">) => {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify({
      code: product.code,
      name: product.name,
      description: product.description,
      price: product.price,
      unit: product.unit,
      category: product.category,
      is_service: product.isService,
      initial_stock: product.initialStock,
      min_stock: product.minStock,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al crear producto");
  }
  return response.json();
};

const updateProductApi = async ({ id, data }: { id: string; data: Partial<Product> }) => {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "PUT",
    headers: getAuthHeader(),
    body: JSON.stringify({
      code: data.code,
      name: data.name,
      description: data.description,
      price: data.price,
      unit: data.unit,
      category: data.category,
      is_service: data.isService,
      initial_stock: data.initialStock,
      min_stock: data.minStock,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al actualizar producto");
  }
  return response.json();
};

const deleteProductApi = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al eliminar producto");
  }
  return response.json();
};

export const useProduct = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["products"],
    queryFn: fetchProductsApi,
  });

  const addMutation = useMutation({
    mutationFn: addProductApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateProductApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProductApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  // Facade
  const addProduct = async (product: Omit<Product, "id">) => {
    try {
      await addMutation.mutateAsync(product);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const updateProduct = async (id: string, data: Partial<Product>) => {
    try {
      await updateMutation.mutateAsync({ id, data });
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const deleteProduct = async (id: string) => {
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
    fetchProducts: async () => { await query.refetch(); },
    addProduct,
    updateProduct,
    deleteProduct,
  };
};
