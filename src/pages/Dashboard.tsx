import { useState } from "react";
import { Building2, FileText, Package, Plus, Users } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/templates/MainLayout";
import { StatCard } from "@/components/organisms/dashboard/StatCard";
import { RecentQuotations } from "@/components/organisms/dashboard/RecentQuotations";
import { CompanyDialog } from "@/components/organisms/dashboard/CompanyDialog";
import { Button } from "@/components/atoms/Button";
import { SEO } from "@/components/atoms/SEO";
import { useClient } from "@/useCases/useClient";
import { useCompany } from "@/useCases/useCompany";
import { useProduct } from "@/useCases/useProduct";
import { useQuotation } from "@/useCases/useQuotation";

const DashboardOverview = () => {
  const { clients } = useClient();
  const { products } = useProduct();
  const { quotations } = useQuotation();

  const pendingQuotations = quotations.filter(
    (q) => q.Status === "draft" || q.Status === "sent",
  ).length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen general de tu negocio
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Clientes"
          value={clients.length}
          icon={Users}
          description="Total registrados"
        />
        <StatCard
          title="Productos / Servicios"
          value={products.length}
          icon={Package}
          description="En catálogo"
        />
        <StatCard
          title="Cotizaciones"
          value={quotations.length}
          icon={FileText}
          description={`${pendingQuotations} pendientes`}
        />
      </div>

      <div>
        <RecentQuotations />
      </div>
    </div>
  );
};

export const Dashboard = () => {
  const queryClient = useQueryClient();
  const { hasCompanies, isLoading, refetch } = useCompany();
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <MainLayout>
      <SEO title="Dashboard" description="Resumen general de tu negocio: clientes, productos y cotizaciones." />
      {isLoading ? (
        <div className="p-6 text-sm text-muted-foreground">Cargando información de tu empresa...</div>
      ) : hasCompanies ? (
        <DashboardOverview />
      ) : (
        <div className="p-6">
          <div className="max-w-xl mx-auto mt-10 rounded-2xl border-2 border-dashed border-border bg-card p-8 text-center space-y-5 shadow-sm">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Building2 className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Registra tu primera empresa para comenzar</h1>
              <p className="text-sm text-muted-foreground">
                Crea tu empresa con su razón social y NIT para habilitar tu Plan Único de Cuentas (PUC), clientes, cotizaciones y facturación.
              </p>
            </div>
            <Button type="button" size="lg" onClick={() => setOpenDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Registrar Primera Empresa
            </Button>
          </div>
          <CompanyDialog
            open={openDialog}
            onOpenChange={setOpenDialog}
            onSuccess={(newCompanyId) => {
              localStorage.setItem("active_company_id", newCompanyId.toString());
              queryClient.invalidateQueries();
              void refetch();
              window.location.reload();
            }}
          />
        </div>
      )}
    </MainLayout>
  );
};
