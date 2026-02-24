import React, { useState } from "react";
import { MainLayout } from "@/templates/MainLayout";
import {
    Box,
    Package,
    AlertTriangle,
    ArrowUpDown,
    Plus,
    FileText,
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
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/atoms/Badge";
import { useNavigate } from "react-router-dom";

export const InventoryDashboard = () => {
    const { products, isLoading } = useProduct();
    const { getProductStock } = useInventory();
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    const filteredProducts = products.filter(p => !p.isService && (
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
    ));

    const lowStockCount = filteredProducts.filter(p => getProductStock(p) <= p.minStock).length;

    return (
        <MainLayout>
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

                {/* Resumen */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-l-4 border-l-primary shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{filteredProducts.length}</div>
                            <p className="text-xs text-muted-foreground">Productos físicos registrados</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{lowStockCount}</div>
                            <p className="text-xs text-muted-foreground">Productos por debajo del mínimo</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Valor Estimado</CardTitle>
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">Calculando...</div>
                            <p className="text-xs text-muted-foreground">Valor total del inventario (Costo)</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Listado de Existencias */}
                <Card className="shadow-md border-none ring-1 ring-border">
                    <CardHeader className="border-b bg-muted/50">
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
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-muted/40 text-muted-foreground border-b italic">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold">Código</th>
                                        <th className="px-6 py-3 font-semibold">Producto</th>
                                        <th className="px-6 py-3 font-semibold text-center">Und.</th>
                                        <th className="px-6 py-3 font-semibold text-right">Existencias</th>
                                        <th className="px-6 py-3 font-semibold text-right">Mínimo</th>
                                        <th className="px-6 py-3 font-semibold text-center">Estado</th>
                                        <th className="px-6 py-3 font-semibold text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredProducts.map(product => {
                                        const stock = getProductStock(product);
                                        const isLow = stock <= product.minStock;

                                        return (
                                            <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-4 font-medium text-primary">{product.code}</td>
                                                <td className="px-6 py-4">{product.name}</td>
                                                <td className="px-6 py-4 text-center">{product.unit}</td>
                                                <td className="px-6 py-4 text-right font-bold text-base">
                                                    {stock}
                                                </td>
                                                <td className="px-6 py-4 text-right text-muted-foreground">
                                                    {product.minStock}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <Badge variant={isLow ? "destructive" : "success"}>
                                                        {isLow ? "Bajo Stock" : "Optimo"}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Ver Kardex" onClick={() => navigate(`/inventory/kardex/${product.id}`)}>
                                                            <FileText className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Movimientos" onClick={() => navigate("/inventory/movements/new")}>
                                                            <ArrowUpDown className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredProducts.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground italic">
                                                No se encontraron productos físicos.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
};
