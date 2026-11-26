import React, { useState } from "react";
import { MainLayout } from "@/templates/MainLayout";
import {
    Package,
    AlertTriangle,
    Plus,
    Search,
    TrendingUp,
    Boxes
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
import { useProduct } from "@/useCases/useProduct";
import { useInventory } from "@/useCases/useInventory";
import { Badge } from "@/components/atoms/Badge";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/atoms/SEO";
import { formatCurrency } from "@/lib/utils";
import { TableEmptyState } from "@/components/molecules/TableEmptyState";

export const InventoryDashboard = () => {
    const { products } = useProduct();
    const { getProductStock, getTotalInventoryValue } = useInventory();
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    const filteredProducts = products.filter(p => !p.IsService && (
        p.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.Code.toLowerCase().includes(searchTerm.toLowerCase())
    ));

    const lowStockCount = filteredProducts.filter(p => getProductStock(p) <= p.MinStock).length;
    const totalInventoryValue = getTotalInventoryValue(products);

    return (
        <MainLayout>
            <SEO title="Inventario" description="Control de stock y movimientos de inventario." />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <Boxes className="h-8 w-8" />
                            Control de Stock
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Control de existencias, movimientos y valoración de activos.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="default" className="shadow-md" onClick={() => navigate("/inventory/movements/new")}>
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Movimiento
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-l-4 border-l-primary shadow-sm overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{filteredProducts.length}</div>
                            <p className="text-xs text-muted-foreground">Productos físicos registrados</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500 shadow-sm overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{lowStockCount}</div>
                            <p className="text-xs text-muted-foreground">Productos por debajo del mínimo</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-emerald-500 shadow-sm overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Valor Estimado</CardTitle>
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(totalInventoryValue)}</div>
                            <p className="text-xs text-muted-foreground">Valor total del inventario (Costo)</p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="shadow-md border-2 border-border overflow-hidden rounded-2xl">
                    <CardHeader className="border-b bg-muted/50 p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle>Control de Existencias</CardTitle>
                                <CardDescription>Consulte el stock real de sus productos físicos.</CardDescription>
                            </div>
                            <div className="relative w-full md:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por nombre o código..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <div className="p-0">
                        <div className="overflow-x-auto">
                            <div className="hidden md:grid grid-cols-[100px_1fr_80px_100px_100px_120px_100px] gap-4 bg-muted/40 p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b">
                                <div>Código</div>
                                <div>Producto</div>
                                <div className="text-center">Und.</div>
                                <div className="text-right">Existencias</div>
                                <div className="text-right">Mínimo</div>
                                <div className="text-center">Estado</div>
                                <div className="text-right">Acciones</div>
                            </div>

                            {filteredProducts.length === 0 ? (
                                <div className="p-6">
                                    <TableEmptyState
                                        compact
                                        icon={Package}
                                        title="Sin Productos Físicos"
                                        description={
                                            searchTerm
                                                ? "No se encontraron productos que coincidan con tu búsqueda."
                                                : "Registra productos en el catálogo o agrega un movimiento de inventario."
                                        }
                                        actionLabel={!searchTerm ? "Nuevo Movimiento" : undefined}
                                        actionIcon={Plus}
                                        onAction={!searchTerm ? () => navigate("/inventory/movements/new") : undefined}
                                    />
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {filteredProducts.map((product) => {
                                        const stock = getProductStock(product);
                                        const isLow = stock <= product.MinStock;

                                        return (
                                            <div key={product.ID} className="transition-colors hover:bg-muted/30">
                                                <div className="hidden md:grid grid-cols-[100px_1fr_80px_100px_100px_120px_100px] gap-4 p-4 items-center text-sm">
                                                    <div className="font-medium text-primary font-mono">{product.Code}</div>
                                                    <div className="truncate font-medium">{product.Name}</div>
                                                    <div className="text-center text-muted-foreground">{product.Unit}</div>
                                                    <div className="text-right font-bold text-lg">{stock}</div>
                                                    <div className="text-right text-muted-foreground">{product.MinStock}</div>
                                                    <div className="flex justify-center">
                                                        <Badge variant={isLow ? "destructive" : "success"}>
                                                            {isLow ? "Bajo Stock" : "Optimo"}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => navigate(`/inventory/movements?product=${product.ID}`)}>
                                                            Ver Movimientos
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
};
