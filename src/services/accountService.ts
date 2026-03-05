import { API_BASE_URL, getAuthHeader } from "./apiConfig";
import { Account } from "../entities/Account";

export const AccountService = {
    /**
     * Obtiene todas las cuentas del plan de cuentas.
     */
    async getAll(): Promise<Account[]> {
        const response = await fetch(`${API_BASE_URL}/accounts`, {
            headers: getAuthHeader(),
        });
        if (!response.ok) throw new Error("Error fetching accounts");
        const data = await response.json();
        return (data || [])
    },

    async create(account: Omit<Account, "id" | "created_at" | "is_active" | "business_id">): Promise<Account> {
        const response = await fetch(`${API_BASE_URL}/accounts`, {
            method: 'POST',
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(account),
        });
        if (!response.ok) throw new Error("Error creating account");
        const newAccount: Account = await response.json();
        return newAccount;
    },

    async update(id: string, data: Partial<Account>): Promise<Account> {
        const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
            method: 'PATCH',
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Error updating account");
        const updatedAccount: Account = await response.json();
        return updatedAccount;
    },

    async delete(id: string): Promise<void> {
        // LLAMADA REAL AL BACKEND (DESCOMENTAR CUANDO ESTÉ LISTO)
        /*
        const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
          method: 'DELETE',
          headers: getAuthHeader(),
        });
        if (!response.ok) throw new Error("Error deleting account");
        */
    }
};
