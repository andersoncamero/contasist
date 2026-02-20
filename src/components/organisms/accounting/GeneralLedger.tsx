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
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="text-left p-2 font-medium">Código</th>
                                    <th className="text-left p-2 font-medium">Cuenta</th>
                                    <th className="text-right p-2 font-medium">Débitos</th>
                                    <th className="text-right p-2 font-medium">Créditos</th>
                                    <th className="text-right p-2 font-medium">Saldo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ledgerData.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center p-8 text-muted-foreground">
                                            No hay movimientos registrados para este periodo.
                                        </td>
                                    </tr>
                                ) : (
                                    ledgerData.map((item) => (
                                        <tr key={item.ID} className="border-b hover:bg-muted/30 transition-colors">
                                            <td className="p-2 font-mono text-xs">{item.Code}</td>
                                            <td className="p-2">{item.Name}</td>
                                            <td className="p-2 text-right">${item.debit.toLocaleString()}</td>
                                            <td className="p-2 text-right">${item.credit.toLocaleString()}</td>
                                            <td className={cn(
                                                "p-2 text-right font-bold",
                                                item.balance < 0 ? "text-destructive" : "text-green-600"
                                            )}>
                                                ${item.balance.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default GeneralLedger;
