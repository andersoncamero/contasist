import { API_BASE_URL, getFetchOptions, parseResponseJson } from "./apiConfig";
import {
    AccountSettings,
    CreateJournalEntryReq,
    JournalEntry,
    TrialBalanceRow,
} from "../entities/JournalEntry";

export interface JournalEntryListFilter {
    from?: string;
    to?: string;
    type?: string;
    accountId?: number;
}

export const JournalEntryService = {
    async list(filter: JournalEntryListFilter = {}): Promise<JournalEntry[]> {
        const params = new URLSearchParams();
        if (filter.from) params.append("from", filter.from);
        if (filter.to) params.append("to", filter.to);
        if (filter.type) params.append("type", filter.type);
        if (filter.accountId) params.append("accountId", filter.accountId.toString());

        const url = `${API_BASE_URL}/journal-entries${params.toString() ? `?${params.toString()}` : ""}`;
        const data = await parseResponseJson(await fetch(url, getFetchOptions()));
        return Array.isArray(data) ? data : [];
    },

    async getById(id: number): Promise<JournalEntry> {
        const response = await fetch(`${API_BASE_URL}/journal-entries/${id}`, getFetchOptions());
        return parseResponseJson(response);
    },

    async createManual(entry: CreateJournalEntryReq): Promise<JournalEntry> {
        const response = await fetch(`${API_BASE_URL}/journal-entries`, getFetchOptions(undefined, {
            method: "POST",
            body: JSON.stringify(entry),
        }));
        return parseResponseJson(response);
    },

    async void(id: number): Promise<JournalEntry> {
        const response = await fetch(`${API_BASE_URL}/journal-entries/${id}/void`, getFetchOptions(undefined, {
            method: "POST",
        }));
        return parseResponseJson(response);
    },

    async getTrialBalance(filter: { from?: string; to?: string } = {}): Promise<TrialBalanceRow[]> {
        const params = new URLSearchParams();
        if (filter.from) params.append("from", filter.from);
        if (filter.to) params.append("to", filter.to);

        const url = `${API_BASE_URL}/reports/trial-balance${params.toString() ? `?${params.toString()}` : ""}`;
        const data = await parseResponseJson(await fetch(url, getFetchOptions()));
        return Array.isArray(data) ? data : [];
    },

    async getSettings(): Promise<AccountSettings> {
        const response = await fetch(`${API_BASE_URL}/accounting/settings`, getFetchOptions());
        return parseResponseJson(response);
    },

    async updateSettings(settings: Omit<AccountSettings, "companyId">): Promise<AccountSettings> {
        const response = await fetch(`${API_BASE_URL}/accounting/settings`, getFetchOptions(undefined, {
            method: "PUT",
            body: JSON.stringify(settings),
        }));
        return parseResponseJson(response);
    },
};