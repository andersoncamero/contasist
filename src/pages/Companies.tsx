import { useState } from "react";
import { Plus, Search, Building2, Trash2 } from "lucide-react";
import { MainLayout } from "@/templates/MainLayout";
import { SEO } from "@/components/atoms/SEO";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { useCompany } from "@/useCases/useCompany";
import { CompanyDialog } from "@/components/organisms/dashboard/CompanyDialog";
import { useToast } from "@/hooks/useToast";
import { TableEmptyState } from "@/components/molecules/TableEmptyState";

export const Companies = () => {
  const { companies, isLoading, deleteCompany } = useCompany();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.nit.toLowerCase().includes(search.toLowerCase()) ||
    (c.economicActivity || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (confirm("¿Estás seguro de que deseas eliminar esta empresa?")) {
      const res = await deleteCompany(id);
      if (res.success) {
        toast({
          title: "Empresa eliminada",
          description: "Se eliminó la empresa exitosamente",
        });
      } else {
        toast({
          title: "Error",
          description: res.error || "No se pudo eliminar la empresa",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <MainLayout>
      <SEO
        title="Gestión de Empresas Tenant"
        description="Administra y registra las empresas tenant del sistema."
      />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Empresas</h1>
            <p className="text-sm text-muted-foreground">
              Administración de empresas tenant del sistema
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Nueva Empresa
          </Button>
        </div>

        <div className="flex items-center gap-2 max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, NIT o actividad..."
              className="pl-8 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {!isLoading && filteredCompanies.length === 0 ? (
          <TableEmptyState
            icon={Building2}
            title="Sin Empresas Registradas"
            description={
              search
                ? "No se encontraron empresas que coincidan con tu búsqueda."
                : "Registra tu primera empresa para habilitar la contabilidad y facturación."
            }
            actionLabel={!search ? "Nueva Empresa" : undefined}
            actionIcon={Plus}
            onAction={!search ? () => setDialogOpen(true) : undefined}
          />
        ) : (
        <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border uppercase text-[10px] font-semibold text-muted-foreground">
                <tr>
                  <th className="p-3">Razón Social</th>
                  <th className="p-3">NIT / ID Tributario</th>
                  <th className="p-3">Actividad Económica</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-muted-foreground">
                      Cargando empresas...
                    </td>
                  </tr>
                ) : (
                  filteredCompanies.map((comp) => {
                    const compId = comp.id || comp.ID;
                    return (
                      <tr key={compId} className="hover:bg-accent/40 transition-colors">
                        <td className="p-3 font-semibold text-foreground flex items-center gap-2">
                          <div className="h-7 w-7 rounded bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                            <Building2 className="h-4 w-4" />
                          </div>
                          {comp.name}
                        </td>
                        <td className="p-3 font-mono">{comp.nit}</td>
                        <td className="p-3 text-muted-foreground">
                          {comp.economicActivity || "General"}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            {comp.status || "ACTIVA"}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(compId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>

      <CompanyDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </MainLayout>
  );
};
