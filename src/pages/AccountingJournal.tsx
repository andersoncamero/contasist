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
                        <p className="text-muted-foreground">Gestión de asientos y libro mayor (PUC Colombia)</p>
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
                        <div className="rounded-md border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="p-2 text-left">Fecha</th>
                                        <th className="p-2 text-left">Referencia</th>
                                        <th className="p-2 text-left">Concepto</th>
                                        <th className="p-2 text-right">Monto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entries.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-muted-foreground">
                                                No hay asientos registrados.
                                            </td>
                                        </tr>
                                    ) : (
                                        entries.map((entry) => {
                                            const total = entry.Movements.reduce((sum, m) => sum + m.Debit, 0);
                                            return (
                                                <tr key={entry.ID} className="border-b hover:bg-muted/30">
                                                    <td className="p-2">{entry.Date}</td>
                                                    <td className="p-2 text-xs font-mono">{entry.Reference || '-'}</td>
                                                    <td className="p-2">{entry.Description}</td>
                                                    <td className="p-2 text-right font-medium">${total.toLocaleString()}</td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
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
