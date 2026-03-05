import React from "react";
import { Search, Pencil, Trash2, ListTree, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Account, AccountClassType } from "@/entities/Account";
import { cn } from "@/lib/utils";

interface AccountListProps {
    accounts: Account[];
    search: string;
    onSearchChange: (value: string) => void;
    onEdit: (account: Account) => void;
    onDelete: (id: string) => void;
    isLoading: boolean;
    onAddNew: () => void;
}

export function AccountList({
    accounts,
    search,
    onSearchChange,
    onEdit,
    onDelete,
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

            {/* Empty State or Table */}
            {sortedAccounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white border-2 border-dashed border-slate-200 rounded-2xl animate-in fade-in zoom-in duration-500 shadow-sm">
                    <div className="bg-primary/10 p-5 rounded-full mb-6">
                        <ListTree className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Sin Cuentas Configuradas</h3>
                    <p className="text-slate-500 text-center max-w-sm mb-8 font-medium">
                        Agrega tu primera cuenta buscando en el PUC estándar o créala manualmente para empezar tu contabilidad.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <Button
                            onClick={onAddNew}
                            disabled={isLoading}
                            className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2"
                        >
                            <Plus className="h-5 w-5" />
                            Agregar Nueva Cuenta
                        </Button>
                    </div>
                </div>
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
                                            account.level === 1 && "bg-slate-50/30 font-bold"
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
                                            <div className="text-slate-900 font-medium">{account.name}</div>
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
                                                    onClick={() => onDelete(account.id)}
                                                    disabled={isLoading}
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
