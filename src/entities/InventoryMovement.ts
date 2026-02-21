export enum MovementType {
    ENTRADA = "ENTRADA",
    SALIDA = "SALIDA"
}

export interface InventoryMovement {
    id: string;
    productId: string;
    productName: string;
    date: string;
    type: MovementType;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    reference?: string; // Ej: No. Factura, No. Remisión
    description?: string;
    createdAt: string;
}
