import React from "react";
import { formatCurrency } from "@/lib/utils";
import { AccountWithBalance } from "@/useCases/useIncomeStatement";
import { cn } from "@/lib/utils";
import { Card } from "@/components/molecules/Card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface IncomeStatementReportProps {
    accounts: AccountWithBalance[];
    totals: {
        income: number;
        expenses: number;
        costs: number;
    };
    netIncome: number;
}

export function IncomeStatementReport({ accounts, totals, netIncome }: IncomeStatementReportProps) {
    return (
        <div className="space-y-8">
            {/* Resumen de Resultados */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 border-l-4 border-l-green-500">
                    <p className="text-sm text-muted-foreground font-medium">Ingresos Totales</p>
                    <p className="text-2xl font-bold">{formatCurrency(totals.income)}</p>
                </Card>
                <Card className="p-4 border-l-4 border-l-red-500">
                    <p className="text-sm text-muted-foreground font-medium">Costos Totales</p>
                    <p className="text-2xl font-bold">{formatCurrency(totals.costs)}</p>
                </Card>
                <Card className="p-4 border-l-4 border-l-orange-500">
                    <p className="text-sm text-muted-foreground font-medium">Gastos Totales</p>
                    <p className="text-2xl font-bold">{formatCurrency(totals.expenses)}</p>
                </Card>
                <Card className={cn(
                    "p-4 border-l-4 shadow-lg",
                    netIncome >= 0 ? "border-l-blue-600 bg-blue-50/30" : "border-l-destructive bg-destructive/10"
                )}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">Utilidad Neta</p>
                            <p className={cn(
                                "text-2xl font-black",
                                netIncome >= 0 ? "text-blue-700" : "text-destructive"
                            )}>
                                {formatCurrency(netIncome)}
                            </p>
                        </div>
                        {netIncome >= 0 ? (
                            <TrendingUp className="h-6 w-6 text-blue-600" />
                        ) : (
                            <TrendingDown className="h-6 w-6 text-destructive" />
                        )}
                    </div>
                </Card>
            </div>

            {/* Tabla Detallada */}
            <div className="border-2 border-border bg-card rounded-lg overflow-hidden">
                <div className="table-header rounded-t-lg flex gap-4 px-4 py-3 bg-muted font-bold text-xs uppercase tracking-wider">
                    <div className="w-24">Código</div>
                    <div className="flex-1">Cuenta de Resultado</div>
                    <div className="w-32 text-right">Débitos</div>
                    <div className="w-32 text-right">Créditos</div>
                    <div className="w-32 text-right">Saldo Final</div>
                </div>

                <div className="divide-y divide-border">
                    {accounts.map((acc) => (
                        <div
                            key={acc.ID}
                            className={cn(
                                "flex gap-4 p-3 transition-colors hover:bg-accent/50 text-sm items-center",
                                acc.Level === 1 && "bg-muted/30 font-bold text-base",
                                acc.Level === 2 && "font-semibold"
                            )}
                        >
                            <div
                                className="w-24 font-mono text-xs"
                                style={{ paddingLeft: `${(acc.Level - 1) * 8}px` }}
                            >
                                {acc.Code}
                            </div>
                            <div className="flex-1 truncate">
                                {acc.Name}
                            </div>
                            <div className="w-32 text-right text-xs text-muted-foreground">
                                {acc.DebitBalance !== 0 ? formatCurrency(acc.DebitBalance) : "-"}
                            </div>
                            <div className="w-32 text-right text-xs text-muted-foreground">
                                {acc.CreditBalance !== 0 ? formatCurrency(acc.CreditBalance) : "-"}
                            </div>
                            <div className={cn(
                                "w-32 text-right font-medium",
                                acc.TotalBalance < 0 && "text-destructive"
                            )}>
                                {formatCurrency(acc.TotalBalance)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
