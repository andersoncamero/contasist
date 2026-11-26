import { useMemo } from "react";
import { useTrialBalance } from "./useTrialBalance";
import { AccountClass } from "../entities/Account";
import { AccountWithBalance } from "./useBalanceSheet";

export type { AccountWithBalance };

export const useIncomeStatement = () => {
  const { data: rows = [], isLoading } = useTrialBalance();

  const incomeData = useMemo(() => {
    const resultAccounts: AccountWithBalance[] = rows
      .filter(row =>
        [
          AccountClass.Ingresos,
          AccountClass.Gastos,
          AccountClass.CostosDeVentas,
          AccountClass.CostosDeProduccion,
        ].includes(Number(row.code[0]) as 4 | 5 | 6 | 7)
      )
      .map(row => ({
        ID: row.accountId.toString(),
        Code: row.code,
        Name: row.name,
        Level: row.level,
        DebitBalance: row.debit,
        CreditBalance: row.credit,
        TotalBalance: row.balance,
      }));

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
      netIncome,
    };
  }, [rows]);

  return { ...incomeData, isLoading };
};