import { MainLayout } from "@/components/layout/MainLayout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/UI/AlertDialog";
import { Button } from "@/components/UI/Button";
import { Input } from "@/components/UI/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/Select";
import { StatusBadge } from "@/components/UI/StatusBadge";
import { formatCurrency, formatShortDate } from "@/lib/utils";

import { useQuotation } from "@/useCase/useQuotation";
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cotizaciones</h1>
          <p className="mt-1 text-muted-foreground">
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

      <div className="border-2 border-border bg-card rounded-lg">
        <div className="hidden md:grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 border-b-2 border-border bg-muted p-4 text-xs font-bold uppercase tracking-wide rounded-t-lg">
          <div>Cotización</div>
          <div>Cliente</div>
          <div>Total</div>
          <div>Estado</div>
          <div>Acciones</div>
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
                    <p className="font-mono font-bold">
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
                <div className="hidden md:grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 items-center">
                  <div>
                    <p className="font-bold font-mono">{quotation.number}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatShortDate(quotation.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">{quotation.clientName}</p>
                    <p className="text-sm text-muted-foreground">
                      {quotation.items.length} item(s)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold">
                      {formatCurrency(quotation.total)}
                    </p>
                  </div>
                  <div>
                    <StatusBadge status={quotation.status} />
                  </div>
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
