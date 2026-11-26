import { useState } from "react";
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
import { SEO } from "@/components/atoms/SEO";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import { useProposal } from "@/useCases/useProposal";
import { useCompany } from "@/useCases/useCompany";
import { Proposal, ProposalStatus } from "@/entities/Proposal";
import { ProposalDialog } from "@/components/organisms/proposals/ProposalDialog";
import { generateProposalPDF } from "@/lib/ProposalPDF";
import { Download, FileText, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { TableEmptyState } from "@/components/molecules/TableEmptyState";
import { toast } from "sonner";

export const Proposals = () => {
  const { proposals, addProposal, updateProposal, deleteProposal, isLoading } = useProposal();
  const { businessInfo } = useCompany();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filteredProposals = proposals.filter((prop) => {
    const matchesSearch =
      prop.number.toLowerCase().includes(search.toLowerCase()) ||
      prop.title.toLowerCase().includes(search.toLowerCase()) ||
      prop.clientName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || prop.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleEdit = (prop: Proposal) => {
    setEditingProposal(prop);
    setDialogOpen(true);
  };

  const handleCreateNew = () => {
    setEditingProposal(null);
    setDialogOpen(true);
  };

  const handleSave = async (data: Partial<Proposal>) => {
    if (editingProposal) {
      const result = await updateProposal(editingProposal.id, data);
      if (result.success) {
        toast.success("Propuesta comercial actualizada exitosamente");
      } else {
        toast.error(`Error al actualizar propuesta: ${result.error}`);
      }
    } else {
      const result = await addProposal(data);
      if (result.success) {
        toast.success("Propuesta comercial creada exitosamente");
      } else {
        toast.error(`Error al crear propuesta: ${result.error}`);
      }
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      const result = await deleteProposal(deleteId);
      if (result.success) {
        toast.success("Propuesta comercial eliminada");
      } else {
        toast.error(`Error al eliminar propuesta: ${result.error}`);
      }
      setDeleteId(null);
    }
  };

  const handleDownloadPDF = async (prop: Proposal) => {
    const mockQuotation: any = {
      ID: prop.id,
      Number: prop.number,
      ClientID: prop.clientId,
      ClientName: prop.clientName,
      CreatedAt: prop.createdAt || new Date().toISOString(),
      Subtotal: prop.subtotal,
      TaxAmount: prop.taxAmount,
      Total: prop.total,
      Items: prop.items.map((it) => ({
        ID: it.id,
        ProductName: it.productName,
        Description: it.description,
        Quantity: it.quantity,
        UnitPrice: it.unitPrice,
        Subtotal: it.subtotal,
      })),
    };

    try {
      await generateProposalPDF(mockQuotation, { ID: prop.clientId, Name: prop.clientName } as any, businessInfo, {
        introductionText: prop.objective,
        scopeDetails: prop.scope,
        warrantyInfo: prop.deliverables,
        paymentTerms: prop.commercialTerms,
      });
      toast.success(`PDF de la propuesta ${prop.number} descargado`);
    } catch {
      toast.error("Error al generar el PDF de la propuesta");
    }
  };

  return (
    <MainLayout>
      <SEO title="Propuestas Comerciales" description="Administra tus propuestas técnicas y comerciales." />

      <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="page-title text-2xl font-bold">Propuestas Comerciales</h1>
          <p className="page-subtitle text-xs text-muted-foreground">
            Gestiona tus ofertas técnicas, alcance y condiciones comerciales
          </p>
        </div>
        <Button onClick={handleCreateNew} disabled={isLoading} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Propuesta Comercial
        </Button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por folio, título o cliente..."
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

      {filteredProposals.length === 0 ? (
        <TableEmptyState
          icon={FileText}
          title="Sin Propuestas Comerciales"
          description={
            search || statusFilter !== "all"
              ? "No se encontraron propuestas con los filtros aplicados."
              : "Crea tu primera propuesta comercial técnica y económica para comenzar."
          }
          actionLabel={!search && statusFilter === "all" ? "Nueva Propuesta Comercial" : undefined}
          actionIcon={Plus}
          onAction={!search && statusFilter === "all" ? handleCreateNew : undefined}
          actionDisabled={isLoading}
        />
      ) : (
      <div className="border-2 border-border bg-card rounded-lg overflow-hidden shadow-sm">
        <div className="table-header rounded-t-lg hidden md:flex items-center gap-4 px-4 py-3 bg-muted/60 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
          <div className="w-[120px] text-left shrink-0">Folio</div>
          <div className="flex-1 text-left min-w-0">Título / Cliente</div>
          <div className="w-[120px] text-left shrink-0">Ejecución</div>
          <div className="w-[110px] text-right shrink-0">Total</div>
          <div className="w-[110px] text-center shrink-0">Estado</div>
          <div className="w-[120px] text-right shrink-0">Acciones</div>
        </div>

          <div className="divide-y divide-border">
            {filteredProposals.map((prop) => (
              <div key={prop.id} className="p-4 hover:bg-muted/40 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="w-[120px] shrink-0">
                    <p className="font-bold font-mono text-sm text-primary">{prop.number}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatShortDate(prop.createdAt || new Date().toISOString())}
                    </p>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-foreground truncate">{prop.title}</p>
                    <p className="text-xs text-muted-foreground truncate">Cliente: {prop.clientName}</p>
                  </div>

                  <div className="w-[120px] shrink-0 text-xs text-muted-foreground">
                    <span className="font-medium">{prop.executionTime || "15 días"}</span>
                  </div>

                  <div className="w-[110px] text-right shrink-0">
                    <p className="font-bold text-sm font-mono">{formatCurrency(prop.total)}</p>
                  </div>

                  <div className="w-[110px] flex justify-center shrink-0">
                    <StatusBadge status={prop.status} />
                  </div>

                  <div className="w-[120px] flex items-center justify-end gap-1.5 shrink-0">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full border border-border bg-background hover:bg-accent text-foreground"
                      title="Descargar PDF"
                      onClick={() => handleDownloadPDF(prop)}
                    >
                      <Download className="h-4 w-4 text-primary" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full border border-border bg-background hover:bg-accent text-foreground"
                      title="Editar"
                      onClick={() => handleEdit(prop)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-sm"
                      title="Eliminar"
                      onClick={() => setDeleteId(prop.id)}
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

      <ProposalDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingProposal(null);
        }}
        proposal={editingProposal}
        onSave={handleSave}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar propuesta comercial?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La propuesta comercial será eliminada permanentemente.
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
