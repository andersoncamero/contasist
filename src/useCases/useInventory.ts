import { useState, useMemo, useEffect } from "react";
import { InventoryMovement, MovementType } from "@/entities/InventoryMovement";
import { Product } from "@/entities/Product";

const STORAGE_KEY = "contasist_inventory_movements";

export const useInventory = () => {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);

  // Cargar movimientos al inicio
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setMovements(JSON.parse(stored));
      } catch (e) {
        console.error("Error loading inventory movements", e);
      }
    }
  }, []);

  // Guardar movimientos
  const saveMovements = (newMovements: InventoryMovement[]) => {
    setMovements(newMovements);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newMovements));
  };

  const addMovement = async (movement: Omit<InventoryMovement, "id" | "createdAt">) => {
    const newMovement: InventoryMovement = {
      ...movement,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...movements, newMovement];
    saveMovements(updated);
    return { success: true, movement: newMovement };
  };

  /**
   * Calcula el stock actual de un producto considerando movimientos e inicial
   */
  const getProductStock = (product: Product) => {
    const productMovements = movements.filter(m => m.productId === product.id);
    const inOutBalance = productMovements.reduce((acc, current) => {
      if (current.type === MovementType.ENTRADA) return acc + current.quantity;
      if (current.type === MovementType.SALIDA) return acc - current.quantity;
      return acc;
    }, 0);
    
    return (product.initialStock || 0) + inOutBalance;
  };

  /**
   * Obtiene todos los movimientos de un producto específico
   */
  const getMovementsByProduct = (productId: string) => {
    return movements
      .filter(m => m.productId === productId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  return {
    movements,
    addMovement,
    getProductStock,
    getMovementsByProduct,
    isLoading: false, // Local por ahora
  };
};
