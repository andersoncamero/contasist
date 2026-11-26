import { useState } from "react";
import { Link, useParams } from "react-router-dom";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/molecules/Dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useInvoiceById, useInvoice } from "@/useCases/useInvoice";
import { useCompany } from "@/useCases/useCompany";
import { generateInvoicePDF } from "@/lib/PDF";
import { ArrowLeft, CheckCircle2, Download, DollarSign, Receipt, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const InvoiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: invoice, isLoading } = useInvoiceById(id);
  const { updateInvoiceStatus, registerPayment } = useInvoice();
  const { businessInfo } = useCompany();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState<string>("transfer");
  const [paymentNotes, setPaymentNotes] = useState<string>("");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  if (isLoading) {
    return (
      <MainLayout>
        <SEO title="Detalle de Factura" description="Cargando factura..." />
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Cargando factura comercial...</p>
        </div>
      </MainLayout>
    );
  }

  if (!invoice) {
    return (
      <MainLayout>
        <SEO title="Factura no encontrada" description="La factura solicitada no existe." />
        <div className="flex flex-col items-center justify-center py-20">
          <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-xl font-bold">Factura no encontrada</p>
          <Link to="/invoices" className="mt-4 underline">
            Volver a facturas
          </Link>
        </div>
      </MainLayout>
    );
  }

  const number = invoice.number || invoice.Number || "FAC-0001";
  const status = invoice.status || invoice.Status || "issued";
  const issueDate = invoice.issueDate || invoice.IssueDate || new Date();
  const dueDate = invoice.dueDate || invoice.DueDate || new Date();
  const subtotal = invoice.subtotal ?? invoice.Subtotal ?? 0;
  const taxAmount = invoice.taxAmount ?? invoice.TaxAmount ?? 0;
  const total = invoice.total ?? invoice.Total ?? 0;
  const balance = invoice.balance ?? invoice.Balance ?? total;
  const client = invoice.client || invoice.Client;
  const items = invoice.items || invoice.InvoiceItems || [];

  const handleDownloadPDF = async () => {
    try {
      await generateInvoicePDF(invoice, client, businessInfo);
      toast.success("PDF de factura descargado");
    } catch {
      toast.error("Error al generar el PDF de la factura");
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    const invId = invoice.id || invoice.ID;
    if (!invId) return;
    const result = await updateInvoiceStatus(invId, newStatus);
    if (result.success) {
      toast.success(`Estado actualizado a ${newStatus}`);
    } else {
      toast.error(result.error || "Error al actualizar estado");
    }
  };

  const handleOpenPaymentModal = () => {
    setPaymentAmount(balance);
    setIsPaymentModalOpen(true);
  };

  const handleRegisterPayment = async () => {
    const invId = invoice.id || invoice.ID;
    if (!invId) return;

    if (paymentAmount <= 0) {
      toast.error("El monto debe ser mayor a 0");
      return;
    }
    if (paymentAmount > balance) {
      toast.error("El monto no puede superar el saldo pendiente");
      return;
    }

    setIsSubmittingPayment(true);
    const result = await registerPayment(invId, {
      amount: paymentAmount,
      paymentDate: new Date(paymentDate).toISOString(),
      paymentMethod,
      notes: paymentNotes,
    });
    setIsSubmittingPayment(false);

    if (result.success) {
      toast.success("Pago registrado exitosamente");
      setIsPaymentModalOpen(false);
      setPaymentNotes("");
    } else {
      toast.error(result.error || "Error al registrar el pago");
    }
  };

  return (
    <MainLayout>
      <SEO title={`Factura ${number}`} description="Detalle de factura comercial en Contasist." />

      <div className="mb-8">
        <Link
          to="/invoices"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a facturas
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold font-mono tracking-tight">{number}</h1>
              {status === "paid" && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  Pagada
                </span>
              )}
              {status === "partially_paid" && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                  Abono Parcial
                </span>
              )}
              {status === "issued" && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  Por Cobrar
                </span>
              )}
              {status === "cancelled" && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                  Anulada
                </span>
              )}
            </div>
            <p className="mt-1 text-muted-foreground">
              Emitida el {formatDate(issueDate)} — Vence el {formatDate(dueDate)}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="issued">Por Cobrar</SelectItem>
                <SelectItem value="partially_paid">Abono Parcial</SelectItem>
                <SelectItem value="paid">Pagada</SelectItem>
                <SelectItem value="cancelled">Anulada</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Descargar PDF
            </Button>

            {status !== "paid" && status !== "cancelled" && (
              <Button onClick={handleOpenPaymentModal} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <DollarSign className="mr-2 h-4 w-4" />
                Registrar Pago
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="border rounded-lg bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Datos del Cliente
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-lg font-bold">{client?.name || client?.Name || "Cliente General"}</p>
                <p className="text-sm text-muted-foreground">NIT / C.C.: {client?.taxId || client?.TaxID || "No registrado"}</p>
              </div>
              <div className="text-sm">
                <p>{client?.email || client?.Email || "Sin correo"}</p>
                <p>{client?.phone || client?.Phone || "Sin teléfono"}</p>
                <p className="text-muted-foreground">{client?.address || client?.Address || "Sin dirección"}</p>
              </div>
            </div>
          </div>

          <div className="border rounded-lg bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Ítems Facturados
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b text-xs uppercase font-medium text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Descripción</th>
                    <th className="px-4 py-3 text-center">Cant.</th>
                    <th className="px-4 py-3 text-right">Precio Unit.</th>
                    <th className="px-4 py-3 text-right">Desc.</th>
                    <th className="px-4 py-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((it: any, idx: number) => {
                    const desc = it.description || it.Description || `Ítem #${idx + 1}`;
                    const qty = it.quantity ?? it.Quantity ?? 1;
                    const price = it.unitPrice ?? it.UnitPrice ?? 0;
                    const discount = it.discount ?? it.Discount ?? 0;
                    const itemSubtotal = it.subtotal ?? it.Subtotal ?? ((qty * price) - discount);

                    return (
                      <tr key={idx}>
                        <td className="px-4 py-3 font-medium">{desc}</td>
                        <td className="px-4 py-3 text-center">{qty}</td>
                        <td className="px-4 py-3 text-right font-mono">{formatCurrency(price)}</td>
                        <td className="px-4 py-3 text-right font-mono text-muted-foreground">{formatCurrency(discount)}</td>
                        <td className="px-4 py-3 text-right font-mono font-medium">{formatCurrency(itemSubtotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border rounded-lg bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Resumen de Factura
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IVA (19%)</span>
                <span className="font-mono">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-base">
                <span>Total Factura</span>
                <span className="font-mono">{formatCurrency(total)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-base text-amber-600">
                <span>Saldo por Cobrar</span>
                <span className="font-mono">{formatCurrency(balance)}</span>
              </div>
            </div>
          </div>

          <div className="border rounded-lg bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Condiciones de Pago
            </h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">Forma de Pago</span>
                <span className="font-medium capitalize">{invoice.paymentMethod || invoice.PaymentMethod || "Contado"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Plazo</span>
                <span className="font-medium">{invoice.paymentTerms || invoice.PaymentTerms || "Inmediato"}</span>
              </div>
              {invoice.notes && (
                <div className="pt-2 border-t">
                  <span className="text-muted-foreground block text-xs">Observaciones</span>
                  <p className="text-xs text-muted-foreground mt-1">{invoice.notes || invoice.Notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Registrar Abono / Pago</DialogTitle>
            <DialogDescription>
              Registra un pago recibido para amortizar el saldo de la factura {number}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">
                Saldo Actual
              </label>
              <p className="text-xl font-bold font-mono text-amber-600">{formatCurrency(balance)}</p>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">
                Monto del Pago (COP)
              </label>
              <Input
                type="number"
                min={1}
                max={balance}
                value={paymentAmount || ""}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">
                Fecha del Pago
              </label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">
                Medio de Pago
              </label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transfer">Transferencia Bancaria</SelectItem>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="card">Tarjeta Débito / Crédito</SelectItem>
                  <SelectItem value="check">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">
                Notas / Referencia de Pago
              </label>
              <Input
                placeholder="Ej. Transferencia Bancolombia #12345"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleRegisterPayment}
              disabled={isSubmittingPayment}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSubmittingPayment ? "Registrando..." : "Confirmar Pago"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

