import { useMemo } from "react";
import { useTrialBalance } from "./useTrialBalance";
import { AccountClass } from "../entities/Account";

export interface AccountWithBalance {
  ID: string;
  Code: string;
  Name: string;
  Level: number;
  DebitBalance: number;
  CreditBalance: number;
  TotalBalance: number;
}

export const useBalanceSheet = () => {
  const { data: rows = [], isLoading } = useTrialBalance();

  const balanceData = useMemo(() => {
    const balanceSheetAccounts: AccountWithBalance[] = rows
      .filter(row =>
        [AccountClass.Activo, AccountClass.Pasivo, AccountClass.Patrimonio]
          .includes(Number(row.code[0]) as 1 | 2 | 3)
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
      assets: balanceSheetAccounts.find(a => a.Code === "1")?.TotalBalance || 0,
      liabilities: balanceSheetAccounts.find(a => a.Code === "2")?.TotalBalance || 0,
      equity: balanceSheetAccounts.find(a => a.Code === "3")?.TotalBalance || 0,
    };

    return {
      accounts: balanceSheetAccounts,
      totals,
      isBalanced: Math.abs(totals.assets - (totals.liabilities + totals.equity)) < 0.01,
    };
  }, [rows]);

  return { ...balanceData, isLoading };
};