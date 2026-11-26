import React from 'react';
import { GeneralLedger } from "@/components/organisms/accounting/GeneralLedger";
import { JournalEntryForm } from "@/components/organisms/accounting/JournalEntryForm";
import { useJournalEntries, useCreateJournalEntry, useVoidJournalEntry } from "@/useCases/useJournalEntry";
import { useChartOfAccounts } from "@/useCases/useChartOfAccounts";
import { useTrialBalance } from "@/useCases/useTrialBalance";
import { JournalEntryType } from "@/entities/JournalEntry";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { Plus, BookOpen, Calculator, Ban } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/molecules/Tabs";

import { MainLayout } from "@/templates/MainLayout";
import { SEO } from "@/components/atoms/SEO";
import { TableEmptyState } from "@/components/molecules/TableEmptyState";

const entryTypeLabels: Record<JournalEntryType, string> = {
    INVOICE_ISSUE: "Factura",
    PAYMENT_RECEIPT: "Recaudo",
    MANUAL: "Manual",
    REVERSAL: "Reversa",
};

export const AccountingJournal = () => {
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const { data: entries = [], isLoading: entriesLoading } = useJournalEntries();
    const { accounts, isLoading: accountsLoading } = useChartOfAccounts();
    const { data: trialBalance = [], isLoading: ledgerLoading } = useTrialBalance();
    const createEntry = useCreateJournalEntry();
    const voidEntry = useVoidJournalEntry();

    const handleSave = (data: Parameters<typeof createEntry.mutate>[0]) => {
        createEntry.mutate(data, {
            onSuccess: () => setIsFormOpen(false),
        });
    };

    const handleVoid = (id: number, number: string) => {
        if (window.confirm(`¿Anular el comprobante ${number}? Se generará un asiento de reversa.`)) {
            voidEntry.mutate(id);
        }
    };

    return (
        <MainLayout>
            <SEO title="Libro Diario" description="Registro de transacciones contables." />
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Contabilidad General</h1>
                        <p className="text-muted-foreground">Gestión de asientos y libro mayor</p>
                    </div>
                    <Button onClick={() => setIsFormOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Nuevo Asiento
                    </Button>
                </div>

                <Tabs defaultValue="journal" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                        <TabsTrigger value="journal" className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" /> Libro Diario
                        </TabsTrigger>
                        <TabsTrigger value="ledger" className="flex items-center gap-2">
                            <Calculator className="h-4 w-4" /> Libro Mayor
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="journal" className="mt-6">
                        {!entriesLoading && entries.length === 0 ? (
                            <TableEmptyState
                                icon={BookOpen}
                                title="Sin Asientos Registrados"
                                description="Registra un comprobante contable manual o emite una factura para comenzar tu libro diario."
                                actionLabel="Nuevo Asiento"
                                actionIcon={Plus}
                                onAction={() => setIsFormOpen(true)}
                            />
                        ) : (
                        <div className="border-2 border-border bg-card rounded-lg overflow-hidden">
                            <div className="table-header rounded-t-lg hidden md:flex gap-4">
                                <div className="w-[110px] text-left">Comprobante</div>
                                <div className="w-[110px] text-left">Fecha</div>
                                <div className="w-[100px] text-left">Tipo</div>
                                <div className="flex-1 text-left">Concepto</div>
                                <div className="w-[130px] text-right">Monto</div>
                                <div className="w-[90px] text-right">Acciones</div>
                            </div>

                            {entriesLoading ? (
                                <div className="flex flex-col items-center justify-center p-8 text-center">
                                    <p className="text-muted-foreground">Cargando asientos...</p>
                                </div>
                            ) : (
                                <div className="divide-y-2 divide-border">
                                    {entries.map((entry) => {
                                        const total = entry.lines.reduce((sum, l) => sum + l.debit, 0);
                                        const isVoid = entry.status === "void";
                                        return (
                                            <div key={entry.id} className="p-4 transition-colors hover:bg-accent/50 flex flex-col md:flex-row gap-4 md:items-center">
                                                {/* Mobile layout labels (hidden on md) */}
                                                <div className="md:hidden space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-muted-foreground font-medium">Comprobante</span>
                                                        <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{entry.number}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-muted-foreground font-medium">Fecha</span>
                                                        <span className="font-medium text-right">{entry.date?.slice(0, 10)}</span>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-sm text-muted-foreground font-medium">Concepto</span>
                                                        <span className="text-sm">{entry.description}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center pt-2 border-t border-border mt-2 w-full">
                                                        <span className="text-sm text-muted-foreground font-medium">Monto</span>
                                                        <span className="font-bold text-right">${total.toLocaleString()}</span>
                                                    </div>
                                                </div>

                                                {/* Desktop layout (hidden on mobile) */}
                                                <div className="hidden md:flex w-full gap-4 items-center">
                                                    <div className="w-[110px] text-left"><span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{entry.number}</span></div>
                                                    <div className="w-[110px] text-left text-sm font-medium">{entry.date?.slice(0, 10)}</div>
                                                    <div className="w-[100px] text-left">
                                                        <Badge variant={isVoid ? "destructive" : "secondary"} className="text-[10px]">
                                                            {entryTypeLabels[entry.type] || entry.type}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex-1 text-left text-sm truncate" title={entry.description}>
                                                        {entry.description}
                                                        {isVoid && <span className="ml-2 text-[10px] font-bold uppercase text-destructive">Anulado</span>}
                                                    </div>
                                                    <div className="w-[130px] text-right font-bold">${total.toLocaleString()}</div>
                                                    <div className="w-[90px] text-right">
                                                        {!isVoid && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-muted-foreground hover:text-destructive"
                                                                onClick={() => handleVoid(entry.id, entry.number)}
                                                                disabled={voidEntry.isPending}
                                                                title="Anular comprobante"
                                                            >
                                                                <Ban className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        )}
                    </TabsContent>

                    <TabsContent value="ledger" className="mt-6">
                        <GeneralLedger rows={trialBalance} isLoading={ledgerLoading} />
                    </TabsContent>
                </Tabs>

                <JournalEntryForm
                    open={isFormOpen}
                    onOpenChange={setIsFormOpen}
                    accounts={accounts}
                    isSaving={createEntry.isPending || accountsLoading}
                    onSave={handleSave}
                />
            </div>
        </MainLayout>
    );
};

export default AccountingJournal;