import { Account } from "./Account";

export type JournalEntryType =
  | "INVOICE_ISSUE"
  | "PAYMENT_RECEIPT"
  | "MANUAL"
  | "REVERSAL";

export type JournalEntryStatus = "posted" | "void";

export interface JournalEntryLine {
  id: number;
  accountId: number;
  account?: Account;
  debit: number;
  credit: number;
  thirdPartyType?: string;
  thirdPartyId?: number | null;
  description?: string;
}

export interface JournalEntry {
  id: number;
  companyId: number;
  number: string;
  date: string;
  type: JournalEntryType;
  sourceType?: string;
  sourceId?: number | null;
  description: string;
  status: JournalEntryStatus;
  lines: JournalEntryLine[];
}

export interface CreateJournalEntryLineReq {
  accountId: number;
  debit?: number;
  credit?: number;
  description?: string;
}

export interface CreateJournalEntryReq {
  date: string;
  description: string;
  lines: CreateJournalEntryLineReq[];
}

export interface TrialBalanceRow {
  accountId: number;
  code: string;
  name: string;
  level: number;
  nature: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface AccountSettings {
  companyId: number;
  clientsAccountCode: string;
  salesIncomeAccountCode: string;
  vatGeneratedAccountCode: string;
  cashAccountCode: string;
  bankAccountCode: string;
}