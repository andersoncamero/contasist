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
                <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                        {/* Header Desktop */}
                        <div className="hidden md:grid grid-cols-[100px_1fr_120px_120px_120px] bg-muted text-[10px] uppercase tracking-wider font-bold text-muted-foreground border-b-2 border-border">
                            <div className="px-4 py-3 text-left">Fecha</div>
                            <div className="px-4 py-3 text-left">Descripción / Referencia</div>
                            <div className="px-4 py-3 text-right">Débito</div>
                            <div className="px-4 py-3 text-right">Crédito</div>
                            <div className="px-4 py-3 text-right bg-primary/5 text-primary">Saldo</div>
                        </div>

                        <div className="divide-y divide-border">
                            {/* Saldo Inicial Desktop */}
                            <div className="hidden md:grid grid-cols-[100px_1fr_120px_120px_120px] bg-accent/30 italic text-sm">
                                <div className="px-4 py-3"></div>
                                <div className="px-4 py-3 font-semibold text-xs uppercase">SALDO INICIAL ANTERIOR</div>
                                <div className="px-4 py-3 text-right">-</div>
                                <div className="px-4 py-3 text-right">-</div>
                                <div className="px-4 py-3 text-right font-bold bg-primary/5 underline decoration-primary/30 underline-offset-4">
                                    {formatCurrency(initialBalance)}
                                </div>
                            </div>

                            {/* Saldo Inicial Mobile */}
                            <div className="md:hidden p-4 bg-accent/30 italic flex justify-between items-center text-sm border-b">
                                <span className="font-semibold text-xs uppercase">SALDO INICIAL</span>
                                <span className="font-bold">{formatCurrency(initialBalance)}</span>
                            </div>

                            {movements.length === 0 ? (
                                <div className="px-4 py-12 text-center text-muted-foreground italic">
                                    No se encontraron movimientos en el rango seleccionado.
                                </div>
                            ) : (
                                movements.map((move, index) => (
                                    <div key={`${move.EntryID}-${index}`} className="transition-colors hover:bg-accent/50">
                                        {/* Desktop Layout */}
                                        <div className="hidden md:grid grid-cols-[100px_1fr_120px_120px_120px] text-sm items-center">
                                            <div className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                                {format(parseISO(move.Date), "dd MMM yyyy", { locale: es })}
                                            </div>
                                            <div className="px-4 py-3">
                                                <div className="font-medium line-clamp-1">{move.EntryDescription}</div>
                                                {move.Reference && (
                                                    <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                                        Ref: <span className="font-mono bg-muted/50 px-1 rounded">{move.Reference}</span>
                                                        {move.Description && <span className="truncate">• {move.Description}</span>}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="px-4 py-3 text-right text-xs">
                                                {move.Debit > 0 ? formatCurrency(move.Debit) : "-"}
                                            </div>
                                            <div className="px-4 py-3 text-right text-xs text-red-600/80">
                                                {move.Credit > 0 ? formatCurrency(move.Credit) : "-"}
                                            </div>
                                            <div className={cn(
                                                "px-4 py-3 text-right font-bold bg-primary/5 self-stretch flex items-center justify-end",
                                                move.RunningBalance < 0 && "text-destructive"
                                            )}>
                                                {formatCurrency(move.RunningBalance)}
                                            </div>
                                        </div>

                                        {/* Mobile Layout */}
                                        <div className="md:hidden p-4 space-y-2 text-sm">
                                            <div className="flex justify-between items-start">
                                                <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                                    {format(parseISO(move.Date), "dd/MM/yyyy")}
                                                </span>
                                                <span className={cn(
                                                    "font-bold text-base",
                                                    move.RunningBalance < 0 && "text-destructive"
                                                )}>
                                                    {formatCurrency(move.RunningBalance)}
                                                </span>
                                            </div>
                                            <p className="font-medium">{move.EntryDescription}</p>
                                            <div className="flex justify-between items-center text-xs pt-1 border-t border-border/50">
                                                <div className="flex gap-3">
                                                    {move.Debit > 0 && <span className="text-emerald-600">D: {formatCurrency(move.Debit)}</span>}
                                                    {move.Credit > 0 && <span className="text-rose-600">C: {formatCurrency(move.Credit)}</span>}
                                                </div>
                                                {move.Reference && <span className="font-mono text-[10px] opacity-70">Ref: {move.Reference}</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}

                            {/* Footer Desktop */}
                            <div className="hidden md:grid grid-cols-[100px_1fr_120px_120px_120px] bg-muted/50 font-bold border-t-2 border-border border-b-0 item-center text-sm">
                                <div className="px-4 py-4 col-span-2 text-right pr-8 self-center">TOTALES Y SALDO FINAL</div>
                                <div className="px-4 py-4 text-right self-center">
                                    {formatCurrency(movements.reduce((sum, m) => sum + m.Debit, 0))}
                                </div>
                                <div className="px-4 py-4 text-right self-center text-red-600/80">
                                    {formatCurrency(movements.reduce((sum, m) => sum + m.Credit, 0))}
                                </div>
                                <div className="px-4 py-4 text-right text-lg text-primary bg-primary/10 self-stretch flex items-center justify-end">
                                    {formatCurrency(finalBalance)}
                                </div>
                            </div>

                            {/* Footer Mobile */}
                            <div className="md:hidden p-4 bg-muted/50 border-t-2 border-border space-y-2">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Total Débitos: {formatCurrency(movements.reduce((sum, m) => sum + m.Debit, 0))}</span>
                                    <span>Total Créditos: {formatCurrency(movements.reduce((sum, m) => sum + m.Credit, 0))}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-border">
                                    <span className="font-bold text-xs uppercase tracking-wider">Saldo Final</span>
                                    <span className="text-xl font-black text-primary">{formatCurrency(finalBalance)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
