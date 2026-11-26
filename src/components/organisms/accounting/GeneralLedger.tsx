import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/molecules/Card";
import { TrialBalanceRow } from "@/entities/JournalEntry";
import { cn } from "@/lib/utils";
import { Calculator } from "lucide-react";
import { TableEmptyState } from "@/components/molecules/TableEmptyState";

interface GeneralLedgerProps {
    rows: TrialBalanceRow[];
    isLoading?: boolean;
}

export const GeneralLedger = ({ rows, isLoading = false }: GeneralLedgerProps) => {
    const ledgerData = rows.filter(row => row.debit > 0 || row.credit > 0);

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Libro Mayor y Balances</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <div className="min-w-[800px]">
                            {/* Header Desktop */}
                            <div className="hidden md:grid grid-cols-[100px_1fr_120px_120px_120px] bg-muted/50 border-b p-2 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                                <div>Código</div>
                                <div>Cuenta</div>
                                <div className="text-right">Débitos</div>
                                <div className="text-right">Créditos</div>
                                <div className="text-right">Saldo</div>
                            </div>

                            <div className="divide-y divide-border">
                                {isLoading ? (
                                    <div className="text-center p-12 text-muted-foreground italic">
                                        Cargando movimientos...
                                    </div>
                                ) : ledgerData.length === 0 ? (
                                    <div className="p-4">
                                        <TableEmptyState
                                            compact
                                            icon={Calculator}
                                            title="Sin Movimientos en Mayor"
                                            description="No hay movimientos registrados para este periodo."
                                        />
                                    </div>
                                ) : (
                                    ledgerData.map((item) => (
                                        <div key={item.accountId} className="transition-colors hover:bg-muted/30">
                                            {/* Desktop Layout */}
                                            <div className="hidden md:grid grid-cols-[100px_1fr_120px_120px_120px] items-center p-2 text-sm">
                                                <div className="font-mono text-[11px] text-muted-foreground">{item.code}</div>
                                                <div className="font-medium">{item.name}</div>
                                                <div className="text-right">${item.debit.toLocaleString()}</div>
                                                <div className="text-right">${item.credit.toLocaleString()}</div>
                                                <div className={cn(
                                                    "text-right font-bold",
                                                    item.balance < 0 ? "text-destructive" : "text-green-600"
                                                )}>
                                                    ${item.balance.toLocaleString()}
                                                </div>
                                            </div>

                                            {/* Mobile Layout */}
                                            <div className="md:hidden p-4 space-y-2 border-b last:border-0">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                                            {item.code}
                                                        </span>
                                                        <h4 className="font-bold mt-1">{item.name}</h4>
                                                    </div>
                                                    <div className={cn(
                                                        "text-lg font-black",
                                                        item.balance < 0 ? "text-destructive" : "text-primary"
                                                    )}>
                                                        ${item.balance.toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-4 text-xs pt-1 border-t border-border/50">
                                                    <span className="text-muted-foreground">D: <span className="text-foreground">${item.debit.toLocaleString()}</span></span>
                                                    <span className="text-muted-foreground">C: <span className="text-foreground">${item.credit.toLocaleString()}</span></span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default GeneralLedger;