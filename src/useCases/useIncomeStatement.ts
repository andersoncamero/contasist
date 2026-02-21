import { useMemo } from "react";
import { useChartOfAccounts } from "./useChartOfAccounts";
import { useJournalEntry } from "./useJournalEntry";
import { Account, AccountClass, AccountNature } from "../entities/Account";

export interface AccountWithBalance extends Account {
  DebitBalance: number;
  CreditBalance: number;
  TotalBalance: number;
}

export const useIncomeStatement = () => {
  const { accounts } = useChartOfAccounts();
  const { entries } = useJournalEntry();

  const incomeData = useMemo(() => {
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

    // 3. Calcular saldos para cuentas de resultado (Clases 4, 5, 6, 7)
    let accountsWithBalances: AccountWithBalance[] = accounts.map(acc => {
      const { debit, credit } = balanceMap[acc.ID];
      
      let total = 0;
      // Para Ingresos (Clase 4), el saldo normal es Crédito (Créditos - Débitos)
      // Para Gastos/Costos (5, 6, 7), el saldo normal es Débito (Débitos - Créditos)
      if (acc.Class === AccountClass.Ingresos) {
        total = credit - debit;
      } else {
        total = debit - credit;
      }

      return {
        ...acc,
        DebitBalance: debit,
        CreditBalance: credit,
        TotalBalance: total
      };
    });

    // 4. Propagación de saldos (Bottom-up)
    const sortedLevels = [4, 3, 2, 1];
    sortedLevels.forEach(level => {
      accountsWithBalances.forEach(acc => {
        if (acc.Level === level && acc.ParentID) {
          const parent = accountsWithBalances.find(p => p.ID === acc.ParentID);
          if (parent) {
            parent.DebitBalance += acc.DebitBalance;
            parent.CreditBalance += acc.CreditBalance;
            // Recalcular saldo total del padre según su clase
            if (parent.Class === AccountClass.Ingresos) {
              parent.TotalBalance = parent.CreditBalance - parent.DebitBalance;
            } else {
              parent.TotalBalance = parent.DebitBalance - parent.CreditBalance;
            }
          }
        }
      });
    });

    // 5. Filtrar solo cuentas de Resultado (Ingresos, Gastos, Costos)
    const resultAccounts = accountsWithBalances.filter(acc => 
      [AccountClass.Ingresos, AccountClass.Gastos, AccountClass.CostosDeVentas, AccountClass.CostosDeProduccion].includes(acc.Class)
    );

    const totals = {
      income: resultAccounts.find(a => a.Code === "4")?.TotalBalance || 0,
      expenses: resultAccounts.find(a => a.Code === "5")?.TotalBalance || 0,
      costs: (resultAccounts.find(a => a.Code === "6")?.TotalBalance || 0) + 
             (resultAccounts.find(a => a.Code === "7")?.TotalBalance || 0),
    };

    const netIncome = totals.income - (totals.expenses + totals.costs);

    return {
      accounts: resultAccounts,
      totals,
      netIncome
    };
  }, [accounts, entries]);

  return incomeData;
};
