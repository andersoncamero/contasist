import { useMemo, useState } from "react";
import { useChartOfAccounts } from "./useChartOfAccounts";
import { useJournalEntries } from "./useJournalEntry";
import { Account, AccountNature } from "../entities/Account";
import { isBefore, isAfter, parseISO, startOfDay, endOfDay } from "date-fns";

export interface AuxiliaryMovement {
  EntryID: number;
  Date: string;
  EntryDescription: string;
  Reference?: string;
  Description?: string;
  Debit: number;
  Credit: number;
  RunningBalance: number;
}

export const useAuxiliaryReport = () => {
  const { accounts } = useChartOfAccounts();

  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const accountId = selectedAccountId ? Number(selectedAccountId) : undefined;
  const { data: entries = [], isLoading } = useJournalEntries(
    { accountId },
    !!accountId
  );

  const reportData = useMemo(() => {
    const empty = { initialBalance: 0, movements: [] as AuxiliaryMovement[], finalBalance: 0, account: null as Account | null };
    if (!accountId) return empty;

    const account = accounts.find(a => a.id === accountId);
    if (!account) return empty;

    const start = startDate ? startOfDay(parseISO(startDate)) : null;
    const end = endDate ? endOfDay(parseISO(endDate)) : null;
    const applyMovement = (balance: number, debit: number, credit: number) =>
      account.nature === AccountNature.Debito
        ? balance + (debit - credit)
        : balance + (credit - debit);

    let initialBalance = 0;
    const inRange: Omit<AuxiliaryMovement, "RunningBalance">[] = [];

    entries.forEach(entry => {
      const entryDate = parseISO(entry.date);
      const isBeforeStart = start && isBefore(entryDate, start);
      const isInRange = (!start || !isBefore(entryDate, start)) && (!end || !isAfter(entryDate, end));

      entry.lines.forEach(line => {
        if (line.accountId !== accountId || entry.status !== "posted") return;

        if (isBeforeStart) {
          initialBalance = applyMovement(initialBalance, line.debit, line.credit);
        }
        if (isInRange) {
          inRange.push({
            EntryID: entry.id,
            Date: entry.date,
            EntryDescription: entry.description,
            Reference: entry.number,
            Description: line.description,
            Debit: line.debit,
            Credit: line.credit,
          });
        }
      });
    });

    inRange.sort((a, b) => parseISO(a.Date).getTime() - parseISO(b.Date).getTime());

    let currentBalance = initialBalance;
    const movements = inRange.map(move => {
      currentBalance = applyMovement(currentBalance, move.Debit, move.Credit);
      return { ...move, RunningBalance: currentBalance };
    });

    return {
      initialBalance,
      movements,
      finalBalance: currentBalance,
      account,
    };
  }, [accountId, startDate, endDate, accounts, entries]);

  return {
    selectedAccountId,
    setSelectedAccountId,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    accounts,
    isLoading,
    ...reportData,
  };
};