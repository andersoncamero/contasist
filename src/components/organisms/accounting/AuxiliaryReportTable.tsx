import React from "react";
import { formatCurrency } from "@/lib/utils";
import { AuxiliaryMovement } from "@/useCases/useAuxiliaryReport";
import { Account } from "@/entities/Account";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AuxiliaryReportTableProps {
    movements: AuxiliaryMovement[];
    initialBalance: number;
    finalBalance: number;
    account: Account | null;
}

export function AuxiliaryReportTable({ movements, initialBalance, finalBalance, account }: AuxiliaryReportTableProps) {
    if (!account) return null;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end border-b-2 border-border pb-4">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-mono">{account.Code}</span>
                        {account.Name}
                    </h3>
                    <p className="text-sm text-muted-foreground italic">Naturaleza: {account.Nature}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Saldo a la fecha</p>
                    <p className="text-2xl font-black text-primary">{formatCurrency(finalBalance)}</p>
                </div>
            </div>

            <div className="border-2 border-border bg-card rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-muted text-xs uppercase tracking-wider font-bold text-muted-foreground border-b-2 border-border">
                            <th className="px-4 py-3 text-left w-24">Fecha</th>
                            <th className="px-4 py-3 text-left flex-1">Descripción / Referencia</th>
                            <th className="px-4 py-3 text-right w-32">Débito</th>
                            <th className="px-4 py-3 text-right w-32">Crédito</th>
                            <th className="px-4 py-3 text-right w-32 bg-primary/5 text-primary">Saldo</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {/* Saldo Inicial */}
                        <tr className="bg-accent/30 italic">
                            <td className="px-4 py-3"></td>
                            <td className="px-4 py-3 font-semibold">SALDO INICIAL ANTERIOR</td>
                            <td className="px-4 py-3 text-right">-</td>
                            <td className="px-4 py-3 text-right">-</td>
                            <td className="px-4 py-3 text-right font-bold bg-primary/5 underline decoration-primary/30 underline-offset-4">
                                {formatCurrency(initialBalance)}
                            </td>
                        </tr>

                        {movements.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                                    No se encontraron movimientos en el rango seleccionado.
                                </td>
                            </tr>
                        ) : (
                            movements.map((move, index) => (
                                <tr key={`${move.EntryID}-${index}`} className="hover:bg-accent/50 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">
                                        {format(parseISO(move.Date), "dd MMM yyyy", { locale: es })}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{move.EntryDescription}</div>
                                        {move.Reference && (
                                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                Ref: <span className="font-mono bg-muted px-1 rounded">{move.Reference}</span>
                                                {move.Description && <span>• {move.Description}</span>}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right text-xs">
                                        {move.Debit > 0 ? formatCurrency(move.Debit) : "-"}
                                    </td>
                                    <td className="px-4 py-3 text-right text-xs text-red-600/80">
                                        {move.Credit > 0 ? formatCurrency(move.Credit) : "-"}
                                    </td>
                                    <td className={cn(
                                        "px-4 py-3 text-right font-bold bg-primary/5",
                                        move.RunningBalance < 0 && "text-destructive"
                                    )}>
                                        {formatCurrency(move.RunningBalance)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    <tfoot>
                        <tr className="bg-muted/50 font-bold border-t-2 border-border">
                            <td colSpan={2} className="px-4 py-4 text-right pr-8">TOTALES Y SALDO FINAL</td>
                            <td className="px-4 py-4 text-right">
                                {formatCurrency(movements.reduce((sum, m) => sum + m.Debit, 0))}
                            </td>
                            <td className="px-4 py-4 text-right">
                                {formatCurrency(movements.reduce((sum, m) => sum + m.Credit, 0))}
                            </td>
                            <td className="px-4 py-4 text-right text-lg text-primary bg-primary/10">
                                {formatCurrency(finalBalance)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
