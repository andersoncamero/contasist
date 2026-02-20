import React from "react";
import { Account, AccountClass, AccountNature } from "../entities/Account";

// Cuentas básicas del PUC Colombia para inicializar el sistema
const INITIAL_PUC: Account[] = [
  { ID: "1", Code: "1", Name: "Activo", Class: AccountClass.Activo, Nature: AccountNature.Debito, Level: 1, IsActive: true, CreatedAt: new Date().toISOString() },
  { ID: "11", Code: "11", Name: "Efectivo y Equivalentes de Efectivo", Class: AccountClass.Activo, Nature: AccountNature.Debito, Level: 2, ParentID: "1", IsActive: true, CreatedAt: new Date().toISOString() },
  { ID: "1105", Code: "1105", Name: "Caja", Class: AccountClass.Activo, Nature: AccountNature.Debito, Level: 3, ParentID: "11", IsActive: true, CreatedAt: new Date().toISOString() },
  { ID: "1110", Code: "1110", Name: "Bancos", Class: AccountClass.Activo, Nature: AccountNature.Debito, Level: 3, ParentID: "11", IsActive: true, CreatedAt: new Date().toISOString() },
  { ID: "2", Code: "2", Name: "Pasivo", Class: AccountClass.Pasivo, Nature: AccountNature.Credito, Level: 1, IsActive: true, CreatedAt: new Date().toISOString() },
  { ID: "3", Code: "3", Name: "Patrimonio", Class: AccountClass.Patrimonio, Nature: AccountNature.Credito, Level: 1, IsActive: true, CreatedAt: new Date().toISOString() },
];

export const useChartOfAccounts = () => {
    const [accounts, setAccounts] = React.useState<Account[]>(() => {
        const saved = localStorage.getItem("contasist_puc");
        return saved ? JSON.parse(saved) : INITIAL_PUC;
    });
    const [search, setSearch] = React.useState("");

    const saveAccounts = (newAccounts: Account[]) => {
        setAccounts(newAccounts);
        localStorage.setItem("contasist_puc", JSON.stringify(newAccounts));
    };

    const addAccount = async (account: Omit<Account, "ID" | "CreatedAt">) => {
        const newAccount: Account = {
            ...account,
            ID: Math.random().toString(36).substr(2, 9),
            CreatedAt: new Date().toISOString(),
        };
        saveAccounts([...accounts, newAccount]);
    };

    const updateAccount = async (id: string, data: Partial<Account>) => {
        const updated = accounts.map(a => a.ID === id ? { ...a, ...data } : a);
        saveAccounts(updated);
    };

    const deleteAccount = async (id: string) => {
        const updated = accounts.filter(a => a.ID !== id);
        saveAccounts(updated);
    };

    return {
        accounts,
        isLoading: false,
        search,
        setSearch,
        addAccount,
        updateAccount,
        deleteAccount,
    };
};
