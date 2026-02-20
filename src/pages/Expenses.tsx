import { useState } from "react";
import { Plus } from "lucide-react";
import { MainLayout } from "@/templates/MainLayout";
import { Button } from "@/components/atoms/Button";
import { ExpenseForm } from "@/components/organisms/expenses/ExpenseForm";
import { ExpenseList } from "@/components/organisms/expenses/ExpenseList";
import { Expense } from "@/entities/Expense";
import { useExpense } from "@/useCases/useExpense";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/molecules/AlertDialog";

export default function Expenses() {
    const {
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        markAsPaid,
        isLoading,
    } = useExpense();

    const [search, setSearch] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleSave = async (data: Omit<Expense, "ID" | "CreatedAt" | "SupplierName" | "CategoryName">) => {
        if (editingExpense) {
            const result = await updateExpense(editingExpense.ID, data);
            if (result.success) {
                toast.success("Gasto actualizado exitosamente");
            } else {
                toast.error(result.error || "Error al actualizar el gasto");
            }
        } else {
            const result = await addExpense(data);
            if (result.success) {
                toast.success("Gasto registrado exitosamente");
            } else {
                toast.error(result.error || "Error al registrar el gasto");
            }
        }
        setIsFormOpen(false);
        setEditingExpense(null);
    };

    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense);
        setIsFormOpen(true);
    };

    const handleDelete = async () => {
        if (deleteId) {
            const result = await deleteExpense(deleteId);
            if (result.success) {
                toast.success("Registro de gasto eliminado");
            } else {
                toast.error(result.error || "Error al eliminar el gasto");
            }
            setDeleteId(null);
        }
    };

    const handleMarkAsPaid = async (id: string) => {
        const result = await markAsPaid(id);
        if (result.success) {
            toast.success("Gasto marcado como pagado");
        } else {
            toast.error(result.error || "Error al actualizar estado");
        }
    };

    return (
        <MainLayout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Gastos y Compras</h1>
                    <p className="page-subtitle">
                        Control de cuentas por pagar y egresos de la empresa
                    </p>
                </div>
                <Button onClick={() => setIsFormOpen(true)} disabled={isLoading}>
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar Gasto
                </Button>
            </div>

            <ExpenseList
                expenses={expenses}
                search={search}
                onSearchChange={setSearch}
                onEdit={handleEdit}
                onDelete={setDeleteId}
                onMarkAsPaid={handleMarkAsPaid}
                isLoading={isLoading}
            />

            <ExpenseForm
                open={isFormOpen}
                onOpenChange={(open) => {
                    setIsFormOpen(open);
                    if (!open) setEditingExpense(null);
                }}
                expense={editingExpense}
                onSave={handleSave}
            />

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar registro de gasto?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará el registro permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </MainLayout>
    );
}
