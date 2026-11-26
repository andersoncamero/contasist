import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InventoryMovement, MovementType } from "@/entities/InventoryMovement";
import { Product } from "@/entities/Product";
import { API_BASE_URL, getFetchOptions, parseResponseJson } from "@/services/apiConfig";
import { useCompany } from "./useCompany";

const fetchMovementsApi = async (companyId?: number): Promise<InventoryMovement[]> => {
  const response = await fetch(`${API_BASE_URL}/inventory/movements`, getFetchOptions(companyId));
  const data = (await parseResponseJson(response)) as InventoryMovement[];
  return Array.isArray(data) ? data : [];
};

const createMovementApi = async (
  movement: Omit<InventoryMovement, "id" | "createdAt">
): Promise<InventoryMovement> => {
  const response = await fetch(
    `${API_BASE_URL}/inventory/movements`,
    getFetchOptions(undefined, {
      method: "POST",
      body: JSON.stringify(movement),
    })
  );
  return (await parseResponseJson(response)) as InventoryMovement;
};

const calculateProductValuation = (
  product: Product,
  productMovements: InventoryMovement[]
): { stock: number; value: number } => {
  const initialStock = product.InitialStock ?? product.initialStock ?? product.StockQuantity ?? 0;
  const basePrice = product.BasePrice ?? product.Price ?? product.price ?? 0;
  let qty = initialStock;
  let total = initialStock * (basePrice * 0.6);
  let avgCost = qty > 0 ? total / qty : 0;

  for (const m of productMovements) {
    if (m.type === MovementType.ENTRADA) {
      qty += m.quantity;
      total += m.totalPrice;
      avgCost = qty > 0 ? total / qty : m.unitPrice;
    } else {
      const costOut = m.quantity * avgCost;
      qty -= m.quantity;
      total -= costOut;
    }
  }

  return {
    stock: qty,
    value: Math.max(0, total),
  };
};

export const useInventory = () => {
  const queryClient = useQueryClient();
  const { activeCompanyId } = useCompany();
  const numericCompanyId = activeCompanyId ? Number(activeCompanyId) : undefined;

  const query = useQuery({
    queryKey: ["inventory-movements", activeCompanyId],
    queryFn: () => fetchMovementsApi(numericCompanyId),
    enabled: Boolean(numericCompanyId),
  });

  const addMutation = useMutation({
    mutationFn: createMovementApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-movements"] });
    },
  });

  const movements = useMemo(() => query.data ?? [], [query.data]);

  const addMovement = async (
    movement: Omit<InventoryMovement, "id" | "createdAt">
  ): Promise<{ success: boolean; movement?: InventoryMovement; error?: string }> => {
    try {
      const created = await addMutation.mutateAsync(movement);
      return { success: true, movement: created };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error al registrar el movimiento",
      };
    }
  };

  const getMovementsByProduct = useCallback(
    (productId: string) => {
      return movements
        .filter((m) => String(m.productId) === String(productId))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    },
    [movements]
  );

  const getProductStock = useCallback(
    (product: Product) => {
      const prodIdStr = String(product.id || product.ID);
      const productMovements = getMovementsByProduct(prodIdStr);
      const initialStock = product.InitialStock ?? product.initialStock ?? product.StockQuantity ?? 0;
      const net = productMovements.reduce((acc, current) => {
        if (current.type === MovementType.ENTRADA) return acc + current.quantity;
        if (current.type === MovementType.SALIDA) return acc - current.quantity;
        return acc;
      }, 0);
      return initialStock + net;
    },
    [getMovementsByProduct]
  );

  const getTotalInventoryValue = useCallback(
    (products: Product[]) => {
      return products
        .filter((p) => !p.IsService && p.ItemType !== "SERVICE")
        .reduce((sum, product) => {
          const prodIdStr = String(product.id || product.ID);
          const productMovements = getMovementsByProduct(prodIdStr);
          return sum + calculateProductValuation(product, productMovements).value;
        }, 0);
    },
    [getMovementsByProduct]
  );

  return {
    movements,
    addMovement,
    getProductStock,
    getMovementsByProduct,
    getTotalInventoryValue,
    isLoading: query.isLoading || addMutation.isPending,
  };
};
