import { Search, Pencil, Trash2, Truck } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Supplier } from "@/entities/Supplier";
import { formatShortDate } from "@/lib/utils";

interface SupplierListProps {
    suppliers: Supplier[];
    search: string;
    onSearchChange: (value: string) => void;
    onEdit: (supplier: Supplier) => void;
    onDelete: (id: string) => void;
    isLoading: boolean;
}

export function SupplierList({
    suppliers,
    search,
    onSearchChange,
    onEdit,
    onDelete,
    isLoading,
}: SupplierListProps) {
    const filteredSuppliers = suppliers.filter(
        (supplier) =>
            supplier.Name?.toLowerCase().includes(search.toLowerCase()) ||
            supplier.Email?.toLowerCase().includes(search.toLowerCase()) ||
            supplier.ContactName?.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <div>
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre, email o contacto..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <div className="border-2 border-border bg-card rounded-lg overflow-hidden">
                <div className="table-header hidden md:flex gap-4">
                    <div className="flex-1 flex items-center justify-start text-left">Proveedor</div>
                    <div className="flex-1 flex items-center justify-start text-left">Contacto</div>
                    <div className="flex-1 flex items-center justify-start text-left">Detalles</div>
                    <div className="w-[100px] flex items-center justify-end text-right">Acciones</div>
                </div>

                {filteredSuppliers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <Truck className="h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-lg font-medium">No hay proveedores</p>
                        <p className="text-muted-foreground">
                            Agrega tu primer proveedor para comenzar
                        </p>
                    </div>
                ) : (
                    <div className="divide-y-2 divide-border">
                        {filteredSuppliers.map((supplier) => (
                            <div key={supplier.ID}>
                                {/* Mobile view */}
                                <div className="md:hidden p-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold truncate">{supplier.Name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Contacto: {supplier.ContactName || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 ml-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => onEdit(supplier)}
                                                disabled={isLoading}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => onDelete(supplier.ID)}
                                                disabled={isLoading}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="text-sm space-y-1">
                                        <p>{supplier.Email}</p>
                                        <p className="text-muted-foreground">{supplier.Phone}</p>
                                    </div>
                                </div>

                                {/* Desktop view */}
                                <div className="hidden md:flex gap-4 p-4 transition-colors hover:bg-accent">
                                    <div className="flex-1 flex flex-col justify-center items-start text-left">
                                        <p className="font-bold">{supplier.Name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Desde {formatShortDate(supplier.CreatedAt)}
                                        </p>
                                    </div>

                                    <div className="flex-1 flex flex-col justify-center items-start text-left">
                                        <p className="text-sm">{supplier.Email}</p>
                                        <p className="text-sm text-muted-foreground">{supplier.Phone}</p>
                                    </div>

                                    <div className="flex-1 flex flex-col justify-center items-start text-left">
                                        <p className="text-sm text-muted-foreground">
                                            {supplier.ContactName ? `Contacto: ${supplier.ContactName}` : 'Sin contacto'}
                                        </p>
                                        {supplier.TaxId && (
                                            <p className="text-sm text-muted-foreground border border-border rounded px-1 mt-1 inline-block">
                                                NIT: {supplier.TaxId}
                                            </p>
                                        )}
                                    </div>

                                    <div className="w-[100px] flex gap-2 justify-end items-center">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => onEdit(supplier)}
                                            disabled={isLoading}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => onDelete(supplier.ID)}
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
