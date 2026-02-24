import { Users, Package, FileText, TrendingUp } from "lucide-react";
import { MainLayout } from "@/templates/MainLayout";
import { StatCard } from "@/components/organisms/dashboard/StatCard";
import { RecentQuotations } from "@/components/organisms/dashboard/RecentQuotations";
import { formatCurrency } from "@/lib/utils";

import { useClient } from "@/useCases/useClient";
import { useProduct } from "@/useCases/useProduct";
import { useQuotation } from "@/useCases/useQuotation";

export const Dashboard = () => {
  const { clients } = useClient();
  const { products } = useProduct();
  const { quotations } = useQuotation();

  const approvedTotal = quotations
    .filter((q) => q.status === "approved")
    .reduce((sum, q) => sum + q.total, 0);

  const pendingQuotations = quotations.filter(
    (q) => q.status === "draft" || q.status === "sent",
  ).length;

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen general de tu negocio
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Clientes"
            value={clients.length}
            icon={Users}
            description="Total registrados"
          />
          <StatCard
            title={
              <>
                Productos <br /> Servicios
              </>
            }
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
          <StatCard
            title="Aprobadas"
            value={formatCurrency(approvedTotal)}
            icon={TrendingUp}
            description="Total aprobado"
          />
        </div>

        <div>
          <RecentQuotations />
        </div>
      </div>
    </MainLayout>
  );
};
