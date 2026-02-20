import { Search, Pencil, Trash2, Receipt, CheckCircle } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { Expense } from "@/entities/Expense";
import { formatShortDate, formatCurrency } from "@/lib/utils";

interface ExpenseListProps {
    expenses: Expense[];
    search: string;
    onSearchChange: (value: string) => void;
    onEdit: (expense: Expense) => void;
    onDelete: (id: string) => void;
    onMarkAsPaid: (id: string) => void;
    isLoading: boolean;
}

export function ExpenseList({
    expenses,
    search,
    onSearchChange,
    onEdit,
    onDelete,
    onMarkAsPaid,
    isLoading,
}: ExpenseListProps) {
    const filteredExpenses = expenses.filter(
        (expense) =>
            expense.SupplierName?.toLowerCase().includes(search.toLowerCase()) ||
            expense.Reference?.toLowerCase().includes(search.toLowerCase()) ||
            expense.CategoryName?.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <div>
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por proveedor, referencia o categoría..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <div className="border-2 border-border bg-card rounded-lg overflow-hidden">
                <div className="table-header hidden md:flex gap-4">
                    <div className="flex-[1.5] flex items-center justify-start text-left">Gasto / Proveedor</div>
                    <div className="flex-1 flex items-center justify-start text-left">Categoría</div>
                    <div className="flex-1 flex items-center justify-start text-left">Fechas</div>
                    <div className="flex-1 flex items-center justify-end text-right">Monto</div>
                    <div className="w-[120px] flex items-center justify-center text-center">Estado</div>
                    <div className="w-[120px] flex items-center justify-end text-right">Acciones</div>
                </div>

                {filteredExpenses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <Receipt className="h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-lg font-medium">No hay gastos registrados</p>
                        <p className="text-muted-foreground">
                            Agrega tu primer gasto o factura para comenzar
                        </p>
                    </div>
                ) : (
                    <div className="divide-y-2 divide-border">
                        {filteredExpenses.map((expense) => (
                            <div key={expense.ID}>
                                {/* Mobile view */}
                                <div className="md:hidden p-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold truncate">{expense.SupplierName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Ref: {expense.Reference || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="ml-2">
                                            <StatusBadge status={expense.Status as any} />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <p className="text-muted-foreground">{expense.CategoryName}</p>
                                        <p className="font-bold text-base">{formatCurrency(expense.TotalAmount)}</p>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-border">
                                        <div className="text-xs text-muted-foreground">
                                            <p>Emisión: {formatShortDate(expense.Date)}</p>
                                            <p>Vence: {formatShortDate(expense.DueDate)}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            {expense.Status !== 'paid' && (
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => onMarkAsPaid(expense.ID)}
                                                    disabled={isLoading}
                                                    title="Marcar como pagado"
                                                >
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => onEdit(expense)}
                                                disabled={isLoading}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => onDelete(expense.ID)}
                                                disabled={isLoading}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop view */}
                                <div className="hidden md:flex gap-4 p-4 transition-colors hover:bg-accent items-center">
                                    <div className="flex-[1.5] flex flex-col justify-center items-start text-left">
                                        <p className="font-bold">{expense.SupplierName}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Ref: {expense.Reference || 'N/A'}
                                        </p>
                                    </div>

                                    <div className="flex-1 flex flex-col justify-center items-start text-left">
                                        <span className="inline-block px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">
                                            {expense.CategoryName}
                                        </span>
                                    </div>

                                    <div className="flex-1 flex flex-col justify-center items-start text-left text-sm">
                                        <p>Emisión: <span className="text-muted-foreground">{formatShortDate(expense.Date)}</span></p>
                                        <p>Vence: <span className="text-muted-foreground">{formatShortDate(expense.DueDate)}</span></p>
                                    </div>

                                    <div className="flex-1 flex flex-col justify-center items-end text-right">
                                        <p className="font-bold">{formatCurrency(expense.TotalAmount)}</p>
                                        {expense.TaxAmount > 0 && (
                                            <p className="text-xs text-muted-foreground">Incl. {formatCurrency(expense.TaxAmount)} imp.</p>
                                        )}
                                    </div>

                                    <div className="w-[120px] flex justify-center items-center">
                                        <StatusBadge status={expense.Status as any} />
                                    </div>

                                    <div className="w-[120px] flex gap-2 justify-end items-center">
                                        {expense.Status !== 'paid' && (
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => onMarkAsPaid(expense.ID)}
                                                disabled={isLoading}
                                                title="Marcar como pagado"
                                            >
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => onEdit(expense)}
                                            disabled={isLoading}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => onDelete(expense.ID)}
                                            disabled={isLoading}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
