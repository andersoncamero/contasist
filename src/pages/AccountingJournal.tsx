import React from 'react';
import { GeneralLedger } from "@/components/organisms/accounting/GeneralLedger";
import { JournalEntryForm } from "@/components/organisms/accounting/JournalEntryForm";
import { useJournalEntry } from "@/useCases/useJournalEntry";
import { useChartOfAccounts } from "@/useCases/useChartOfAccounts";
import { Button } from "@/components/atoms/Button";
import { Plus, BookOpen, Calculator } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/molecules/Tabs";

import { MainLayout } from "@/templates/MainLayout";

export const AccountingJournal = () => {
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const { entries, addEntry, isLoading: entriesLoading } = useJournalEntry();
    const { accounts, isLoading: accountsLoading } = useChartOfAccounts();

    return (
        <MainLayout>
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
                        <div className="border-2 border-border bg-card rounded-lg overflow-hidden">
                            <div className="table-header rounded-t-lg hidden md:flex gap-4">
                                <div className="w-[120px] text-left">Fecha</div>
                                <div className="w-[120px] text-left">Referencia</div>
                                <div className="flex-1 text-left">Concepto</div>
                                <div className="w-[150px] text-right">Monto</div>
                            </div>

                            {entries.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-8 text-center">
                                    <BookOpen className="h-10 w-10 text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">No hay asientos registrados.</p>
                                </div>
                            ) : (
                                <div className="divide-y-2 divide-border">
                                    {entries.map((entry) => {
                                        const total = entry.Movements.reduce((sum, m) => sum + m.Debit, 0);
                                        return (
                                            <div key={entry.ID} className="p-4 transition-colors hover:bg-accent/50 flex flex-col md:flex-row gap-4 md:items-center">
                                                {/* Mobile layout labels (hidden on md) */}
                                                <div className="md:hidden space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-muted-foreground font-medium">Fecha</span>
                                                        <span className="font-medium text-right">{entry.Date}</span>
                                                    </div>
                                                    <div className="flex justify-between flex-wrap gap-2">
                                                        <span className="text-sm text-muted-foreground font-medium">Referencia</span>
                                                        <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-right">{entry.Reference || '-'}</span>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-sm text-muted-foreground font-medium">Concepto</span>
                                                        <span className="text-sm">{entry.Description}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center pt-2 border-t border-border mt-2 w-full">
                                                        <span className="text-sm text-muted-foreground font-medium">Monto</span>
                                                        <span className="font-bold text-right">${total.toLocaleString()}</span>
                                                    </div>
                                                </div>

                                                {/* Desktop layout (hidden on mobile) */}
                                                <div className="hidden md:flex w-full gap-4 items-center">
                                                    <div className="w-[120px] text-left text-sm font-medium">{entry.Date}</div>
                                                    <div className="w-[120px] text-left"><span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{entry.Reference || '-'}</span></div>
                                                    <div className="flex-1 text-left text-sm truncate" title={entry.Description}>{entry.Description}</div>
                                                    <div className="w-[150px] text-right font-bold">${total.toLocaleString()}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="ledger" className="mt-6">
                        <GeneralLedger accounts={accounts} entries={entries} />
                    </TabsContent>
                </Tabs>

                <JournalEntryForm
                    open={isFormOpen}
                    onOpenChange={setIsFormOpen}
                    accounts={accounts}
                    onSave={(data) => {
                        addEntry(data);
                        setIsFormOpen(false);
                    }}
                />
            </div>
        </MainLayout>
    );
};

export default AccountingJournal;
