import { useState } from "react";
import { Plus } from "lucide-react";
import { MainLayout } from "@/templates/MainLayout";
import { Button } from "@/components/atoms/Button";
import { SupplierForm } from "@/components/organisms/suppliers/SupplierForm";
import { SupplierList } from "@/components/organisms/suppliers/SupplierList";
import { Supplier } from "@/entities/Supplier";
import { useSupplier } from "@/useCases/useSupplier";
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

export default function Suppliers() {
    const {
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        isLoading,
    } = useSupplier();

    const [search, setSearch] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleSave = async (data: Omit<Supplier, "ID" | "CreatedAt">) => {
        if (editingSupplier) {
            const result = await updateSupplier(editingSupplier.ID, data);
            if (result.success) {
                toast.success("Proveedor actualizado exitosamente");
            } else {
                toast.error(result.error || "Error al actualizar proveedor");
            }
        } else {
            const result = await addSupplier(data);
            if (result.success) {
                toast.success("Proveedor creado exitosamente");
            } else {
                toast.error(result.error || "Error al crear proveedor");
            }
        }
        setIsFormOpen(false);
        setEditingSupplier(null);
    };

    const handleEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setIsFormOpen(true);
    };

    const handleDelete = async () => {
        if (deleteId) {
            const result = await deleteSupplier(deleteId);
            if (result.success) {
                toast.success("Proveedor eliminado");
            } else {
                toast.error(result.error || "Error al eliminar proveedor");
            }
            setDeleteId(null);
        }
    };

    return (
        <MainLayout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Proveedores</h1>
                    <p className="page-subtitle">
                        Gestiona tus proveedores de bienes y servicios
                    </p>
                </div>
                <Button onClick={() => setIsFormOpen(true)} disabled={isLoading}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Proveedor
                </Button>
            </div>

            <SupplierList
                suppliers={suppliers}
                search={search}
                onSearchChange={setSearch}
                onEdit={handleEdit}
                onDelete={setDeleteId}
                isLoading={isLoading}
            />

            <SupplierForm
                open={isFormOpen}
                onOpenChange={(open) => {
                    setIsFormOpen(open);
                    if (!open) setEditingSupplier(null);
                }}
                supplier={editingSupplier}
                onSave={handleSave}
            />

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar proveedor?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminarán los datos de contacto del proveedor.
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
