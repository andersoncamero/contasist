import React from "react";
import { Account } from "../entities/Account";
import { AccountService } from "../services/accountService";

export const useChartOfAccounts = () => {
    const [accounts, setAccounts] = React.useState<Account[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [search, setSearch] = React.useState("");

    const fetchAccounts = React.useCallback(async () => {
        setIsLoading(true);
        try {
            localStorage.removeItem("contasist_puc");
            localStorage.removeItem("contasist_puc_version");

            const data = await AccountService.getAll();
            setAccounts(data || []);
        } catch (error) {
            console.error("Error loading accounts:", error);
            setAccounts([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    const addAccount = async (account: Omit<Account, "id" | "created_at" | "is_active" | "business_id">) => {
        setIsLoading(true);
        try {
            const newAccount = await AccountService.create(account);
            setAccounts(prev => [...prev, newAccount]);
        } catch (error) {
            console.error("Error adding account:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateAccount = async (id: string, data: Partial<Account>) => {
        setIsLoading(true);
        try {
            const updatedAccount = await AccountService.update(id, data);
            setAccounts(prev => prev.map(a => a.id === id ? updatedAccount : a));
        } catch (error) {
            console.error("Error updating account:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteAccount = async (id: string) => {
        setIsLoading(true);
        try {
            await AccountService.delete(id);
            setAccounts(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            console.error("Error deleting account:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        accounts,
        isLoading,
        search,
        setSearch,
        addAccount,
        updateAccount,
        deleteAccount,
        refresh: fetchAccounts,
    };
};
