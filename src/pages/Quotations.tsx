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
import { useClient } from "@/useCases/useClient";
import { useCompany } from "@/useCases/useCompany";
import { Quotation } from "@/entities/Quotation";
import { GenerateProposalModal } from "@/components/organisms/quotations/GenerateProposalModal";
import { CreateStandaloneProposalModal } from "@/components/organisms/quotations/CreateStandaloneProposalModal";
import { Eye, FileText, Plus, Search, Trash2 } from "lucide-react";
import { TableEmptyState, tableEmptyStateButtonClassName } from "@/components/molecules/TableEmptyState";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { SEO } from "@/components/atoms/SEO";

export const Quotations = () => {
  const { quotations, deleteQuotation, isLoading: isQuotationLoading } = useQuotation();
  const { clients, isLoading: isClientsLoading } = useClient();
  const { businessInfo } = useCompany();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const [selectedProposalQuotation, setSelectedProposalQuotation] = useState<Quotation | null>(null);
  const [isStandaloneProposalOpen, setIsStandaloneProposalOpen] = useState(false);

  const isLoading = isQuotationLoading || isClientsLoading;

  const getClientName = (clientId: number) => {
    const client = clients.find((c) => (c.ID ?? c.id) === clientId);
    return client ? client.Name : "Cliente Desconocido";
  };

  const filteredQuotations = quotations.map(q => ({
    ...q,
    ClientName: q.ClientName || getClientName(q.ClientID)
  })).filter((q) => {
    const matchesSerch =
      q.Number?.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      q.ClientName?.toLocaleLowerCase().includes(search.toLocaleLowerCase());

    const matchesStatus = statusFilter === "all" || q.Status === statusFilter;
    return matchesSerch && matchesStatus;
  });

  const sortedQuotations = [...filteredQuotations].sort(
    (a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime(),
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

  const selectedProposalClient = selectedProposalQuotation
    ? clients.find((c) => (c.ID ?? c.id) === selectedProposalQuotation.ClientID)
    : null;

  return (
    <MainLayout>
      <SEO title="Cotizaciones" description="Administra tus cotizaciones y presupuestos." />
      <div className="page-header">
        <div>
          <h1 className="page-title">Cotizaciones</h1>
          <p className="page-subtitle">
            Gestiona tus cotizaciones y propuestas comerciales
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link to="/quotations/new">
            <Button disabled={isLoading}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Cotización
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => setIsStandaloneProposalOpen(true)}
            disabled={isLoading}
            className="border-primary/40 text-primary hover:bg-primary/10"
          >
            <FileText className="mr-2 h-4 w-4" />
            Crear Propuesta Comercial
          </Button>
        </div>
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

      {sortedQuotations.length === 0 ? (
        <TableEmptyState
          icon={FileText}
          title="Sin Cotizaciones"
          description={
            search || statusFilter !== "all"
              ? "No se encontraron cotizaciones con los filtros aplicados."
              : "Crea tu primera cotización para comenzar."
          }
          action={
            !search && statusFilter === "all" ? (
              <Link to="/quotations/new">
                <Button type="button" disabled={isLoading} className={tableEmptyStateButtonClassName}>
                  <Plus className="h-5 w-5" />
                  Crear Cotización
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
      <div className="border-2 border-border bg-card rounded-lg overflow-hidden">
        <div className="table-header rounded-t-lg hidden md:flex items-center gap-4 px-4 py-3 bg-muted/60 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <div className="w-[140px] text-left shrink-0">Cotización</div>
          <div className="flex-1 text-left min-w-0">Cliente</div>
          <div className="w-[110px] text-right shrink-0">Total</div>
          <div className="w-[110px] text-center shrink-0">Estado</div>
          <div className="w-[110px] text-right shrink-0">Acciones</div>
        </div>

          <div className="divide-y-2 divide-border">
            {sortedQuotations.map((quotation) => (
              <div
                key={quotation.ID}
                className="p-4 transition-colors hover:bg-accent"
              >
                <div className="md:hidden space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold font-mono">{quotation?.Number}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatShortDate(quotation.CreatedAt)}
                      </p>
                    </div>
                    <StatusBadge status={quotation.Status} />
                  </div>
                  <div>
                    <p className="font-medium">{quotation.ClientName}</p>
                    <p className="text-sm text-muted-foreground">
                      {quotation.Items.length} item(s)
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-bold">
                      {formatCurrency(quotation.Total)}
                    </p>
                    <div className="flex gap-2">
                      <Link to={`/quotations/${quotation.ID}`}>
                        <Button variant="outline" size="icon" title="Ver detalle">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-sm"
                        title="Eliminar"
                        onClick={() => setDeleteId(quotation.ID)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex gap-4 items-center">
                  <div className="w-[140px] text-left shrink-0">
                    <p className="font-bold font-mono text-sm">{quotation.Number}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatShortDate(quotation.CreatedAt)}
                    </p>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-sm truncate">{quotation.ClientName}</p>
                    <p className="text-xs text-muted-foreground">
                      {quotation.Items.length} item(s)
                    </p>
                  </div>
                  <div className="w-[110px] text-right shrink-0">
                    <p className="font-bold text-sm">
                      {formatCurrency(quotation.Total)}
                    </p>
                  </div>
                  <div className="w-[110px] flex justify-center shrink-0">
                    <StatusBadge status={quotation.Status} />
                  </div>
                  <div className="w-[110px] flex items-center justify-end gap-1.5 shrink-0">
                    <Link to={`/quotations/${quotation.ID}`}>
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border border-border bg-background hover:bg-accent text-foreground" title="Ver detalle">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-sm"
                      title="Eliminar"
                      onClick={() => setDeleteId(quotation.ID)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
      </div>
      )}

      {selectedProposalQuotation && (
        <GenerateProposalModal
          isOpen={!!selectedProposalQuotation}
          onClose={() => setSelectedProposalQuotation(null)}
          quotation={selectedProposalQuotation}
          client={selectedProposalClient}
          businessInfo={businessInfo}
        />
      )}

      <CreateStandaloneProposalModal
        isOpen={isStandaloneProposalOpen}
        onClose={() => setIsStandaloneProposalOpen(false)}
        businessInfo={businessInfo}
      />

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
