import React, { useState } from "react";
import { MainLayout } from "@/templates/MainLayout";
import {
    ArrowLeft,
    Save,
    Plus,
    Minus,
    Calendar,
    Hash,
    Tag,
    Info
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/molecules/Card";
import { Input } from "@/components/atoms/Input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/molecules/Select";
import { Label } from "@/components/atoms/Label";
import { Textarea } from "@/components/atoms/Textarea";
import { useProduct } from "@/useCases/useProduct";
import { useInventory } from "@/useCases/useInventory";
import { MovementType } from "@/entities/InventoryMovement";
import { formatCurrency } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const InventoryMovementNew = () => {
    const { products } = useProduct();
    const { addMovement, getProductStock } = useInventory();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        productId: "",
        type: MovementType.ENTRADA,
        quantity: 0,
        unitPrice: 0,
        date: new Date().toISOString().split("T")[0],
        reference: "",
        description: ""
    });

    const physicalProducts = products.filter(p => !p.isService);
    const selectedProduct = physicalProducts.find(p => p.id === formData.productId);
    const currentStock = selectedProduct ? getProductStock(selectedProduct) : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.productId) {
            toast.error("Seleccione un producto");
            return;
        }

        if (formData.quantity <= 0) {
            toast.error("La cantidad debe ser mayor a cero");
            return;
        }

        if (formData.type === MovementType.SALIDA && formData.quantity > currentStock) {
            toast.error("No hay suficiente stock disponible para esta salida");
            return;
        }

        const result = await addMovement({
            productId: formData.productId,
            productName: selectedProduct?.name || "",
            type: formData.type,
            quantity: formData.quantity,
            unitPrice: formData.unitPrice,
            totalPrice: formData.quantity * formData.unitPrice,
            date: formData.date,
            reference: formData.reference,
            description: formData.description
        });

        if (result.success) {
            toast.success("Movimiento registrado correctamente");
            navigate("/inventory");
        }
    };

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto p-6 flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/inventory")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Registrar Movimiento</h1>
                        <p className="text-muted-foreground text-sm">Entradas y salidas manuales de almacén.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Detalles del Movimiento</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Producto</Label>
                                    <Select
                                        value={formData.productId}
                                        onValueChange={(val) => setFormData({ ...formData, productId: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione producto..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {physicalProducts.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.code} - {p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Tipo de Movimiento</Label>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant={formData.type === MovementType.ENTRADA ? "default" : "outline"}
                                            className="flex-1"
                                            onClick={() => setFormData({ ...formData, type: MovementType.ENTRADA })}
                                        >
                                            <Plus className="h-4 w-4 mr-2 text-emerald-500" />
                                            Entrada
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={formData.type === MovementType.SALIDA ? "default" : "outline"}
                                            className="flex-1"
                                            onClick={() => setFormData({ ...formData, type: MovementType.SALIDA })}
                                        >
                                            <Minus className="h-4 w-4 mr-2 text-rose-500" />
                                            Salida
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Cantidad</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Costo Unitario</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={formData.unitPrice}
                                        onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Fecha</Label>
                                    <Input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Referencia / Documento</Label>
                                <Input
                                    placeholder="Ej: Factura #123, Remisión, etc."
                                    value={formData.reference}
                                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Descripción</Label>
                                <Textarea
                                    placeholder="Observaciones adicionales..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card className="bg-muted/30">
                            <CardHeader>
                                <CardTitle className="text-sm">Resumen de Totales</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span>Total Valor:</span>
                                    <span className="font-bold">{formatCurrency(formData.quantity * formData.unitPrice)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Stock Actual:</span>
                                    <span className="font-medium">{currentStock}</span>
                                </div>
                                <div className="flex justify-between text-sm border-t pt-2 mt-2">
                                    <span>Stock Post-Movimiento:</span>
                                    <span className={`font-bold ${formData.type === MovementType.ENTRADA ? "text-emerald-600" : "text-rose-600"}`}>
                                        {formData.type === MovementType.ENTRADA
                                            ? currentStock + formData.quantity
                                            : currentStock - formData.quantity}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Button type="submit" className="w-full h-12 shadow-lg" size="lg">
                            <Save className="h-5 w-5 mr-2" />
                            Guardar Movimiento
                        </Button>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
};
