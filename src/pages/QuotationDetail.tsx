import { MainLayout } from "@/templates/MainLayout";
import { Button } from "@/components/atoms/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/molecules/Select";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { generatePDF } from "@/lib/PDF";
import { formatCurrency, formatDate } from "@/lib/utils";

import { useBusiness } from "@/useCases/useBusiness";
import { useClient } from "@/useCases/useClient";
import { useQuotation } from "@/useCases/useQuotation";

import { ArrowLeft, Check, Download, Send, X } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export const QuotationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clients } = useClient();
  const { quotations, updateQuotation, updateQuotationStatus, isLoading } = useQuotation();
  const { businessInfo } = useBusiness();

  const quotation = quotations.find((q) => q.ID === Number(id));
  const client = clients.find((c) => c.ID === quotation?.ClientID);

  if (!quotation) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-xl font-bold">Cotización no encontrada</p>
          <Link to="/quotations" className="mt-4 underline">
            Volver a cotizaciones
          </Link>
        </div>
      </MainLayout>
    );
  }

  const handleStatusChange = (status: string) => {
    updateQuotationStatus(quotation.ID, status as typeof quotation.Status);
    toast.success(`Estado actualizado a  ${status}`);
  };

  const handleDownloadPDF = () => {
    generatePDF(quotation, client, businessInfo);
    toast.success("PDF descargado");
  };

  const handleSend = () => {
    updateQuotationStatus(quotation.ID, "sent");
    toast.success("Cotizacion marcada como enviada");
  };

  return (
    <MainLayout>
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
              disabled={isLoading}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="sent">Enviada</SelectItem>
                <SelectItem value="approved">Aprobada</SelectItem>
                <SelectItem value="rejected">Rechazada</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>

            {quotation.Status === 'draft' && (
              <Button onClick={handleSend} disabled={isLoading}>
                <Send className="mr-2 h-4 w-4" />
                Marcar Enviada
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Client Info */}
          <div className="border-2 border-border bg-card p-6 rounded-lg">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Cliente
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-lg font-bold">{client?.Name || quotation.ClientName}</p>
                {client?.Company && (
                  <p className="text-muted-foreground">{client.Company}</p>
                )}
              </div>
              <div className="text-sm">
                {client?.Email && <p>{client.Email}</p>}
                {client?.Phone && <p>{client.Phone}</p>}
                {client?.Address && (
                  <p className="text-muted-foreground">{client.Address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="border-2 border-border bg-card rounded-lg">
            <div className="border-b-2 border-border p-4">
              <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Detalle
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-border bg-muted">
                    <th className="p-4 text-left text-xs font-bold uppercase">
                      Concepto
                    </th>
                    <th className="p-4 text-right text-xs font-bold uppercase">
                      Cantidad
                    </th>
                    <th className="p-4 text-right text-xs font-bold uppercase">
                      Precio
                    </th>
                    <th className="p-4 text-right text-xs font-bold uppercase">
                      Desc.
                    </th>
                    <th className="p-4 text-right text-xs font-bold uppercase">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-border">
                  {quotation.Items.map((item) => (
                    <tr key={item.ID}>
                      <td className="p-4">
                        <p className="font-bold">{item.ProductName}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.Description}
                        </p>
                      </td>
                      <td className="p-4 text-right">{item.Quantity}</td>
                      <td className="p-4 text-right">
                        {formatCurrency(item.UnitPrice)}
                      </td>
                      <td className="p-4 text-right">
                        {item.Discount > 0 ? `${item.Discount}%` : '—'}
                      </td>
                      <td className="p-4 text-right font-bold">
                        {formatCurrency(item.Subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          {quotation.Notes && (
            <div className="border-2 border-border bg-card p-6 rounded-lg">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Notas
              </h2>
              <p className="whitespace-pre-wrap">{quotation.Notes}</p>
            </div>
          )}
        </div>

        {/* Summary */}
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
                <span className="text-muted-foreground">Última actualización</span>
                <span>{formatDate(quotation.UpdatedAt)}</span>
              </div>
            </div>
          </div>

          {quotation.Status === 'sent' && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleStatusChange('rejected')}
                disabled={isLoading}
              >
                <X className="mr-2 h-4 w-4" />
                Rechazada
              </Button>
              <Button
                className="flex-1"
                onClick={() => handleStatusChange('approved')}
                disabled={isLoading}
              >
                <Check className="mr-2 h-4 w-4" />
                Aprobada
              </Button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};
