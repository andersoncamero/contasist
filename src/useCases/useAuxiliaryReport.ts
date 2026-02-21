import { useMemo, useState } from "react";
import { useChartOfAccounts } from "./useChartOfAccounts";
import { useJournalEntry } from "./useJournalEntry";
import { Account, AccountNature } from "../entities/Account";
import { AccountingMovement } from "../entities/AccountingMovement";
import { isBefore, isAfter, parseISO, startOfDay, endOfDay } from "date-fns";

export interface AuxiliaryMovement extends AccountingMovement {
  Date: string;
  EntryID: string;
  EntryDescription: string;
  Reference?: string;
  RunningBalance: number;
}

export const useAuxiliaryReport = () => {
  const { accounts } = useChartOfAccounts();
  const { entries } = useJournalEntry();

  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const reportData = useMemo(() => {
    if (!selectedAccountId) return { initialBalance: 0, movements: [], finalBalance: 0, account: null };

    const account = accounts.find(a => a.ID === selectedAccountId);
    if (!account) return { initialBalance: 0, movements: [], finalBalance: 0, account: null };

    const start = startDate ? startOfDay(parseISO(startDate)) : null;
    const end = endDate ? endOfDay(parseISO(endDate)) : null;

    // 1. Calcular Saldo Inicial (movimientos antes de startDate)
    let initialBalance = 0;
    const allMovements: AuxiliaryMovement[] = [];

    entries.forEach(entry => {
      const entryDate = parseISO(entry.Date);
      
      entry.Movements.forEach(move => {
        if (move.AccountID === selectedAccountId) {
          const isBeforeStart = start && isBefore(entryDate, start);
          const isInRange = (!start || !isBefore(entryDate, start)) && (!end || !isAfter(entryDate, end));

          if (isBeforeStart) {
            if (account.Nature === AccountNature.Debito) {
              initialBalance += (move.Debit - move.Credit);
            } else {
              initialBalance += (move.Credit - move.Debit);
            }
          }

          if (isInRange) {
            allMovements.push({
              ...move,
              Date: entry.Date,
              EntryID: entry.ID,
              EntryDescription: entry.Description,
              Reference: entry.Reference,
              RunningBalance: 0 // Se calculará después
            });
          }
        }
      });
    });

    // Ordenar movimientos por fecha
    allMovements.sort((a, b) => parseISO(a.Date).getTime() - parseISO(b.Date).getTime());

    // 2. Calcular Saldos Progresivos
    let currentBalance = initialBalance;
    const movementsWithRunningBalance = allMovements.map(move => {
      if (account.Nature === AccountNature.Debito) {
        currentBalance += (move.Debit - move.Credit);
      } else {
        currentBalance += (move.Credit - move.Debit);
      }
      return { ...move, RunningBalance: currentBalance };
    });

    return {
      initialBalance,
      movements: movementsWithRunningBalance,
      finalBalance: currentBalance,
      account
    };
  }, [selectedAccountId, startDate, endDate, accounts, entries]);

  return {
    selectedAccountId,
    setSelectedAccountId,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    accounts,
    ...reportData
  };
};
