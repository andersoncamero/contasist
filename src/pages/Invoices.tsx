import { useState } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "@/templates/MainLayout";
import { SEO } from "@/components/atoms/SEO";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/molecules/Select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/molecules/Tabs";
import { EmitInvoiceCard } from "@/components/organisms/dian/EmitInvoiceCard";
import { DianDocumentsCard } from "@/components/organisms/dian/DianDocumentsCard";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import { useInvoices } from "@/useCases/useInvoice";
import { Eye, FilePlus2, FileText, Receipt, Search } from "lucide-react";
import { TableEmptyState, tableEmptyStateButtonClassName } from "@/components/molecules/TableEmptyState";

export const Invoices = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: invoices = [], isLoading } = useInvoices();

  const filteredInvoices = invoices.filter((inv) => {
    const number = inv.number || inv.Number || "";
    const clientName = inv.client?.name || inv.client?.Name || inv.Client?.name || inv.Client?.Name || "";
    const matchesSearch =
      number.toLowerCase().includes(search.toLowerCase()) ||
      clientName.toLowerCase().includes(search.toLowerCase());

    const status = inv.status || inv.Status || "";
    const matchesStatus = statusFilter === "all" || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalBilled = invoices.reduce((acc, inv) => acc + (inv.total || inv.Total || 0), 0);
  const totalBalance = invoices.reduce((acc, inv) => {
    const status = inv.status || inv.Status;
    if (status !== "cancelled") {
      return acc + (inv.balance ?? inv.Balance ?? 0);
    }
    return acc;
  }, 0);
  const paidCount = invoices.filter((inv) => (inv.status || inv.Status) === "paid").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Pagada</span>;
      case "partially_paid":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Abono Parcial</span>;
      case "issued":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Por Cobrar</span>;
      case "cancelled":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">Anulada</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">Borrador</span>;
    }
  };

  return (
    <MainLayout>
      <SEO title="Facturas de Venta" description="Gestión de facturación y cartera en Contasist." />

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facturación de Venta</h1>
          <p className="mt-1 text-muted-foreground">
            Control de facturas comerciales, cobros y estado de cartera.
          </p>
        </div>
      </div>

      <Tabs defaultValue="sales" className="w-full space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Facturas de venta
          </TabsTrigger>
          <TabsTrigger value="emit" className="flex items-center gap-2">
            <FilePlus2 className="h-4 w-4" />
            Emitir electrónica
          </TabsTrigger>
          <TabsTrigger value="dian" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documentos DIAN
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="border rounded-lg p-4 bg-card shadow-sm">
              <p className="text-xs uppercase font-medium text-muted-foreground">Total Facturado</p>
              <p className="text-2xl font-bold font-mono mt-1">{formatCurrency(totalBilled)}</p>
              <p className="text-xs text-muted-foreground mt-1">{invoices.length} facturas emitidas</p>
            </div>
            <div className="border rounded-lg p-4 bg-card shadow-sm">
              <p className="text-xs uppercase font-medium text-amber-600">Cartera por Cobrar</p>
              <p className="text-2xl font-bold font-mono text-amber-600 mt-1">{formatCurrency(totalBalance)}</p>
              <p className="text-xs text-muted-foreground mt-1">Saldo pendiente de pago</p>
            </div>
            <div className="border rounded-lg p-4 bg-card shadow-sm">
              <p className="text-xs uppercase font-medium text-emerald-600">Facturas Canceladas</p>
              <p className="text-2xl font-bold font-mono text-emerald-600 mt-1">{paidCount}</p>
              <p className="text-xs text-muted-foreground mt-1">100% liquidadas</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número o cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="issued">Por Cobrar</SelectItem>
                <SelectItem value="partially_paid">Abono Parcial</SelectItem>
                <SelectItem value="paid">Pagadas</SelectItem>
                <SelectItem value="cancelled">Anuladas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!isLoading && filteredInvoices.length === 0 ? (
            <TableEmptyState
              icon={Receipt}
              title="Sin Facturas Registradas"
              description="Las cotizaciones aprobadas se pueden facturar con 1-clic desde su detalle."
              action={
                <Link to="/quotations">
                  <Button type="button" className={tableEmptyStateButtonClassName}>
                    <FileText className="h-5 w-5" />
                    Ir a Cotizaciones
                  </Button>
                </Link>
              }
            />
          ) : (
          <div className="border rounded-lg bg-card overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                <p>Cargando facturas...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 border-b text-xs uppercase font-medium text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Número</th>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">Emisión</th>
                      <th className="px-4 py-3">Vencimiento</th>
                      <th className="px-4 py-3 text-right">Total</th>
                      <th className="px-4 py-3 text-right">Saldo</th>
                      <th className="px-4 py-3 text-center">Estado</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredInvoices.map((inv) => {
                      const id = inv.id || inv.ID;
                      const number = inv.number || inv.Number;
                      const clientName = inv.client?.name || inv.client?.Name || inv.Client?.name || inv.Client?.Name || "Cliente General";
                      const issueDate = inv.issueDate || inv.IssueDate;
                      const dueDate = inv.dueDate || inv.DueDate;
                      const total = inv.total || inv.Total || 0;
                      const balance = inv.balance ?? inv.Balance ?? total;
                      const status = inv.status || inv.Status || "issued";

                      return (
                        <tr key={id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-mono font-medium">{number}</td>
                          <td className="px-4 py-3 font-medium">{clientName}</td>
                          <td className="px-4 py-3 text-muted-foreground">{formatShortDate(issueDate)}</td>
                          <td className="px-4 py-3 text-muted-foreground">{formatShortDate(dueDate)}</td>
                          <td className="px-4 py-3 font-mono text-right font-medium">{formatCurrency(total)}</td>
                          <td className="px-4 py-3 font-mono text-right font-bold text-amber-600">{formatCurrency(balance)}</td>
                          <td className="px-4 py-3 text-center">{getStatusBadge(status)}</td>
                          <td className="px-4 py-3 text-right">
                            <Link to={`/invoices/${id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                Ver
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          )}
        </TabsContent>

        <TabsContent value="emit" className="space-y-6">
          <EmitInvoiceCard />
        </TabsContent>

        <TabsContent value="dian" className="space-y-6">
          <DianDocumentsCard />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

