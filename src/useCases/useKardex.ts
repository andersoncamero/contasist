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

        const movements = getMovementsByProduct(product.id);
        const lines: KardexLine[] = [];

        // Saldo Inicial
        let currentQty = product.initialStock || 0;
        let currentTotal = (product.initialStock || 0) * (product.price * 0.6); // Asumimos un costo base del 60% del precio si no hay historial
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
