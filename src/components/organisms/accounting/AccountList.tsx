import React from "react";
import { Search, Pencil, Trash2, ListTree, ChevronRight } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Account, AccountClass } from "@/entities/Account";
import { cn } from "@/lib/utils";

interface AccountListProps {
    accounts: Account[];
    search: string;
    onSearchChange: (value: string) => void;
    onEdit: (account: Account) => void;
    onDelete: (id: string) => void;
    isLoading: boolean;
}

export function AccountList({
    accounts,
    search,
    onSearchChange,
    onEdit,
    onDelete,
    isLoading,
}: AccountListProps) {
    const filteredAccounts = accounts.filter(
        (account) =>
            account.Name.toLowerCase().includes(search.toLowerCase()) ||
            account.Code.includes(search)
    );

    const sortedAccounts = [...filteredAccounts].sort((a, b) => a.Code.localeCompare(b.Code));

    const getClassLabel = (cls: AccountClass) => {
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
        <div>
            <div className="mb-6 flex gap-4">
                <div className="relative max-w-md flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por código o nombre de cuenta..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <div className="border-2 border-border bg-card rounded-lg overflow-hidden">
                <div className="table-header rounded-t-lg hidden md:flex gap-4 px-4 py-3 bg-muted font-bold text-sm">
                    <div className="w-32">Código</div>
                    <div className="flex-1">Nombre de la Cuenta</div>
                    <div className="w-32">Clase</div>
                    <div className="w-24 text-center">Naturaleza</div>
                    <div className="w-24 text-right">Acciones</div>
                </div>

                {sortedAccounts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <ListTree className="h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-lg font-medium">No se encontraron cuentas</p>
                    </div>
                ) : (
                    <div className="divide-y-2 divide-border">
                        {sortedAccounts.map((account) => (
                            <div
                                key={account.ID}
                                className={cn(
                                    "flex gap-4 p-4 transition-colors hover:bg-accent items-center",
                                    account.Level === 1 && "bg-muted/30 font-bold"
                                )}
                            >
                                <div
                                    className="w-32 font-mono text-sm"
                                    style={{ paddingLeft: `${(account.Level - 1) * 12}px` }}
                                >
                                    <span className="flex items-center gap-1">
                                        {account.Level > 1 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                                        {account.Code}
                                    </span>
                                </div>

                                <div className="flex-1 text-sm">
                                    {account.Name}
                                </div>

                                <div className="w-32 text-xs">
                                    <span className="px-2 py-1 rounded bg-secondary border border-border">
                                        {getClassLabel(account.Class)}
                                    </span>
                                </div>

                                <div className="w-24 text-center text-xs">
                                    {account.Nature}
                                </div>

                                <div className="w-24 flex gap-2 justify-end">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                                        onClick={() => onEdit(account)}
                                        disabled={isLoading}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        onClick={() => onDelete(account.ID)}
                                        disabled={isLoading}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AccountList;
