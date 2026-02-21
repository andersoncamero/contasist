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
    const product = products.find(p => p.id === id) || null;
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
            title: `Kardex: ${product.name}`,
            subtitle: `Código: ${product.code} | Método: Promedio Ponderado`,
            filename: `Kardex_${product.code}`,
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
                            <p className="text-muted-foreground text-sm">Historial de movimientos: <span className="font-bold text-foreground">{product.name} ({product.code})</span></p>
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
                            <table className="w-full text-[13px] text-left">
                                <thead className="bg-muted/50 border-b">
                                    <tr className="divide-x divide-border">
                                        <th className="px-4 py-3" rowSpan={2}>Fecha</th>
                                        <th className="px-4 py-3" rowSpan={2}>Detalle</th>
                                        <th className="px-4 py-3 text-center bg-emerald-50/50" colSpan={3}>Entradas</th>
                                        <th className="px-4 py-3 text-center bg-rose-50/50" colSpan={3}>Salidas</th>
                                        <th className="px-4 py-3 text-center bg-blue-50/50" colSpan={3}>Saldos</th>
                                    </tr>
                                    <tr className="divide-x divide-border text-[10px] uppercase font-bold text-muted-foreground bg-muted/20">
                                        <th className="px-2 py-2 text-center bg-emerald-50/30">Cant</th>
                                        <th className="px-2 py-2 text-right bg-emerald-50/30">Costo</th>
                                        <th className="px-2 py-2 text-right bg-emerald-50/30">Total</th>

                                        <th className="px-2 py-2 text-center bg-rose-50/30">Cant</th>
                                        <th className="px-2 py-2 text-right bg-rose-50/30">Costo</th>
                                        <th className="px-2 py-2 text-right bg-rose-50/30">Total</th>

                                        <th className="px-2 py-2 text-center bg-blue-50/30">Cant</th>
                                        <th className="px-2 py-2 text-right bg-blue-50/30">Costo</th>
                                        <th className="px-2 py-2 text-right bg-blue-50/30">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {kardex.map((line, idx) => (
                                        <tr key={idx} className="divide-x divide-border hover:bg-muted/5">
                                            <td className="px-4 py-3 italic text-muted-foreground whitespace-nowrap">{line.date}</td>
                                            <td className="px-4 py-3 font-medium uppercase">{line.description}</td>

                                            {/* Entradas */}
                                            <td className="px-2 py-3 text-center bg-emerald-50/5">{line.inQty || "-"}</td>
                                            <td className="px-2 py-3 text-right text-emerald-600 bg-emerald-50/5">{line.inQty > 0 ? formatCurrency(line.inCost) : "-"}</td>
                                            <td className="px-2 py-3 text-right font-semibold text-emerald-700 bg-emerald-50/5">{line.inQty > 0 ? formatCurrency(line.inTotal) : "-"}</td>

                                            {/* Salidas */}
                                            <td className="px-2 py-3 text-center bg-rose-50/5">{line.outQty || "-"}</td>
                                            <td className="px-2 py-3 text-right text-rose-600 bg-rose-50/5">{line.outQty > 0 ? formatCurrency(line.outCost) : "-"}</td>
                                            <td className="px-2 py-3 text-right font-semibold text-rose-700 bg-rose-50/5">{line.outQty > 0 ? formatCurrency(line.outTotal) : "-"}</td>

                                            {/* Saldos */}
                                            <td className="px-2 py-3 text-center font-bold bg-blue-50/5">{line.balanceQty}</td>
                                            <td className="px-2 py-3 text-right bg-blue-50/5">{formatCurrency(line.balanceCost)}</td>
                                            <td className="px-2 py-3 text-right font-bold text-primary bg-blue-50/5">{formatCurrency(line.balanceTotal)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
};
