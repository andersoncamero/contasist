import { useMemo } from "react";
import { InventoryMovement, MovementType } from "@/entities/InventoryMovement";
import { Product } from "@/entities/Product";
import { useInventory } from "./useInventory";

export interface KardexLine {
    date: string;
    description: string;
    type: MovementType | "INICIAL";
    // Entradas
    inQty: number;
    inCost: number;
    inTotal: number;
    // Salidas
    outQty: number;
    outCost: number;
    outTotal: number;
    // Saldos
    balanceQty: number;
    balanceCost: number;
    balanceTotal: number;
}

export const useKardex = (product: Product | null) => {
    const { getMovementsByProduct } = useInventory();

    const kardex = useMemo(() => {
        if (!product) return [];

        const prodIdStr = String(product.id || product.ID);
        const movements = getMovementsByProduct(prodIdStr);
        const lines: KardexLine[] = [];

        const initStock = product.InitialStock ?? product.initialStock ?? 0;
        const prodPrice = product.BasePrice ?? product.Price ?? product.price ?? 0;

        let currentQty = initStock;
        let currentTotal = initStock * (prodPrice * 0.6);
        let currentCost = currentQty > 0 ? currentTotal / currentQty : 0;

        lines.push({
            date: "Saldo Inicial",
            description: "SALDO INICIAL",
            type: "INICIAL",
            inQty: 0, inCost: 0, inTotal: 0,
            outQty: 0, outCost: 0, outTotal: 0,
            balanceQty: currentQty,
            balanceCost: currentCost,
            balanceTotal: currentTotal
        });

        // Procesar movimientos
        movements.forEach(m => {
            if (m.type === MovementType.ENTRADA) {
                currentQty += m.quantity;
                currentTotal += m.totalPrice;
                currentCost = currentTotal / currentQty;

                lines.push({
                    date: m.date,
                    description: m.description || "Entrada de Almacén",
                    type: MovementType.ENTRADA,
                    inQty: m.quantity, inCost: m.unitPrice, inTotal: m.totalPrice,
                    outQty: 0, outCost: 0, outTotal: 0,
                    balanceQty: currentQty,
                    balanceCost: currentCost,
                    balanceTotal: currentTotal
                });
            } else {
                // SALIDA
                const costOfSale = m.quantity * currentCost;
                currentQty -= m.quantity;
                currentTotal -= costOfSale;
                // El costo promedio solo cambia en las entradas

                lines.push({
                    date: m.date,
                    description: m.description || "Salida de Almacén",
                    type: MovementType.SALIDA,
                    inQty: 0, inCost: 0, inTotal: 0,
                    outQty: m.quantity, outCost: currentCost, outTotal: costOfSale,
                    balanceQty: currentQty,
                    balanceCost: currentCost,
                    balanceTotal: currentTotal
                });
            }
        });

        return lines;
    }, [product, getMovementsByProduct]);

    return { kardex };
};
