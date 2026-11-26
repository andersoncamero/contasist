import React from 'react';
import { MainLayout } from "@/templates/MainLayout";
import { AccountList } from "@/components/organisms/accounting/AccountList";
import { AccountForm } from "@/components/organisms/accounting/AccountForm";
import { useChartOfAccounts } from "@/useCases/useChartOfAccounts";
import { Account } from "@/entities/Account";
import { Button } from "@/components/atoms/Button";
import { Plus } from "lucide-react";
import { SEO } from "@/components/atoms/SEO";

export const ChartOfAccounts = () => {
    const { accounts, isLoading, search, setSearch, addAccount, updateAccount, deactivateAccount } = useChartOfAccounts();
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [editingAccount, setEditingAccount] = React.useState<Account | null>(null);

    const handleSave = async (data: { code?: string; name: string; description?: string; parentId?: number }) => {
        try {
            if (editingAccount) {
                await updateAccount(editingAccount.id, {
                    name: data.name,
                    description: data.description,
                });
            } else {
                await addAccount({
                    code: data.code || "",
                    name: data.name,
                    description: data.description,
                    parentId: data.parentId || 0,
                });
            }
            setIsFormOpen(false);
            setEditingAccount(null);
        } catch {
            // El hook ya muestra el toast de error
        }
    };

    return (
        <MainLayout>
            <SEO title="Plan de Cuentas" description="Catálogo de cuentas contables." />
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Plan Único de Cuentas (PUC)</h1>
                        <p className="text-slate-500 font-medium">Gestiona la estructura contable de tu empresa</p>
                    </div>
                    <Button onClick={() => {
                        setEditingAccount(null);
                        setIsFormOpen(true);
                    }} className="bg-primary hover:bg-primary/90 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95">
                        <Plus className="mr-2 h-4 w-4" /> Nueva Cuenta
                    </Button>
                </div>

                <AccountList
                    accounts={accounts}
                    search={search}
                    onSearchChange={setSearch}
                    onEdit={(account) => {
                        setEditingAccount(account);
                        setIsFormOpen(true);
                    }}
                    onDeactivate={deactivateAccount}
                    isLoading={isLoading}
                    onAddNew={() => {
                        setEditingAccount(null);
                        setIsFormOpen(true);
                    }}
                />

                <AccountForm
                    open={isFormOpen}
                    onOpenChange={(open) => {
                        setIsFormOpen(open);
                        if (!open) setEditingAccount(null);
                    }}
                    onSave={handleSave}
                    account={editingAccount}
                    allAccounts={accounts}
                />
            </div>
        </MainLayout>
    );
};

export default ChartOfAccounts;