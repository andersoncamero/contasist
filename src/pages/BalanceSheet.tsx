import React from "react";
import { MainLayout } from "@/templates/MainLayout";
import { BalanceSheetReport } from "@/components/organisms/accounting/BalanceSheetReport";
import { useBalanceSheet } from "@/useCases/useBalanceSheet";
import { FileText, Printer, Download } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { exportService } from "@/services/exportService";
import { formatCurrency } from "@/lib/utils";

export const BalanceSheet = () => {
    const { accounts, totals, isBalanced } = useBalanceSheet();

    const handleExportPDF = () => {
        const headers = ["Código", "Cuenta", "Débito", "Crédito", "Saldo"];
        const data = accounts.map(acc => [
            acc.Code,
            acc.Name,
            acc.DebitBalance > 0 ? formatCurrency(acc.DebitBalance) : "-",
            acc.CreditBalance > 0 ? formatCurrency(acc.CreditBalance) : "-",
            formatCurrency(acc.TotalBalance)
        ]);

        exportService.exportToPDF({
            title: "ESTADO DE SITUACIÓN FINANCIERA (BALANCE GENERAL)",
            subtitle: `Generado el: ${new Date().toLocaleDateString()}`,
            filename: "Balance_General",
            headers,
            data
        });
    };

    const handleExportExcel = () => {
        const headers = ["Código", "Cuenta", "Débito", "Crédito", "Saldo"];
        const data = accounts.map(acc => [
            acc.Code,
            acc.Name,
            acc.DebitBalance,
            acc.CreditBalance,
            acc.TotalBalance
        ]);

        exportService.exportToCSV({
            filename: "Balance_General",
            headers,
            data
        });
    };

    return (
        <MainLayout>
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Estado de Situación Financiera</h1>
                        <p className="text-muted-foreground">
                            Balance General acumulado a la fecha actual.
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

                <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-100 rounded-lg text-blue-800 text-sm">
                    <FileText className="h-5 w-5" />
                    <span>
                        Este reporte se genera automáticamente a partir de los asientos contables registrados en el sistema.
                    </span>
                </div>

                <BalanceSheetReport
                    accounts={accounts}
                    totals={totals}
                    isBalanced={isBalanced}
                />
            </div>
        </MainLayout>
    );
};

export default BalanceSheet;
