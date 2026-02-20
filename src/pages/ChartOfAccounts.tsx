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

    const handleSave = async (data: any) => {
        if (editingAccount) {
            await updateAccount(editingAccount.ID, data);
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
                        <h1 className="text-3xl font-bold tracking-tight">Plan Único de Cuentas (PUC)</h1>
                        <p className="text-muted-foreground">Estructura contable estándar para Colombia</p>
                    </div>
                    <Button onClick={() => {
                        setEditingAccount(null);
                        setIsFormOpen(true);
                    }}>
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
                    onDelete={deleteAccount}
                    isLoading={isLoading}
                />

                <AccountForm
                    open={isFormOpen}
                    onOpenChange={(open) => {
                        setIsFormOpen(open);
                        if (!open) setEditingAccount(null);
                    }}
                    onSave={handleSave}
                    account={editingAccount}
                    accounts={accounts}
                />
            </div>
        </MainLayout>
    );
};

export default ChartOfAccounts;
