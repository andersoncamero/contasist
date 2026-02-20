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
  generateId,
  generateQuotationNumber,
} from "@/lib/utils";

import { useBusiness } from "@/useCases/useBusiness";
import { useClient } from "@/useCases/useClient";
import { useProduct } from "@/useCases/useProduct";
import { useQuotation } from "@/useCases/useQuotation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
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

  const selectedClient = clients.find((c) => c.ID === clientId);

  const addItem = (productId: string) => {
    const product = products.find((p) => p.id === productId);

    if (!product) return;

    const existingItem = items.find((i) => i.productId === productId);
    if (existingItem) {
      setItems(
        items.map((i) =>
          i.productId === productId
            ? {
              ...i,
              quantity: i.quantity + 1,
              subtotal:
                (i.quantity + 1) * i.unitPrice * (1 - i.discount / 100),
            }
            : i,
        ),
      );
    } else {
      const newItem: QuotationItem = {
        id: generateId(),
        productId: product.id,
        productName: product.name,
        description: product.description,
        quantity: 1,
        unitPrice: product.price,
        discount: 0,
        subtotal: product.price,
      };
      setItems([...items, newItem]);
    }
  };

  const updateItem = (id: string, updates: Partial<QuotationItem>) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          updated.subtotal =
            updated.quantity * updated.unitPrice * (1 - updated.discount / 100);
          return updated;
        }
        return item;
      }),
    );
  };

  const removeItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const taxAmount = subtotal * (Number(businessInfo.defaultTaxRate) / 100);
  const total = subtotal + taxAmount;

  const handleSubmit = () => {
    if (!clientId) {
      toast.error("Selecciona un cliente");
      return;
    }

    const quotation = {
      id: generateId(),
      number: generateQuotationNumber(),
      clientId,
      clientName: selectedClient?.Name || "",
      items,
      subtotal,
      taxRate: Number(businessInfo.defaultTaxRate),
      taxAmount,

      total,
      status: "draft" as const,
      notes,
      validUntil: new Date(Date.now() + validDays * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addQuotation(quotation);
    toast.success("Cotizacion creada exitosamente");
    navigate(`/quotations/${quotation.id}`);
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
                  <SelectItem key={client.ID} value={client.ID}>
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
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - {formatCurrency(product.price)}
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
                    key={item.id}
                    className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 border-2 border-border p-4 rounded-lg"
                  >
                    <div>
                      <p className="font-bold">{item.productName}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {item.description}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-muted-foreground">
                        Cantidad
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(item.id, {
                            quantity: Number(e.target.value),
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
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(item.id, {
                            unitPrice: Number(e.target.value),
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
                        value={item.discount}
                        onChange={(e) =>
                          updateItem(item.id, {
                            discount: Number(e.target.value),
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
                        <p className="font-mono font-bold">
                          {formatCurrency(item.subtotal)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeItem(item.id)}
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
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  IVA ({businessInfo.defaultTaxRate}%)
                </span>
                <span className="font-mono">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="border-t-2 border-border pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-lg font-bold font-mono">
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
