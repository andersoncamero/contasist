import { useQuery } from "@tanstack/react-query";
import { JournalEntryService } from "../services/journalEntryService";
import { useCompany } from "./useCompany";

export const useTrialBalance = (filter: { from?: string; to?: string } = {}) => {
    const { activeCompanyId } = useCompany();

    return useQuery({
        queryKey: ["trial-balance", filter, activeCompanyId],
        queryFn: () => JournalEntryService.getTrialBalance(filter),
        enabled: Boolean(activeCompanyId),
    });
};