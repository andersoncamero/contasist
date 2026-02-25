import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Product } from "@/entities/Product";
import { API_BASE_URL, getAuthHeader } from "@/services/apiConfig";

// Tipos de API
interface ApiProductResponse {
  ID: string;
  Code: string;
  Name: string;
  Description: string;
  Price: number;
  Unit: number;
  Category: string;
  IsService: boolean;
  InitialStock: number;
  MinStock: number;
  CreatedAt: Date;
}

// Mappers
const mapApiProduct = (apiProduct: ApiProductResponse): Product => ({
  ID: apiProduct.ID,
  Code: apiProduct.Code || "",
  Name: apiProduct.Name,
  Description: apiProduct.Description,
  Category: apiProduct.Category,
  Unit: apiProduct.Unit,
  Price: apiProduct.Price,
  IsService: apiProduct.IsService,
  InitialStock: apiProduct.InitialStock || 0,
  MinStock: apiProduct.MinStock || 0,
  CreatedAt: apiProduct.CreatedAt
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

const addProductApi = async (product: Omit<Product, "ID" | "CreatedAt">) => {
  console.log(product);
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify({
      code: product.Code,
      name: product.Name,
      description: product.Description,
      price: product.Price,
      unit: product.Unit,
      category: product.Category,
      isService: product.IsService,
      initialStock: product.InitialStock,
      minStock: product.MinStock,
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
      code: data.Code,
      name: data.Name,
      description: data.Description,
      price: data.Price,
      unit: data.Unit,
      category: data.Category,
      is_service: data.IsService,
      initial_stock: data.InitialStock,
      min_stock: data.MinStock,
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
