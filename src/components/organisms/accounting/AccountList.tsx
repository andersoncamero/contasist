import React from "react";
import { Search, Pencil, Trash2, ListTree, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Account, AccountClassType } from "@/entities/Account";
import { cn } from "@/lib/utils";
import { TableEmptyState } from "@/components/molecules/TableEmptyState";

interface AccountListProps {
    accounts: Account[];
    search: string;
    onSearchChange: (value: string) => void;
    onEdit: (account: Account) => void;
    onDeactivate: (id: number) => void;
    isLoading: boolean;
    onAddNew: () => void;
}

export function AccountList({
    accounts,
    search,
    onSearchChange,
    onEdit,
    onDeactivate,
    isLoading,
    onAddNew,
}: AccountListProps) {
    const filteredAccounts = (accounts || []).filter(
        (account) =>
            account.name.toLowerCase().includes(search.toLowerCase()) ||
            account.code.includes(search)
    );

    const sortedAccounts = [...filteredAccounts].sort((a, b) => a.code.localeCompare(b.code));

    const getClassLabel = (cls: AccountClassType) => {
        const labels: Record<number, string> = {
            1: "Activo",
            2: "Pasivo",
            3: "Patrimonio",
            4: "Ingresos",
            5: "Gastos",
            6: "Costos de Ventas",
            7: "Costos de Producción",
            8: "Orden Deudoras",
            9: "Orden Acreedoras",
        };
        return labels[cls] || "N/A";
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="relative max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por código o nombre de cuenta..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10 h-11 bg-white border-slate-200 rounded-xl shadow-sm focus:ring-primary/20 transition-all"
                    />
                </div>
            </div>

            {sortedAccounts.length === 0 ? (
                <TableEmptyState
                    icon={ListTree}
                    title="Sin Cuentas Configuradas"
                    description="Agrega tu primera cuenta buscando en el PUC estándar o créala manualmente para empezar tu contabilidad."
                    actionLabel="Agregar Nueva Cuenta"
                    actionIcon={Plus}
                    onAction={onAddNew}
                    actionDisabled={isLoading}
                />
            ) : (
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="text-left py-5 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-36">Código</th>
                                    <th className="text-left py-5 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nombre de la cuenta</th>
                                    <th className="text-left py-5 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-44">Clase</th>
                                    <th className="text-left py-5 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-32">Naturaleza</th>
                                    <th className="text-right py-5 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-24">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {sortedAccounts.map((account) => (
                                    <tr
                                        key={account.id}
                                        className={cn(
                                            "group transition-colors hover:bg-slate-50/80 items-center",
                                            account.level === 1 && "bg-slate-50/30 font-bold",
                                            !account.is_active && "opacity-50"
                                        )}
                                    >
                                        <td className="py-4 px-6">
                                            <div
                                                className="font-mono text-sm text-slate-700 flex items-center gap-1"
                                                style={{ paddingLeft: `${(account.level - 1) * 16}px` }}
                                            >
                                                {account.level > 1 && <ChevronRight className="h-3 w-3 text-slate-300" />}
                                                {account.code}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-slate-900 font-medium">
                                                {account.name}
                                                {!account.is_active && (
                                                    <span className="ml-2 text-[10px] font-bold uppercase text-red-500">Inactiva</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-600 whitespace-nowrap uppercase tracking-wider">
                                                {getClassLabel(account.class)}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={cn(
                                                "text-xs font-semibold italic",
                                                account.nature === 'Débito' ? "text-blue-600" : "text-amber-600"
                                            )}>
                                                {account.nature}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg"
                                                    onClick={() => onEdit(account)}
                                                    disabled={isLoading}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                                    onClick={() => onDeactivate(account.id)}
                                                    disabled={isLoading || !account.is_active}
                                                    title="Desactivar cuenta"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AccountList;
