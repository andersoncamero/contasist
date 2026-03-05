import React from 'react';
import { MainLayout } from "@/templates/MainLayout";
import { AccountList } from "@/components/organisms/accounting/AccountList";
import { AccountForm } from "@/components/organisms/accounting/AccountForm";
import { useChartOfAccounts } from "@/useCases/useChartOfAccounts";
import { Button } from "@/components/atoms/Button";
import { Plus } from "lucide-react";

export const ChartOfAccounts = () => {
    const { accounts, isLoading, search, setSearch, addAccount, updateAccount, deleteAccount } = useChartOfAccounts();
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [editingAccount, setEditingAccount] = React.useState<any>(null);

    // Filtrar cuentas de la empresa
    const companyAccounts = accounts.filter(a => a.business_id && a.business_id !== "");

    const handleSave = async (data: any) => {
        if (editingAccount) {
            await updateAccount(editingAccount.id, data);
        } else {
            await addAccount(data);
        }
        setIsFormOpen(false);
        setEditingAccount(null);
    };

    return (
        <MainLayout>
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Plan Único de Cuentas (PUC)</h1>
                        <p className="text-slate-500 font-medium">Gestiona la estructura contable de tu empresa</p>
                    </div>
                    {companyAccounts.length > 0 && (
                        <Button onClick={() => {
                            setEditingAccount(null);
                            setIsFormOpen(true);
                        }} className="bg-primary hover:bg-primary/90 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95">
                            <Plus className="mr-2 h-4 w-4" /> Nueva Cuenta
                        </Button>
                    )}
                </div>

                <AccountList
                    accounts={companyAccounts}
                    search={search}
                    onSearchChange={setSearch}
                    onEdit={(account) => {
                        setEditingAccount(account);
                        setIsFormOpen(true);
                    }}
                    onDelete={deleteAccount}
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
