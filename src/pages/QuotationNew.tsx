import { MainLayout } from "@/templates/MainLayout";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Badge } from "@/components/atoms/Badge";
import { Switch } from "@/components/atoms/Switch";
import { Label } from "@/components/atoms/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/molecules/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { QuotationItem } from "@/entities/QuotationItem";
import { PriceList } from "@/entities/PriceList";
import {
  formatCurrency,
  generateQuotationNumber,
} from "@/lib/utils";

import { useCompany } from "@/useCases/useCompany";
import { useClient } from "@/useCases/useClient";
import { useProduct } from "@/useCases/useProduct";
import { useQuotation } from "@/useCases/useQuotation";
import { usePriceList } from "@/useCases/usePriceList";
import { ArrowLeft, Trash2, Tag, Info, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { SEO } from "@/components/atoms/SEO";

const calculateProductUnitPrice = (
  product: { ID: number; Price: number },
  priceList: PriceList | null,
  usePriceListEnabled: boolean
): { price: number; isNegotiated: boolean; basePrice: number } => {
  if (usePriceListEnabled && priceList && Array.isArray(priceList.items)) {
    const matchedItem = priceList.items.find((item) => item.productId === product.ID);
    if (matchedItem && matchedItem.negotiatedPrice !== undefined && matchedItem.negotiatedPrice > 0) {
      return {
        price: matchedItem.negotiatedPrice,
        isNegotiated: true,
        basePrice: product.Price,
      };
    }
  }
  return {
    price: product.Price,
    isNegotiated: false,
    basePrice: product.Price,
  };
};

export const QuotationNew = () => {
  const navigate = useNavigate();
  const { clients } = useClient();
  const { products } = useProduct();
  const { addQuotation, isLoading } = useQuotation();
  const { businessInfo } = useCompany();
  const { resolvePriceList } = usePriceList();

  const [clientId, setClientId] = useState("");
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [notes, setNotes] = useState("");
  const [validDays, setValidDays] = useState(30);

  const [clientPriceList, setClientPriceList] = useState<PriceList | null>(null);
  const [useClientPriceList, setUseClientPriceList] = useState<boolean>(true);
  const [isLoadingPriceList, setIsLoadingPriceList] = useState<boolean>(false);

  const selectedClient = clients.find((c) => c.ID === Number(clientId));

  useEffect(() => {
    if (!clientId) {
      setClientPriceList(null);
      return;
    }

    const loadPriceList = async () => {
      setIsLoadingPriceList(true);
      const list = await resolvePriceList(Number(clientId));
      setClientPriceList(list || null);
      setIsLoadingPriceList(false);
    };

    loadPriceList();
  }, [clientId]);

  const updateItemsPrices = useCallback(
    (priceList: PriceList | null, enabled: boolean) => {
      setItems((prevItems) =>
        prevItems.map((item) => {
          const product = products.find((p) => p.ID === item.ProductID);
          if (!product) return item;
          const { price } = calculateProductUnitPrice(product, priceList, enabled);
          return {
            ...item,
            UnitPrice: price,
            Subtotal: item.Quantity * price * (1 - item.Discount / 100),
          };
        })
      );
    },
    [products]
  );

  const handleToggleUsePriceList = (checked: boolean) => {
    setUseClientPriceList(checked);
    updateItemsPrices(clientPriceList, checked);
  };

  const handleClientChange = (val: string) => {
    setClientId(val);
    setUseClientPriceList(true);
  };

  const addItem = (productId: string) => {
    const pId = Number(productId);
    const product = products.find((p) => p.ID === pId);

    if (!product) return;

    const { price } = calculateProductUnitPrice(product, clientPriceList, useClientPriceList);

    const existingItem = items.find((i) => i.ProductID === pId);
    if (existingItem) {
      setItems(
        items.map((i) =>
          i.ProductID === pId
            ? {
                ...i,
                Quantity: i.Quantity + 1,
                Subtotal: (i.Quantity + 1) * i.UnitPrice * (1 - i.Discount / 100),
              }
            : i
        )
      );
    } else {
      const newItem: QuotationItem = {
        ProductID: product.ID,
        ProductName: product.Name,
        Description: product.Description,
        Quantity: 1,
        UnitPrice: price,
        Discount: 0,
        Subtotal: price,
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
      })
    );
  };

  const removeItem = (id: number) => {
    setItems(items.filter((i) => i.ProductID !== id));
  };

  const [taxRate, setTaxRate] = useState<number>(19);

  useEffect(() => {
    if (businessInfo?.defaultTaxRate) {
      const parsed = Number(businessInfo.defaultTaxRate);
      if (!isNaN(parsed) && parsed >= 0) {
        setTaxRate(parsed);
      }
    }
  }, [businessInfo?.defaultTaxRate]);

  const subtotal = items.reduce((sum, item) => sum + item.Subtotal, 0);
  const taxAmount = subtotal * (taxRate / 100);
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
      TaxRate: taxRate,
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
      <SEO title="Nueva Cotización" description="Crea una nueva cotización." />
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
          <div className="border-2 border-border bg-card p-6 rounded-lg space-y-4">
            <h2 className="text-lg font-bold">Cliente</h2>
            <Select value={clientId} onValueChange={handleClientChange}>
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
              <p className="text-sm text-muted-foreground">
                No hay clientes.{" "}
                <Link to="/clients" className="underline">
                  Crea uno primero
                </Link>
                .
              </p>
            )}

            {isLoadingPriceList && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Cargando lista de precios del cliente...</span>
              </div>
            )}

            {!isLoadingPriceList && clientPriceList && (
              <div className="rounded-md border border-primary/30 bg-primary/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">
                      Lista de Precios: {clientPriceList.name}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {clientPriceList.code}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-primary/10 pt-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="price-list-switch" className="text-xs font-semibold cursor-pointer">
                      Aplicar lista de precios del cliente
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {useClientPriceList
                        ? "Se aplicarán los precios negociados del tarifario."
                        : "Se aplicarán los precios base del catálogo."}
                    </p>
                  </div>
                  <Switch
                    id="price-list-switch"
                    checked={useClientPriceList}
                    onCheckedChange={handleToggleUsePriceList}
                  />
                </div>
              </div>
            )}

            {!isLoadingPriceList && clientId && !clientPriceList && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
                Este cliente no tiene una lista de precios asignada. Se usarán los precios base del catálogo.
              </p>
            )}
          </div>

          <div className="border-2 border-border bg-card p-6 rounded-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Productos/Servicios</h2>
              <Select onValueChange={addItem}>
                <SelectTrigger className="w-72">
                  <SelectValue placeholder="Agregar producto..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => {
                    const { price, isNegotiated } = calculateProductUnitPrice(
                      product,
                      clientPriceList,
                      useClientPriceList
                    );
                    return (
                      <SelectItem key={product.ID} value={product.ID.toString()}>
                        {product.Name} - {formatCurrency(price)}
                        {isNegotiated ? " (Tarifario)" : ""}
                      </SelectItem>
                    );
                  })}
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
                {items.map((item) => {
                  const product = products.find((p) => p.ID === item.ProductID);
                  const isNegotiatedPrice =
                    product &&
                    calculateProductUnitPrice(product, clientPriceList, useClientPriceList).isNegotiated &&
                    item.UnitPrice ===
                      calculateProductUnitPrice(product, clientPriceList, useClientPriceList).price;

                  return (
                    <div
                      key={item.ProductID}
                      className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 border-2 border-border p-4 rounded-lg items-start"
                    >
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold">{item.ProductName}</p>
                          {isNegotiatedPrice && (
                            <Badge variant="success" className="text-[10px] py-0 px-1.5 h-4">
                              Tarifario
                            </Badge>
                          )}
                        </div>
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
                  );
                })}
              </div>
            )}
          </div>

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

        <div className="space-y-6">
          <div className="border-2 border-border bg-card p-6 rounded-lg">
            <h2 className="mb-4 text-lg font-bold">Resumen</h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  IVA ({taxRate}%)
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

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Tarifa de IVA (%)
                </label>
                <Select value={taxRate.toString()} onValueChange={(val) => setTaxRate(Number(val))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecciona tarifa de IVA" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="19">19% (Tarifa General)</SelectItem>
                    <SelectItem value="16">16% (Tarifa Anterior)</SelectItem>
                    <SelectItem value="5">5% (Tarifa Reducida)</SelectItem>
                    <SelectItem value="0">0% (Exento / Excluido)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
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
