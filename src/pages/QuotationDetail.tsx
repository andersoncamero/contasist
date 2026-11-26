import { MainLayout } from "@/templates/MainLayout";
import { Button } from "@/components/atoms/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/molecules/Select";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { generatePDF } from "@/lib/PDF";
import { formatCurrency, formatDate } from "@/lib/utils";

import { useCompany } from "@/useCases/useCompany";
import { useClient, useClientById } from "@/useCases/useClient";
import { useQuotation, useQuotationById } from "@/useCases/useQuotation";
import { useInvoice } from "@/useCases/useInvoice";

import { ArrowLeft, Check, Download, FileText, Receipt, Send, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { SEO } from "@/components/atoms/SEO";
import { GenerateProposalModal } from "@/components/organisms/quotations/GenerateProposalModal";

export const QuotationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const { clients, isLoading: isClientsLoading } = useClient();
  const { updateQuotationStatus, isLoading: isUpdating } = useQuotation();
  const { convertQuotationToInvoice } = useInvoice();
  const [isConverting, setIsConverting] = useState(false);
  const { data: quotation, isLoading: isQuotationLoading } = useQuotationById(id);
  const { data: fetchedClient, isLoading: isSingleClientLoading } = useClientById(quotation?.ClientID);
  const { businessInfo } = useCompany();

  const client = clients.find((c) => (c.ID ?? c.id) === quotation?.ClientID) || fetchedClient || null;
  const isClientLoading = isClientsLoading || isSingleClientLoading;

  const rawClientName = client?.Name || client?.name || quotation?.ClientName || quotation?.Client?.Name || quotation?.Client?.name || "";
  const clientName = rawClientName
    ? rawClientName
    : (isClientLoading ? "Cargando cliente..." : (quotation?.ClientID ? `Cliente #${quotation.ClientID}` : "Sin cliente asignado"));
  const clientCompany = client?.Company || client?.company || quotation?.ClientCompany || quotation?.Client?.Company || quotation?.Client?.company || "";
  const clientEmail = client?.Email || client?.email || quotation?.ClientEmail || quotation?.Client?.Email || quotation?.Client?.email || "";
  const clientPhone = client?.Phone || client?.phone || quotation?.ClientPhone || quotation?.Client?.Phone || quotation?.Client?.phone || "";
  const clientAddress = client?.Address || client?.address || quotation?.ClientAddress || quotation?.Client?.Address || quotation?.Client?.address || "";

  if (isQuotationLoading) {
    return (
      <MainLayout>
        <SEO title="Detalle de Cotización" description="Revisa el detalle de tu cotización." />
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Cargando cotización...</p>
        </div>
      </MainLayout>
    );
  }

  if (!quotation) {
    return (
      <MainLayout>
        <SEO title="Detalle de Cotización" description="Revisa el detalle de tu cotización." />
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-xl font-bold">Cotización no encontrada</p>
          <Link to="/quotations" className="mt-4 underline">
            Volver a cotizaciones
          </Link>
        </div>
      </MainLayout>
    );
  }

  const handleStatusChange = async (status: string) => {
    const result = await updateQuotationStatus(quotation.ID, status as typeof quotation.Status);
    if (result.success) {
      toast.success(`Estado actualizado a ${status}`);
    } else {
      toast.error(result.error || "Error al actualizar el estado");
    }
  };

  const handleDownloadPDF = () => {
    generatePDF(quotation, client, businessInfo);
    toast.success("PDF descargado");
  };

  const handleSend = async () => {
    const result = await updateQuotationStatus(quotation.ID, "sent");
    if (result.success) {
      toast.success("Cotizacion marcada como enviada");
    } else {
      toast.error(result.error || "Error al marcar como enviada");
    }
  };

  const handleConvertToInvoice = async () => {
    setIsConverting(true);
    const result = await convertQuotationToInvoice(quotation.ID);
    setIsConverting(false);
    if (result.success) {
      toast.success("Factura comercial generada con éxito");
      const invoiceId = result.data?.id || result.data?.ID;
      if (invoiceId) {
        navigate(`/invoices/${invoiceId}`);
      } else {
        navigate("/invoices");
      }
    } else {
      toast.error(result.error || "Error al generar la factura");
    }
  };

  return (
    <MainLayout>
      <SEO title="Detalle de Cotización" description="Revisa el detalle de tu cotización." />
      <div className="mb-8">
        <Link
          to="/quotations"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a cotizaciones
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold font-mono tracking-tight">
                {quotation.Number}
              </h1>
              <StatusBadge status={quotation.Status} />
            </div>
            <p className="mt-1 text-muted-foreground">
              Creada el {formatDate(quotation.CreatedAt)}
            </p>
          </div>

          <div className="flex gap-3">
            <Select
              value={quotation.Status}
              onValueChange={handleStatusChange}
              disabled={isUpdating}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="sent">Enviada</SelectItem>
                <SelectItem value="approved">Aprobada</SelectItem>
                <SelectItem value="rejected">Rechazada</SelectItem>
                <SelectItem value="billed">Facturada</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>

            {quotation.Status === 'draft' && (
              <Button onClick={handleSend} disabled={isUpdating}>
                <Send className="mr-2 h-4 w-4" />
                Marcar Enviada
              </Button>
            )}

            {(quotation.Status === 'approved' || quotation.Status === 'accepted') && (
              <Button
                onClick={handleConvertToInvoice}
                disabled={isConverting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Receipt className="mr-2 h-4 w-4" />
                {isConverting ? "Facturando..." : "Facturar Cotización"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="border-2 border-border bg-card p-6 rounded-lg">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Cliente
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-lg font-bold">
                  {clientName}
                </p>
                {clientCompany && (
                  <p className="text-muted-foreground">{clientCompany}</p>
                )}
              </div>
              <div className="text-sm">
                {clientEmail && <p>{clientEmail}</p>}
                {clientPhone && <p>{clientPhone}</p>}
                {clientAddress && (
                  <p className="text-muted-foreground">{clientAddress}</p>
                )}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="border-2 border-border bg-card rounded-lg overflow-hidden">
            <div className="border-b-2 border-border p-4 bg-muted/20">
              <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Detalle
              </h2>
            </div>

            {/* Header Desktop */}
            <div className="table-header hidden md:flex gap-4 border-b-2 border-border bg-muted/30">
              <div className="flex-[2] text-left">Concepto</div>
              <div className="flex-1 text-center">Cant.</div>
              <div className="flex-1 text-right">Precio</div>
              <div className="flex-1 text-right">Desc.</div>
              <div className="flex-1 text-right">Subtotal</div>
            </div>

            <div className="divide-y-2 divide-border">
              {quotation.Items.map((item) => (
                <div key={item.ProductID} className="p-4 transition-colors hover:bg-accent/50">
                  {/* Layout Desktop */}
                  <div className="hidden md:flex gap-4 items-center">
                    <div className="flex-[2] text-left min-w-0">
                      <p className="font-bold truncate">{item.ProductName}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {item.Description}
                      </p>
                    </div>
                    <div className="flex-1 text-center">{item.Quantity}</div>
                    <div className="flex-1 text-right">{formatCurrency(item.UnitPrice)}</div>
                    <div className="flex-1 text-right">
                      {item.Discount > 0 ? `${item.Discount}%` : "—"}
                    </div>
                    <div className="flex-1 text-right font-bold">
                      {formatCurrency(item.Subtotal)}
                    </div>
                  </div>

                  {/* Layout Móvil */}
                  <div className="md:hidden space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold">{item.ProductName}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {item.Description}
                        </p>
                      </div>
                      <p className="font-bold whitespace-nowrap">
                        {formatCurrency(item.Subtotal)}
                      </p>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
                      <span>
                        {item.Quantity} x {formatCurrency(item.UnitPrice)}
                      </span>
                      {item.Discount > 0 && (
                        <span className="text-destructive">
                          Desc: {item.Discount}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Note */}
          {quotation.Note && (
            <div className="border-2 border-border bg-card p-6 rounded-lg">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Notas
              </h2>
              <p className="whitespace-pre-wrap">{quotation.Note}</p>
            </div>
          )}
        </div>

        {/* Summary side */}
        <div className="space-y-6">
          <div className="border-2 border-border bg-card p-6 rounded-lg">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Totales
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(quotation.Subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  IVA ({quotation.TaxRate}%)
                </span>
                <span>{formatCurrency(quotation.TaxAmount)}</span>
              </div>
              <div className="border-t-2 border-border pt-3">
                <div className="flex justify-between">
                  <span className="text-xl font-bold">Total</span>
                  <span className="text-xl font-bold">
                    {formatCurrency(quotation.Total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-2 border-border bg-card p-6 rounded-lg">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Información
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Válida hasta</span>
                <span>{formatDate(quotation.ValidUntil)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Última actualización
                </span>
                <span>{formatDate(quotation.UpdatedAt)}</span>
              </div>
            </div>
          </div>

          {quotation.Status === "sent" && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleStatusChange("rejected")}
                disabled={isUpdating}
              >
                <X className="mr-2 h-4 w-4" />
                Rechazada
              </Button>
              <Button
                className="flex-1"
                onClick={() => handleStatusChange("approved")}
                disabled={isUpdating}
              >
                <Check className="mr-2 h-4 w-4" />
                Aprobada
              </Button>
            </div>
          )}
        </div>
      </div>

      <GenerateProposalModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        quotation={quotation}
        client={client}
        businessInfo={businessInfo}
      />
    </MainLayout>
  );
};

