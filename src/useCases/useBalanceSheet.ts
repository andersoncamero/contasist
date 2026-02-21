import { useMemo } from "react";
import { useChartOfAccounts } from "./useChartOfAccounts";
import { useJournalEntry } from "./useJournalEntry";
import { Account, AccountClass, AccountNature } from "../entities/Account";

export interface AccountWithBalance extends Account {
  DebitBalance: number;
  CreditBalance: number;
  TotalBalance: number;
}

export const useBalanceSheet = () => {
  const { accounts } = useChartOfAccounts();
  const { entries } = useJournalEntry();

  const balanceData = useMemo(() => {
    // 1. Inicializar mapa de saldos por AccountID
    const balanceMap: Record<string, { debit: number; credit: number }> = {};
    accounts.forEach(acc => {
      balanceMap[acc.ID] = { debit: 0, credit: 0 };
    });

    // 2. Sumar movimientos de los asientos
    entries.forEach(entry => {
      entry.Movements.forEach(move => {
        if (balanceMap[move.AccountID]) {
          balanceMap[move.AccountID].debit += move.Debit;
          balanceMap[move.AccountID].credit += move.Credit;
        }
      });
    });

    // 3. Crear lista de cuentas con sus saldos individuales calculados
    let accountsWithBalances: AccountWithBalance[] = accounts.map(acc => {
      const { debit, credit } = balanceMap[acc.ID];
      
      // Cálculo del saldo según naturaleza
      let total = 0;
      if (acc.Nature === AccountNature.Debito) {
        total = debit - credit;
      } else {
        total = credit - debit;
      }

      return {
        ...acc,
        DebitBalance: debit,
        CreditBalance: credit,
        TotalBalance: total
      };
    });

    // 4. Propagación de saldos (Bottom-up)
    // Ordenamos por nivel de forma descendente (del nivel 4 al 1)
    const sortedLevels = [4, 3, 2, 1];
    sortedLevels.forEach(level => {
      accountsWithBalances.forEach(acc => {
        if (acc.Level === level && acc.ParentID) {
          const parent = accountsWithBalances.find(p => p.ID === acc.ParentID);
          if (parent) {
            parent.DebitBalance += acc.DebitBalance;
            parent.CreditBalance += acc.CreditBalance;
            // Recalcular saldo total del padre según su propia naturaleza
            if (parent.Nature === AccountNature.Debito) {
              parent.TotalBalance = parent.DebitBalance - parent.CreditBalance;
            } else {
              parent.TotalBalance = parent.CreditBalance - parent.DebitBalance;
            }
          }
        }
      });
    });

    // 5. Filtrar solo cuentas de Activo, Pasivo y Patrimonio (Clases 1, 2, 3)
    const balanceSheetAccounts = accountsWithBalances.filter(acc => 
      [AccountClass.Activo, AccountClass.Pasivo, AccountClass.Patrimonio].includes(acc.Class)
    );

    const totals = {
      assets: balanceSheetAccounts.find(a => a.Code === "1")?.TotalBalance || 0,
      liabilities: balanceSheetAccounts.find(a => a.Code === "2")?.TotalBalance || 0,
      equity: balanceSheetAccounts.find(a => a.Code === "3")?.TotalBalance || 0,
    };

    return {
      accounts: balanceSheetAccounts,
      totals,
      isBalanced: Math.abs(totals.assets - (totals.liabilities + totals.equity)) < 0.01
    };
  }, [accounts, entries]);

  return balanceData;
};
