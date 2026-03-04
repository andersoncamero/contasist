import React from "react";
import { MainLayout } from "@/templates/MainLayout";
import {
    ArrowLeft,
    FileText,
    Download,
    Calendar,
    BadgeInfo
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/molecules/Card";
import { useProduct } from "@/useCases/useProduct";
import { useKardex } from "@/useCases/useKardex";
import { useParams, useNavigate } from "react-router-dom";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/atoms/Badge";
import { exportService } from "@/services/exportService";

export const KardexReport = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { products } = useProduct();
    const product = products.find(p => p.ID === id) || null;
    const { kardex } = useKardex(product);

    if (!product) {
        return (
            <MainLayout>
                <div className="p-12 text-center">
                    <p className="text-muted-foreground">Producto no encontrado.</p>
                    <Button variant="link" onClick={() => navigate("/inventory")}>Volver</Button>
                </div>
            </MainLayout>
        );
    }

    const handleExportPDF = () => {
        const headers = ["Fecha", "Detalle", "Entrada (Q)", "Entrada ($)", "Salida (Q)", "Salida ($)", "Saldo (Q)", "Saldo ($)"];
        const data = kardex.map(line => [
            line.date,
            line.description,
            line.inQty || "-",
            line.inQty > 0 ? formatCurrency(line.inTotal) : "-",
            line.outQty || "-",
            line.outQty > 0 ? formatCurrency(line.outTotal) : "-",
            line.balanceQty,
            formatCurrency(line.balanceTotal)
        ]);

        exportService.exportToPDF({
            title: `Kardex: ${product.Name}`,
            subtitle: `Código: ${product.Code} | Método: Promedio Ponderado`,
            filename: `Kardex_${product.Code}`,
            headers,
            data,
            columnStyles: {
                0: { cellWidth: 25 },
                1: { cellWidth: 40 },
                2: { halign: 'center' },
                3: { halign: 'right' },
                4: { halign: 'center' },
                5: { halign: 'right' },
                6: { halign: 'center' },
                7: { halign: 'right', fontStyle: 'bold' }
            }
        });
    };

    return (
        <MainLayout>
            <div className="flex flex-col gap-6 p-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate("/inventory")}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <FileText className="h-6 w-6 text-primary" />
                                Kardex / Valoración
                            </h1>
                            <p className="text-muted-foreground text-sm">Historial de movimientos: <span className="font-bold text-foreground">{product.Name} ({product.Code})</span></p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={handleExportPDF}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar PDF
                    </Button>
                </div>

                <Card className="shadow-md overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Movimientos del Producto</CardTitle>
                            <Badge variant="outline" className="bg-background">Promedio Ponderado</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <div className="min-w-[1000px]">
                                {/* Macro Header */}
                                <div className="grid grid-cols-[100px_1.5fr_1fr_1fr_1fr] bg-muted/50 border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                    <div className="px-4 py-3 flex items-center justify-center border-r border-border">Fecha</div>
                                    <div className="px-4 py-3 flex items-center justify-center border-r border-border">Detalle</div>
                                    <div className="px-4 py-3 text-center bg-emerald-50/50 border-r border-border">Entradas</div>
                                    <div className="px-4 py-3 text-center bg-rose-50/50 border-r border-border">Salidas</div>
                                    <div className="px-4 py-3 text-center bg-blue-50/50">Saldos</div>
                                </div>

                                {/* Sub Header */}
                                <div className="grid grid-cols-[100px_1.5fr_repeat(9,minmax(0,1fr))] bg-muted/20 border-b border-border text-[10px] font-bold uppercase text-muted-foreground/70">
                                    <div className="px-4 py-2 border-r border-border"></div>
                                    <div className="px-4 py-2 border-r border-border"></div>
                                    {/* Entradas */}
                                    <div className="px-2 py-2 text-center bg-emerald-50/30 border-r border-border">Cant</div>
                                    <div className="px-2 py-2 text-right bg-emerald-50/30 border-r border-border">Costo</div>
                                    <div className="px-2 py-2 text-right bg-emerald-50/30 border-r border-border">Total</div>
                                    {/* Salidas */}
                                    <div className="px-2 py-2 text-center bg-rose-50/30 border-r border-border">Cant</div>
                                    <div className="px-2 py-2 text-right bg-rose-50/30 border-r border-border">Costo</div>
                                    <div className="px-2 py-2 text-right bg-rose-50/30 border-r border-border">Total</div>
                                    {/* Saldos */}
                                    <div className="px-2 py-2 text-center bg-blue-50/30 border-r border-border">Cant</div>
                                    <div className="px-2 py-2 text-right bg-blue-50/30 border-r border-border">Costo</div>
                                    <div className="px-2 py-2 text-right bg-blue-50/30">Total</div>
                                </div>

                                {/* Body */}
                                <div className="divide-y divide-border">
                                    {kardex.map((line, idx) => (
                                        <div key={idx} className="grid grid-cols-[100px_1.5fr_repeat(9,minmax(0,1fr))] text-[13px] hover:bg-muted/5 transition-colors">
                                            <div className="px-4 py-3 items-center flex italic text-muted-foreground border-r border-border truncate">{line.date}</div>
                                            <div className="px-4 py-3 items-center flex font-medium uppercase border-r border-border truncate">{line.description}</div>

                                            {/* Entradas */}
                                            <div className="px-2 py-3 items-center flex justify-center bg-emerald-50/5 border-r border-border">{line.inQty || "-"}</div>
                                            <div className="px-2 py-3 items-center flex justify-end text-emerald-600 bg-emerald-50/5 border-r border-border">{line.inQty > 0 ? formatCurrency(line.inCost) : "-"}</div>
                                            <div className="px-2 py-3 items-center flex justify-end font-semibold text-emerald-700 bg-emerald-50/5 border-r border-border">{line.inQty > 0 ? formatCurrency(line.inTotal) : "-"}</div>

                                            {/* Salidas */}
                                            <div className="px-2 py-3 items-center flex justify-center bg-rose-50/5 border-r border-border">{line.outQty || "-"}</div>
                                            <div className="px-2 py-3 items-center flex justify-end text-rose-600 bg-rose-50/5 border-r border-border">{line.outQty > 0 ? formatCurrency(line.outCost) : "-"}</div>
                                            <div className="px-2 py-3 items-center flex justify-end font-semibold text-rose-700 bg-rose-50/5 border-r border-border">{line.outQty > 0 ? formatCurrency(line.outTotal) : "-"}</div>

                                            {/* Saldos */}
                                            <div className="px-2 py-3 items-center flex justify-center font-bold bg-blue-50/5 border-r border-border">{line.balanceQty}</div>
                                            <div className="px-2 py-3 items-center flex justify-end bg-blue-50/5 border-r border-border">{formatCurrency(line.balanceCost)}</div>
                                            <div className="px-2 py-3 items-center flex justify-end font-bold text-primary bg-blue-50/5">{formatCurrency(line.balanceTotal)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
};
