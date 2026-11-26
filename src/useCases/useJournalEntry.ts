import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateJournalEntryReq } from "../entities/JournalEntry";
import { JournalEntryListFilter, JournalEntryService } from "../services/journalEntryService";
import { useToast } from "../hooks/useToast";
import { useCompany } from "./useCompany";

export const useJournalEntries = (filter: JournalEntryListFilter = {}, enabled = true) => {
    const { activeCompanyId } = useCompany();

    return useQuery({
        queryKey: ["journal-entries", filter, activeCompanyId],
        queryFn: () => JournalEntryService.list(filter),
        enabled: Boolean(activeCompanyId) && enabled,
    });
};

export const useCreateJournalEntry = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (entry: CreateJournalEntryReq) => JournalEntryService.createManual(entry),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
            queryClient.invalidateQueries({ queryKey: ["trial-balance"] });
            toast({ title: "Asiento registrado", description: "El comprobante contable fue creado correctamente." });
        },
        onError: (error: Error) => {
            toast({ title: "No se pudo crear el asiento", description: error.message, variant: "destructive" });
        },
    });
};

export const useVoidJournalEntry = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (id: number) => JournalEntryService.void(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
            queryClient.invalidateQueries({ queryKey: ["trial-balance"] });
            toast({ title: "Comprobante anulado", description: "Se generó el asiento de reversa correspondiente." });
        },
        onError: (error: Error) => {
            toast({ title: "No se pudo anular el comprobante", description: error.message, variant: "destructive" });
        },
    });
};