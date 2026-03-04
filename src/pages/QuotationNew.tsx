import { MainLayout } from "@/templates/MainLayout";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/molecules/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { QuotationItem } from "@/entities/QuotationItem";
import {
  formatCurrency,
  generateQuotationNumber,
} from "@/lib/utils";

import { useBusiness } from "@/useCases/useBusiness";
import { useClient } from "@/useCases/useClient";
import { useProduct } from "@/useCases/useProduct";
import { useQuotation } from "@/useCases/useQuotation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const QuotationNew = () => {
  const navigate = useNavigate();
  const { clients } = useClient();
  const { products } = useProduct();
  const { addQuotation, isLoading } = useQuotation();
  const { businessInfo } = useBusiness();

  // React Query fetches automatically on mount

  const [clientId, setClientId] = useState("");
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [notes, setNotes] = useState("");
  const [validDays, setValidDays] = useState(30);

  const selectedClient = clients.find((c) => c.ID === Number(clientId));

  const addItem = (productId: string) => {
    const pId = Number(productId);
    const product = products.find((p) => p.ID === pId);

    if (!product) return;

    const existingItem = items.find((i) => i.ProductID === pId);
    if (existingItem) {
      setItems(
        items.map((i) =>
          i.ProductID === pId
            ? {
              ...i,
              Quantity: i.Quantity + 1,
              Subtotal:
                (i.Quantity + 1) * i.UnitPrice * (1 - i.Discount / 100),
            }
            : i,
        ),
      );
    } else {
      const newItem: QuotationItem = {
        ProductID: product.ID,
        ProductName: product.Name,
        Description: product.Description,
        Quantity: 1,
        UnitPrice: product.Price,
        Discount: 0,
        Subtotal: product.Price,
      };
      setItems([...items, newItem]);
    }
  };

  const updateItem = (id: number, updates: Partial<QuotationItem>) => {
    setItems(
      items.map((item) => {
        if (item.ProductID === id) {
          const updated = { ...item, ...updates };
          updated.Subtotal =
            updated.Quantity * updated.UnitPrice * (1 - updated.Discount / 100);
          return updated;
        }
        return item;
      }),
    );
  };

  const removeItem = (id: number) => {
    setItems(items.filter((i) => i.ProductID !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.Subtotal, 0);
  const taxAmount = subtotal * (Number(businessInfo.defaultTaxRate) / 100);
  const total = subtotal + taxAmount;

  const handleSubmit = () => {
    if (!clientId) {
      toast.error("Selecciona un cliente");
      return;
    }

    const quotation = {
      Number: generateQuotationNumber(),
      ClientID: Number(clientId),
      ClientName: selectedClient?.Name || "",
      Items: items,
      Subtotal: subtotal,
      TaxRate: Number(businessInfo.defaultTaxRate),
      TaxAmount: taxAmount,
      Total: total,
      Status: "sent" as const,
      Note: notes,
      ValidUntil: new Date(Date.now() + validDays * 24 * 60 * 60 * 1000),
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    };

    addQuotation(quotation);
    toast.success("Cotizacion creada exitosamente");
    navigate(`/quotations`);
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
        <h1 className="text-3xl font-bold tracking-tight">Nueva Cotización</h1>
        <p className="mt-1 text-muted-foreground">
          Crea una cotización para un cliente
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Client Selection */}
          <div className="border-2 border-border bg-card p-6 rounded-lg">
            <h2 className="mb-4 text-lg font-bold">Cliente</h2>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.ID} value={client.ID.toString()}>
                    {client.Name} {client.Company && `- ${client.Company}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {clients.length === 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                No hay clientes.{" "}
                <Link to="/clients" className="underline">
                  Crea uno primero
                </Link>
                .
              </p>
            )}
          </div>

          {/* Items */}
          <div className="border-2 border-border bg-card p-6 rounded-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Productos/Servicios</h2>
              <Select onValueChange={addItem}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Agregar producto..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.ID} value={product.ID.toString()}>
                      {product.Name} - {formatCurrency(product.Price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {items.length === 0 ? (
              <div className="border-2 border-dashed border-border p-8 text-center rounded-lg">
                <p className="text-muted-foreground">
                  Agrega productos o servicios a la cotización
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.ProductID}
                    className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 border-2 border-border p-4 rounded-lg"
                  >
                    <div>
                      <p className="font-bold">{item.ProductName}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {item.Description}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-muted-foreground">
                        Cantidad
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={item.Quantity}
                        onChange={(e) =>
                          updateItem(item.ProductID, {
                            Quantity: Number(e.target.value),
                          })
                        }
                        className="w-20"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-muted-foreground">
                        Precio
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.UnitPrice}
                        onChange={(e) =>
                          updateItem(item.ProductID, {
                            UnitPrice: Number(e.target.value),
                          })
                        }
                        className="w-28"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-muted-foreground">
                        Desc. %
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={item.Discount}
                        onChange={(e) =>
                          updateItem(item.ProductID, {
                            Discount: Number(e.target.value),
                          })
                        }
                        className="w-20"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="text-right">
                        <label className="text-xs font-bold uppercase text-muted-foreground">
                          Subtotal
                        </label>
                        <p className="font-bold">
                          {formatCurrency(item.Subtotal)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeItem(item.ProductID)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="border-2 border-border bg-card p-6 rounded-lg">
            <h2 className="mb-4 text-lg font-bold">Notas</h2>
            <Textarea
              placeholder="Notas adicionales para el cliente..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <div className="border-2 border-border bg-card p-6 rounded-lg">
            <h2 className="mb-4 text-lg font-bold">Resumen</h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  IVA ({businessInfo.defaultTaxRate}%)
                </span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
              <div className="border-t-2 border-border pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-lg font-bold">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="text-xs font-bold uppercase text-muted-foreground">
                Válida por (días)
              </label>
              <Input
                type="number"
                min="1"
                value={validDays}
                onChange={(e) => setValidDays(Number(e.target.value))}
                className="mt-1"
              />
            </div>

            <Button
              onClick={handleSubmit}
              className="mt-6 w-full"
              size="lg"
              disabled={isLoading}
            >
              Crear Cotización
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
