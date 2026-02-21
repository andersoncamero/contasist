import React from "react";
import { MainLayout } from "@/templates/MainLayout";
import { IncomeStatementReport } from "@/components/organisms/accounting/IncomeStatementReport";
import { useIncomeStatement } from "@/useCases/useIncomeStatement";
import { TrendingUp, Printer, Download, Calendar } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { exportService } from "@/services/exportService";
import { formatCurrency } from "@/lib/utils";

export const IncomeStatement = () => {
    const { accounts, totals, netIncome } = useIncomeStatement();

    const handleExportPDF = () => {
        const headers = ["Código", "Cuenta", "Saldo"];
        const data = accounts.map(acc => [
            acc.Code,
            acc.Name,
            formatCurrency(acc.TotalBalance)
        ]);

        exportService.exportToPDF({
            title: "ESTADO DE RESULTADOS INTEGRAL (P&G)",
            subtitle: `Generado el: ${new Date().toLocaleDateString()}`,
            filename: "Estado_Resultados",
            headers,
            data
        });
    };

    const handleExportExcel = () => {
        const headers = ["Código", "Cuenta", "Saldo"];
        const data = accounts.map(acc => [
            acc.Code,
            acc.Name,
            acc.TotalBalance
        ]);

        exportService.exportToCSV({
            filename: "Estado_Resultados",
            headers,
            data
        });
    };

    return (
        <MainLayout>
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Estado de Resultados</h1>
                        <p className="text-muted-foreground">
                            Utilidad o pérdida acumulada del periodo actual.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleExportExcel}>
                            <Download className="h-4 w-4 mr-2" />
                            Excel
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExportPDF}>
                            <Printer className="h-4 w-4 mr-2" />
                            Imprimir PDF
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-100 rounded-lg text-green-800 text-sm">
                    <Calendar className="h-5 w-5" />
                    <span>
                        Este informe resume los ingresos, costos y gastos para determinar la rentabilidad del negocio.
                    </span>
                </div>

                <IncomeStatementReport
                    accounts={accounts}
                    totals={totals}
                    netIncome={netIncome}
                />
            </div>
        </MainLayout>
    );
};

export default IncomeStatement;
