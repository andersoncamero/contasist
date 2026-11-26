import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateAccountReq, UpdateAccountReq } from "../entities/Account";
import { AccountService } from "../services/accountService";
import { useToast } from "../hooks/useToast";
import { useCompany } from "./useCompany";

export const useChartOfAccounts = () => {
    const [search, setSearch] = React.useState("");
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { activeCompanyId } = useCompany();

    const { data: accounts = [], isLoading, refetch } = useQuery({
        queryKey: ["accounts", search, activeCompanyId],
        queryFn: () => AccountService.getAll({ search: search || undefined }),
        enabled: Boolean(activeCompanyId),
    });

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ["accounts"] });

    const showError = (title: string) => (error: Error) => {
        toast({ title, description: error.message, variant: "destructive" });
    };

    const createMutation = useMutation({
        mutationFn: (account: CreateAccountReq) => AccountService.create(account),
        onSuccess: invalidate,
        onError: showError("No se pudo crear la cuenta"),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateAccountReq }) => AccountService.update(id, data),
        onSuccess: invalidate,
        onError: showError("No se pudo actualizar la cuenta"),
    });

    const deactivateMutation = useMutation({
        mutationFn: (id: number) => AccountService.deactivate(id),
        onSuccess: invalidate,
        onError: showError("No se pudo desactivar la cuenta"),
    });

    return {
        accounts,
        isLoading,
        search,
        setSearch,
        addAccount: (account: CreateAccountReq) => createMutation.mutateAsync(account),
        updateAccount: (id: number, data: UpdateAccountReq) => updateMutation.mutateAsync({ id, data }),
        deactivateAccount: (id: number) => deactivateMutation.mutateAsync(id),
        refresh: refetch,
    };
};