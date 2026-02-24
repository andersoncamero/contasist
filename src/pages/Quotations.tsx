import { MainLayout } from "@/templates/MainLayout";
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
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/molecules/Select";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { formatCurrency, formatShortDate } from "@/lib/utils";

import { useQuotation } from "@/useCases/useQuotation";
import { Eye, FileText, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export const Quotations = () => {
  const { quotations, deleteQuotation, isLoading } = useQuotation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // React Query fetches automatically on mount

  const filteredQuotations = quotations.filter((q) => {
    const matchesSerch =
      q.number.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      q.clientName.toLocaleLowerCase().includes(search.toLocaleLowerCase());

    const matchesStatus = statusFilter === "all" || q.status === statusFilter;
    return matchesSerch && matchesStatus;
  });

  const sortedQuotations = [...filteredQuotations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const handleDelete = async () => {
    if (deleteId) {
      const result = await deleteQuotation(deleteId);
      if (result.success) {
        toast.success("Cotización eliminada exitosamente");
      } else {
        toast.error(result.error || "Error al eliminar cotización");
      }
      setDeleteId(null);
    }
  };

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Cotizaciones</h1>
          <p className="page-subtitle">
            Gestiona tus cotizaciones
          </p>
        </div>
        <Link to="/quotations/new">
          <Button disabled={isLoading}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Cotización
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por número o cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="draft">Borrador</SelectItem>
            <SelectItem value="sent">Enviada</SelectItem>
            <SelectItem value="approved">Aprobada</SelectItem>
            <SelectItem value="rejected">Rechazada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border-2 border-border bg-card rounded-lg overflow-hidden">
        <div className="table-header hidden md:flex gap-4">
          <div className="flex-1 text-left">Cotización</div>
          <div className="flex-1 text-left">Cliente</div>
          <div className="w-[120px] text-right">Total</div>
          <div className="w-[120px] text-center">Estado</div>
          <div className="w-[100px] text-right">Acciones</div>
        </div>

        {sortedQuotations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">No hay cotizaciones</p>
            <p className="text-muted-foreground">
              Crea tu primera cotización para comenzar
            </p>
          </div>
        ) : (
          <div className="divide-y-2 divide-border">
            {sortedQuotations.map((quotation) => (
              <div
                key={quotation.id}
                className="p-4 transition-colors hover:bg-accent"
              >
                {/* Layout móvil */}
                <div className="md:hidden space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold font-mono">{quotation.number}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatShortDate(quotation.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={quotation.status} />
                  </div>
                  <div>
                    <p className="font-medium">{quotation.clientName}</p>
                    <p className="text-sm text-muted-foreground">
                      {quotation.items.length} item(s)
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-bold">
                      {formatCurrency(quotation.total)}
                    </p>
                    <div className="flex gap-2">
                      <Link to={`/quotations/${quotation.id}`}>
                        <Button variant="outline" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setDeleteId(quotation.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Layout desktop */}
                <div className="hidden md:flex gap-4 items-center">
                  <div className="flex-1 text-left">
                    <p className="font-bold font-mono">{quotation.number}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatShortDate(quotation.createdAt)}
                    </p>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{quotation.clientName}</p>
                    <p className="text-sm text-muted-foreground">
                      {quotation.items.length} item(s)
                    </p>
                  </div>
                  <div className="w-[120px] text-right">
                    <p className="font-bold">
                      {formatCurrency(quotation.total)}
                    </p>
                  </div>
                  <div className="w-[120px] text-center">
                    <StatusBadge status={quotation.status} />
                  </div>
                  <div className="w-[100px] flex gap-2 justify-end">
                    <Link to={`/quotations/${quotation.id}`}>
                      <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setDeleteId(quotation.id)}
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

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cotización?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La cotización será eliminada
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};
