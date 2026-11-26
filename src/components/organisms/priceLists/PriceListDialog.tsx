import { useState, useEffect } from "react";
import { Plus, Trash2, Search, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/molecules/Dialog";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { Switch } from "@/components/atoms/Switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/molecules/Select";
import { PriceList, PriceListItem } from "@/entities/PriceList";
import { Product } from "@/entities/Product";
import { Client } from "@/entities/Client";
import { useClient } from "@/useCases/useClient";
import { formatCurrency } from "@/lib/utils";

interface PriceListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  priceList: PriceList | null;
  products: Product[];
  onSave: (data: Omit<PriceList, "id">) => void;
}

const EMPTY_ITEM: PriceListItem = {
  itemNumber: 1,
  productId: undefined,
  productCode: "",
  productName: "",
  unitCode: "NIU",
  regularPrice: 0,
  negotiatedPrice: 0,
  discountPercentage: 0,
  deliveryDays: 3,
  comments: "",
};

export function PriceListDialog({
  open,
  onOpenChange,
  priceList,
  products,
  onSave,
}: PriceListDialogProps) {
  const { clients } = useClient();

  const [customerId, setCustomerId] = useState<number | undefined>(undefined);
  const [customerName, setCustomerName] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [paymentTermsDays, setPaymentTermsDays] = useState(30);
  const [validityMonths, setValidityMonths] = useState(12);
  const [isDefault, setIsDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [items, setItems] = useState<PriceListItem[]>([{ ...EMPTY_ITEM }]);

  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);

  useEffect(() => {
    if (priceList) {
      setCustomerId(priceList.customerId);
      setCustomerName(priceList.customerName || "");
      setName(priceList.name || "");
      setCode(priceList.code || "");
      setPaymentTermsDays(priceList.paymentTermsDays ?? 30);
      setValidityMonths(priceList.validityMonths ?? 12);
      setIsDefault(priceList.isDefault ?? false);
      setIsActive(priceList.isActive ?? true);
      setItems(priceList.items && priceList.items.length > 0 ? priceList.items : [{ ...EMPTY_ITEM }]);
    } else {
      setCustomerId(undefined);
      setCustomerName("");
      setName("");
      setCode("");
      setPaymentTermsDays(30);
      setValidityMonths(12);
      setIsDefault(false);
      setIsActive(true);
      setItems([{ ...EMPTY_ITEM, itemNumber: 1 }]);
    }
  }, [priceList, open]);

  const handleSelectClient = (client: Client) => {
    const displayName = client.company || client.Company || client.name || client.Name || "";
    const clientID = client.id || client.ID;
    setCustomerId(clientID);
    setCustomerName(displayName);
    if (!name) {
      setName(`Tarifario ${displayName} 2025`);
    }
    setShowCustomerSearch(false);
  };

  const filteredClients = clients.filter((c) => {
    const searchLower = customerSearch.toLowerCase();
    const cName = (c.name || c.Name || "").toLowerCase();
    const cCompany = (c.company || c.Company || "").toLowerCase();
    const cTaxID = (c.taxId || c.TaxID || "").toLowerCase();
    return cName.includes(searchLower) || cCompany.includes(searchLower) || cTaxID.includes(searchLower);
  });

  const handleAddItem = () => {
    const nextNumber = items.length + 1;
    setItems([
      ...items,
      {
        ...EMPTY_ITEM,
        itemNumber: nextNumber,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSelectProduct = (index: number, productIdStr: string) => {
    const pId = Number(productIdStr);
    const selectedProd = products.find((p) => (p.id || p.ID) === pId);
    if (!selectedProd) return;

    const regPrice = selectedProd.BasePrice ?? selectedProd.Price ?? 0;
    const prodId = selectedProd.id || selectedProd.ID;
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      productId: prodId,
      product: {
        id: prodId,
        code: selectedProd.Code || "",
        name: selectedProd.Name || "",
        unitCode: selectedProd.UnitCode || "NIU",
        basePrice: regPrice,
      },
      productCode: selectedProd.Code || "",
      productName: selectedProd.Name || "",
      unitCode: selectedProd.UnitCode || "NIU",
      regularPrice: regPrice,
      negotiatedPrice: regPrice,
      discountPercentage: 0,
    };
    setItems(updated);
  };

  const handleItemChange = (index: number, field: keyof PriceListItem, value: any) => {
    const updated = [...items];
    const currentItem = { ...updated[index], [field]: value };

    if (field === "negotiatedPrice" || field === "regularPrice") {
      const reg = Number(currentItem.regularPrice) || 0;
      const neg = Number(currentItem.negotiatedPrice) || 0;
      if (reg > 0) {
        const disc = ((reg - neg) / reg) * 100;
        currentItem.discountPercentage = Number(disc.toFixed(1));
      }
    }

    updated[index] = currentItem;
    setItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      customerId,
      customerName,
      name,
      code,
      paymentTermsDays,
      validityMonths,
      isDefault,
      isActive,
      items,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] max-w-7xl max-h-[92vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle>
            {priceList ? "Editar Tarifario de Cliente" : "Nuevo Tarifario por Cliente"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-border pb-4">
            <div className="relative">
              <label className="text-xs font-semibold text-muted-foreground">
                Cliente Corporativo *
              </label>

              <div className="relative mt-1">
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Seleccione o escriba el cliente..."
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                  onClick={() => setShowCustomerSearch(!showCustomerSearch)}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {showCustomerSearch && (
                <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-popover border border-border rounded-lg shadow-lg p-2 max-h-56 overflow-y-auto">
                  <Input
                    placeholder="Buscar por NIT o Nombre..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="h-8 text-xs mb-2"
                    autoFocus
                  />
                  <div className="space-y-1">
                    {filteredClients.length === 0 ? (
                      <p className="text-xs text-muted-foreground p-2 text-center">
                        No se encontraron clientes
                      </p>
                    ) : (
                      filteredClients.map((client) => {
                        const clientID = client.id || client.ID;
                        const clientTitle = client.company || client.Company || client.name || client.Name;
                        const clientTaxID = client.taxId || client.TaxID || "N/A";
                        const clientEmail = client.email || client.Email || "";
                        return (
                          <button
                            key={clientID}
                            type="button"
                            onClick={() => handleSelectClient(client)}
                            className="w-full text-left p-2 rounded text-xs hover:bg-accent transition-colors flex items-center justify-between"
                          >
                            <div>
                              <p className="font-bold text-foreground">{clientTitle}</p>
                              <p className="text-[10px] text-muted-foreground">
                                NIT/TaxID: {clientTaxID} {clientEmail ? `- ${clientEmail}` : ""}
                              </p>
                            </div>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Nombre del Tarifario *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Tarifario General 2025"
                required
              />
            </div>



            <div>
              <label className="text-xs font-semibold text-muted-foreground">Plazo de Pago (Días)</label>
              <Input
                type="number"
                value={paymentTermsDays}
                onChange={(e) => setPaymentTermsDays(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Vigencia (Meses)</label>
              <Input
                type="number"
                value={validityMonths}
                onChange={(e) => setValidityMonths(Number(e.target.value))}
              />
            </div>

            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <Switch checked={isDefault} onCheckedChange={setIsDefault} />
                <span className="text-xs font-medium">Lista Base/Estándar</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <span className="text-xs font-medium">Activa</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold">Lista de Productos y Servicios</h3>
                <p className="text-xs text-muted-foreground">
                  Seleccione ítems del catálogo general o cree tarifas negociadas específicas
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Agregar Ítem
              </Button>
            </div>

            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-2 w-10 text-center">#</th>
                    <th className="p-2 min-w-[220px]">Producto / Servicio (Catálogo)</th>
                    <th className="p-2 w-28">Código</th>
                    <th className="p-2 w-28 text-right">Precio Base</th>
                    <th className="p-2 w-32 text-right">Precio Pactado ($)</th>
                    <th className="p-2 w-20 text-center">% Desc.</th>
                    <th className="p-2 w-24">Días SLA</th>
                    <th className="p-2 min-w-[180px]">Comentarios</th>
                    <th className="p-2 w-12 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item, index) => (
                    <tr key={index} className="hover:bg-muted/40 transition-colors">
                      <td className="p-2 text-center font-mono">{index + 1}</td>
                      <td className="p-2">
                        <Select
                          value={item.productId ? String(item.productId) : ""}
                          onValueChange={(val) => handleSelectProduct(index, val)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Seleccione producto/servicio..." />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((p) => (
                              <SelectItem key={p.ID} value={String(p.ID)}>
                                {p.Name} {p.Code ? `(${p.Code})` : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <Input
                          className="h-8 text-xs font-mono"
                          placeholder="Código"
                          value={item.product?.code || item.productCode || ""}
                          onChange={(e) => handleItemChange(index, "productCode", e.target.value)}
                        />
                      </td>
                      <td className="p-2 text-right font-mono font-medium">
                        {formatCurrency(item.regularPrice)}
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          className="h-8 text-xs text-right font-bold text-emerald-600 dark:text-emerald-400"
                          value={item.negotiatedPrice || ""}
                          onChange={(e) => handleItemChange(index, "negotiatedPrice", Number(e.target.value))}
                        />
                      </td>
                      <td className="p-2 text-center font-semibold text-blue-600 dark:text-blue-400 font-mono">
                        {item.discountPercentage ?? 0}%
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          className="h-8 text-xs"
                          value={item.deliveryDays ?? 3}
                          onChange={(e) => handleItemChange(index, "deliveryDays", Number(e.target.value))}
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          className="h-8 text-xs"
                          placeholder="Notas o condiciones"
                          value={item.comments || ""}
                          onChange={(e) => handleItemChange(index, "comments", e.target.value)}
                        />
                      </td>
                      <td className="p-2 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveItem(index)}
                          disabled={items.length <= 1}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {priceList ? "Guardar Cambios" : "Crear Tarifario"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
