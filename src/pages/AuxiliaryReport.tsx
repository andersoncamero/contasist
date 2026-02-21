import React from "react";
import { MainLayout } from "@/templates/MainLayout";
import { useAuxiliaryReport } from "@/useCases/useAuxiliaryReport";
import { AuxiliaryReportFilters } from "@/components/organisms/accounting/AuxiliaryReportFilters";
import { AuxiliaryReportTable } from "@/components/organisms/accounting/AuxiliaryReportTable";
import { Button } from "@/components/atoms/Button";
import { Printer, Download, FileSearch, HelpCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/atoms/Alert";
import { exportService } from "@/services/exportService";
import { formatCurrency } from "@/lib/utils";

export const AuxiliaryReport = () => {
    const {
        accounts,
        selectedAccountId,
        setSelectedAccountId,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        initialBalance,
        movements,
        finalBalance,
        account
    } = useAuxiliaryReport();

    const handleExportPDF = () => {
        if (!account || movements.length === 0) return;

        const headers = ["Fecha", "Documento", "Descripción", "Débito", "Crédito", "Saldo"];
        const data = movements.map(m => [
            m.Date,
            m.Reference || "-",
            m.EntryDescription || m.Description || "-",
            m.Debit > 0 ? formatCurrency(m.Debit) : "-",
            m.Credit > 0 ? formatCurrency(m.Credit) : "-",
            formatCurrency(m.RunningBalance)
        ]);

        exportService.exportToPDF({
            title: `AUXILIAR DE CUENTA: ${account.Code} - ${account.Name}`,
            subtitle: `Periodo: ${startDate} al ${endDate} | Saldo Inicial: ${formatCurrency(initialBalance)}`,
            filename: `Auxiliar_${account.Code}`,
            headers,
            data
        });
    };

    const handleExportExcel = () => {
        if (!account || movements.length === 0) return;

        const headers = ["Fecha", "Documento", "Descripción", "Débito", "Crédito", "Saldo"];
        const data = [
            [startDate, "-", "SALDO INICIAL", "-", "-", initialBalance],
            ...movements.map(m => [
                m.Date,
                m.Reference || "-",
                m.EntryDescription || m.Description || "-",
                m.Debit,
                m.Credit,
                m.RunningBalance
            ])
        ];

        exportService.exportToCSV({
            filename: `Auxiliar_${account.Code}`,
            headers,
            data
        });
    };

    return (
        <MainLayout>
            <div className="p-6 space-y-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-primary flex items-center gap-2">
                            <FileSearch className="h-8 w-8" />
                            Movimientos Auxiliares
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Consulta el detalle histórico y cronológico de cada cuenta contable.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="shadow-sm border-2"
                            onClick={handleExportExcel}
                            disabled={!selectedAccountId}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Excel
                        </Button>
                        <Button
                            variant="outline"
                            className="shadow-sm border-2"
                            onClick={handleExportPDF}
                            disabled={!selectedAccountId}
                        >
                            <Printer className="h-4 w-4 mr-2" />
                            PDF
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <AuxiliaryReportFilters
                    accounts={accounts}
                    selectedAccountId={selectedAccountId}
                    onAccountChange={setSelectedAccountId}
                    startDate={startDate}
                    onStartDateChange={setStartDate}
                    endDate={endDate}
                    onEndDateChange={setEndDate}
                />

                {/* Content */}
                {!selectedAccountId ? (
                    <Alert variant="default" className="bg-primary/5 border-primary/20 py-12 flex flex-col items-center text-center">
                        <HelpCircle className="h-12 w-12 text-primary/40 mb-4" />
                        <AlertTitle className="text-lg font-bold text-primary">Inicie una consulta</AlertTitle>
                        <AlertDescription className="text-muted-foreground max-w-md">
                            Seleccione una cuenta contable secundaria (nivel 4) y un rango de fechas para visualizar el historial de transacciones.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <AuxiliaryReportTable
                        account={account}
                        initialBalance={initialBalance}
                        movements={movements}
                        finalBalance={finalBalance}
                    />
                )}
            </div>
        </MainLayout>
    );
};

export default AuxiliaryReport;
