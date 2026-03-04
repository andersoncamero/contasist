import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/molecules/Card";
import { Account } from "@/entities/Account";
import { JournalEntry } from "@/entities/JournalEntry";
import { cn } from "@/lib/utils";

interface GeneralLedgerProps {
    accounts: Account[];
    entries: JournalEntry[];
}

export const GeneralLedger = ({ accounts, entries }: GeneralLedgerProps) => {
    const ledgerData = useMemo(() => {
        // Calcular saldos por cuenta
        const balances: Record<string, { debit: number; credit: number }> = {};

        entries.forEach(entry => {
            entry.Movements.forEach(move => {
                if (!balances[move.AccountID]) {
                    balances[move.AccountID] = { debit: 0, credit: 0 };
                }
                balances[move.AccountID].debit += move.Debit;
                balances[move.AccountID].credit += move.Credit;

                // También acumular en cuentas padre (opcional, pero útil para contabilidad)
                // Por ahora solo cuentas de detalle (Nivel 4)
            });
        });

        return accounts
            .filter(a => a.Level === 4 || balances[a.ID])
            .map(account => {
                const { debit = 0, credit = 0 } = balances[account.ID] || {};
                const balance = account.Nature === 'Débito'
                    ? debit - credit
                    : credit - debit;

                return {
                    ...account,
                    debit,
                    credit,
                    balance
                };
            })
            .filter(a => a.debit > 0 || a.credit > 0); // Solo mostrar cuentas con movimiento
    }, [accounts, entries]);

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
                                {ledgerData.length === 0 ? (
                                    <div className="text-center p-12 text-muted-foreground italic">
                                        No hay movimientos registrados para este periodo.
                                    </div>
                                ) : (
                                    ledgerData.map((item) => (
                                        <div key={item.ID} className="transition-colors hover:bg-muted/30">
                                            {/* Desktop Layout */}
                                            <div className="hidden md:grid grid-cols-[100px_1fr_120px_120px_120px] items-center p-2 text-sm">
                                                <div className="font-mono text-[11px] text-muted-foreground">{item.Code}</div>
                                                <div className="font-medium">{item.Name}</div>
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
                                                            {item.Code}
                                                        </span>
                                                        <h4 className="font-bold mt-1">{item.Name}</h4>
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
