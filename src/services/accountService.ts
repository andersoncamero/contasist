import { API_BASE_URL, getFetchOptions, parseResponseJson } from "./apiConfig";
import { Account, CreateAccountReq, UpdateAccountReq } from "../entities/Account";

export interface AccountListFilter {
    search?: string;
    parentId?: number;
    activeOnly?: boolean;
}

export const AccountService = {
    async getAll(filter: AccountListFilter = {}): Promise<Account[]> {
        const params = new URLSearchParams();
        if (filter.search) params.append("search", filter.search);
        if (filter.parentId) params.append("parentId", filter.parentId.toString());
        if (filter.activeOnly) params.append("active", "true");

        const url = `${API_BASE_URL}/accounts${params.toString() ? `?${params.toString()}` : ""}`;
        const data = await parseResponseJson(await fetch(url, getFetchOptions()));
        return Array.isArray(data) ? data : [];
    },

    async create(account: CreateAccountReq): Promise<Account> {
        const response = await fetch(`${API_BASE_URL}/accounts`, getFetchOptions(undefined, {
            method: "POST",
            body: JSON.stringify(account),
        }));
        return parseResponseJson(response);
    },

    async update(id: number, data: UpdateAccountReq): Promise<Account> {
        const response = await fetch(`${API_BASE_URL}/accounts/${id}`, getFetchOptions(undefined, {
            method: "PUT",
            body: JSON.stringify(data),
        }));
        return parseResponseJson(response);
    },

    async deactivate(id: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/accounts/${id}/deactivate`, getFetchOptions(undefined, {
            method: "PATCH",
        }));
        await parseResponseJson(response);
    },
};