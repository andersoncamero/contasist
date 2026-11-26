import React from "react";
import { MainLayout } from "@/templates/MainLayout";
import { useTrialBalance } from "@/useCases/useTrialBalance";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { Scale, Printer, Download } from "lucide-react";
import { exportService } from "@/services/exportService";
import { formatCurrency, cn } from "@/lib/utils";
import { SEO } from "@/components/atoms/SEO";
import { TableEmptyState } from "@/components/molecules/TableEmptyState";

export const TrialBalance = () => {
    const [startDate, setStartDate] = React.useState("");
    const [endDate, setEndDate] = React.useState("");
    const { data: rows = [], isLoading } = useTrialBalance({
        from: startDate || undefined,
        to: endDate || undefined,
    });

    const detailRows = rows.filter(row => row.level >= 3);
    const totalDebit = detailRows.reduce((sum, row) => sum + row.debit, 0);
    const totalCredit = detailRows.reduce((sum, row) => sum + row.credit, 0);
    const isBalanced = totalDebit === totalCredit;

    const handleExportCSV = () => {
        exportService.exportToCSV({
            filename: "Balance_de_Prueba",
            headers: ["Código", "Cuenta", "Débitos", "Créditos", "Saldo"],
            data: rows.map(row => [row.code, row.name, row.debit, row.credit, row.balance]),
        });
    };

    const handleExportPDF = () => {
        exportService.exportToPDF({
            title: "BALANCE DE PRUEBA",
            subtitle: `Generado el: ${new Date().toLocaleDateString()}`,
            filename: "Balance_de_Prueba",
            headers: ["Código", "Cuenta", "Débitos", "Créditos", "Saldo"],
            data: rows.map(row => [
                row.code,
                row.name,
                row.debit > 0 ? formatCurrency(row.debit) : "-",
                row.credit > 0 ? formatCurrency(row.credit) : "-",
                formatCurrency(row.balance),
            ]),
        });
    };

    return (
        <MainLayout>
            <SEO title="Balance de Prueba" description="Sumas y saldos por cuenta contable." />
            <div className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <Scale className="h-8 w-8" />
                            Balance de Prueba
                        </h1>
                        <p className="text-muted-foreground">
                            Sumas y saldos de todas las cuentas con movimiento, generado desde los comprobantes posteados.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleExportCSV}>
                            <Download className="h-4 w-4 mr-2" />
                            Excel
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExportPDF}>
                            <Printer className="h-4 w-4 mr-2" />
                            Imprimir PDF
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-card border-2 border-border rounded-xl shadow-sm">
                    <div className="space-y-2">
                        <Label htmlFor="startDate">Desde</Label>
                        <Input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="endDate">Hasta</Label>
                        <Input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <div className="flex items-end">
                        <div className={cn(
                            "text-sm px-4 py-2 rounded-full font-medium",
                            isBalanced ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        )}>
                            {isBalanced ? "Balance cuadrado" : "Balance descuadrado"}
                        </div>
                    </div>
                </div>

                <div className="border-2 border-border bg-card rounded-lg overflow-hidden">
                    <div className="table-header rounded-t-lg hidden md:flex gap-4 px-4 py-3 bg-muted font-bold text-xs uppercase tracking-wider">
                        <div className="w-28">Código</div>
                        <div className="flex-1">Cuenta</div>
                        <div className="w-32 text-right">Débitos</div>
                        <div className="w-32 text-right">Créditos</div>
                        <div className="w-32 text-right">Saldo</div>
                    </div>

                    <div className="divide-y divide-border">
                        {isLoading ? (
                            <div className="p-12 text-center text-muted-foreground italic">Cargando balance...</div>
                        ) : rows.length === 0 ? (
                            <div className="p-6">
                                <TableEmptyState
                                    compact
                                    icon={Scale}
                                    title="Sin Movimientos Contables"
                                    description="No hay movimientos contables en el rango seleccionado."
                                />
                            </div>
                        ) : (
                            rows.map((row) => (
                                <div
                                    key={row.accountId}
                                    className={cn(
                                        "flex gap-4 p-3 transition-colors hover:bg-accent/50 text-sm items-center",
                                        row.level === 1 && "bg-muted/30 font-bold text-base",
                                        row.level === 2 && "font-semibold"
                                    )}
                                >
                                    <div
                                        className="w-28 font-mono text-xs"
                                        style={{ paddingLeft: `${(row.level - 1) * 8}px` }}
                                    >
                                        {row.code}
                                    </div>
                                    <div className="flex-1 truncate">{row.name}</div>
                                    <div className="w-32 text-right text-xs text-muted-foreground">
                                        {row.debit !== 0 ? formatCurrency(row.debit) : "-"}
                                    </div>
                                    <div className="w-32 text-right text-xs text-muted-foreground">
                                        {row.credit !== 0 ? formatCurrency(row.credit) : "-"}
                                    </div>
                                    <div className={cn(
                                        "w-32 text-right font-medium",
                                        row.balance < 0 && "text-destructive"
                                    )}>
                                        {formatCurrency(row.balance)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {rows.length > 0 && (
                        <div className="flex gap-4 px-4 py-4 bg-muted/50 border-t-2 border-border font-bold text-sm">
                            <div className="w-28" />
                            <div className="flex-1 text-right pr-4">TOTALES</div>
                            <div className="w-32 text-right">{formatCurrency(totalDebit)}</div>
                            <div className="w-32 text-right">{formatCurrency(totalCredit)}</div>
                            <div className="w-32" />
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default TrialBalance;