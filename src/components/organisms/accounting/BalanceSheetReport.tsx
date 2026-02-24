import React from "react";
import { formatCurrency } from "@/lib/utils";
import { AccountWithBalance } from "@/useCases/useBalanceSheet";
import { cn } from "@/lib/utils";
import { Card } from "@/components/molecules/Card";

interface BalanceSheetReportProps {
    accounts: AccountWithBalance[];
    totals: {
        assets: number;
        liabilities: number;
        equity: number;
    };
    isBalanced: boolean;
}

export function BalanceSheetReport({ accounts, totals, isBalanced }: BalanceSheetReportProps) {
    return (
        <div className="space-y-8">
            {/* Resumen de Ecuación Contable */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 border-l-4 border-l-blue-500">
                    <p className="text-sm text-muted-foreground font-medium">Total Activos</p>
                    <p className="text-2xl font-bold">{formatCurrency(totals.assets)}</p>
                </Card>
                <Card className="p-4 border-l-4 border-l-orange-500">
                    <p className="text-sm text-muted-foreground font-medium">Total Pasivos</p>
                    <p className="text-2xl font-bold">{formatCurrency(totals.liabilities)}</p>
                </Card>
                <Card className="p-4 border-l-4 border-l-green-500">
                    <p className="text-sm text-muted-foreground font-medium">Total Patrimonio</p>
                    <p className="text-2xl font-bold">{formatCurrency(totals.equity)}</p>
                </Card>
            </div>

            {!isBalanced && (
                <div className="p-3 bg-destructive/10 border border-destructive text-destructive rounded-md text-sm font-medium">
                    Diferencia detectada: El Activo no es igual al Pasivo + Patrimonio. Revise los asientos contables.
                </div>
            )}

            {/* Tabla Detallada */}
            <div className="border-2 border-border bg-card rounded-lg overflow-hidden">
                <div className="table-header flex gap-4 px-4 py-3 bg-muted font-bold text-xs uppercase tracking-wider">
                    <div className="w-24">Código</div>
                    <div className="flex-1">Cuenta</div>
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

            <div className="flex justify-end p-4 bg-muted/50 rounded-lg border border-border">
                <div className="text-right space-y-1">
                    <p className="text-sm text-muted-foreground">Pasivo + Patrimonio:</p>
                    <p className="text-xl font-bold text-primary">
                        {formatCurrency(totals.liabilities + totals.equity)}
                    </p>
                </div>
            </div>
        </div>
    );
}
