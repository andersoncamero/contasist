import { useState, useEffect } from "react";
import { Proposal, ProposalItem, ProposalStatus } from "@/entities/Proposal";
import { PriceList } from "@/entities/PriceList";
import { useClient } from "@/useCases/useClient";
import { useProduct } from "@/useCases/useProduct";
import { usePriceList } from "@/useCases/usePriceList";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/molecules/Dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/molecules/Select";
import { FileText, Plus, Trash2, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ProposalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal: Proposal | null;
  onSave: (data: Partial<Proposal>) => Promise<void>;
}

const EMPTY_ITEM: ProposalItem = {
  productName: "",
  description: "",
  quantity: 1,
  unitPrice: 0,
  subtotal: 0,
};

export function ProposalDialog({
  open,
  onOpenChange,
  proposal,
  onSave,
}: ProposalDialogProps) {
  const { clients } = useClient();
  const { products } = useProduct();
  const { resolvePriceList } = usePriceList();

  const [number, setNumber] = useState("");
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState<string>("");
  const [clientPriceList, setClientPriceList] = useState<PriceList | null>(null);
  const [objective, setObjective] = useState("");
  const [scope, setScope] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [methodology, setMethodology] = useState("");
  const [executionTime, setExecutionTime] = useState("15 días hábiles");
  const [validityDays, setValidityDays] = useState(30);
  const [commercialTerms, setCommercialTerms] = useState("");
  const [status, setStatus] = useState<ProposalStatus>("draft");
  const [items, setItems] = useState<ProposalItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!clientId) {
      setClientPriceList(null);
      return;
    }
    const loadPriceList = async () => {
      const list = await resolvePriceList(Number(clientId));
      setClientPriceList(list || null);
    };
    loadPriceList();
  }, [clientId]);

  useEffect(() => {
    if (proposal) {
      setNumber(proposal.number || "");
      setTitle(proposal.title || "");
      setClientId(String(proposal.clientId || ""));
      setObjective(proposal.objective || "");
      setScope(proposal.scope || "");
      setDeliverables(proposal.deliverables || "");
      setMethodology(proposal.methodology || "");
      setExecutionTime(proposal.executionTime || "15 días hábiles");
      setValidityDays(proposal.validityDays ?? 30);
      setCommercialTerms(proposal.commercialTerms || "");
      setStatus(proposal.status || "draft");
      setItems(proposal.items || []);
    } else {
      setNumber(`PROP-${Date.now().toString().slice(-4)}`);
      setTitle("Propuesta Comercial de Servicios");
      setClientId("");
      setObjective("Presentar nuestra oferta técnica y económica formal.");
      setScope("Atención integral de los requerimientos y suministros especificados.");
      setDeliverables("Informe técnico de entrega y garantía de servicios.");
      setMethodology("Supervisión técnica especializada y ejecución por fases.");
      setExecutionTime("15 días hábiles");
      setValidityDays(30);
      setCommercialTerms("Forma de pago: 50% anticipo y 50% contra entrega.");
      setStatus("draft");
      setItems([]);
    }
  }, [proposal, open]);

  const handleAddEmptyItem = () => {
    setItems([...items, { ...EMPTY_ITEM }]);
  };

  const handleAddCatalogItem = (itemIdVal: string) => {
    if (!itemIdVal) return;

    if (clientPriceList && clientPriceList.items && clientPriceList.items.length > 0) {
      const plItem = clientPriceList.items.find(
        (it) => String(it.productId || (it as any).id) === itemIdVal
      );
      if (plItem) {
        const pName = plItem.productName || plItem.product?.name || "";
        const pCode = plItem.productCode || plItem.product?.code || "";
        const price = plItem.negotiatedPrice || plItem.regularPrice || 0;
        const desc = plItem.comments || "";
        setItems([
          ...items,
          {
            productId: plItem.productId,
            productName: pCode ? `${pName} (${pCode})` : pName,
            description: desc,
            quantity: 1,
            unitPrice: price,
            subtotal: price,
          },
        ]);
        return;
      }
    }

    const prod = products.find((p) => String(p.ID) === itemIdVal);
    if (!prod) return;

    const price = prod.BasePrice ?? prod.Price ?? 0;
    setItems([
      ...items,
      {
        productId: prod.ID,
        productName: prod.Name,
        description: prod.Description || prod.Category || "",
        quantity: 1,
        unitPrice: price,
        subtotal: price,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof ProposalItem, value: any) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: value };

    if (field === "quantity" || field === "unitPrice") {
      const q = field === "quantity" ? Number(value) : current.quantity;
      const p = field === "unitPrice" ? Number(value) : current.unitPrice;
      current.subtotal = q * p;
    }

    updated[index] = current;
    setItems(updated);
  };

  const subtotal = items.reduce((acc, it) => acc + (it.subtotal || 0), 0);
  const taxAmount = subtotal * 0.19;
  const total = subtotal + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedClient = clients.find((c) => String(c.id || c.ID) === clientId);

    setIsSubmitting(true);
    try {
      await onSave({
        number,
        title,
        clientId: Number(clientId),
        clientName: selectedClient ? selectedClient.Name : "Cliente",
        objective,
        scope,
        deliverables,
        methodology,
        executionTime,
        validityDays: Number(validityDays),
        commercialTerms,
        subtotal,
        taxAmount,
        total,
        status,
        items,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] max-w-5xl max-h-[92vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-primary">
            <FileText className="h-5 w-5" />
            {proposal ? "Editar Propuesta Comercial" : "Nueva Propuesta Comercial"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-border pb-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Folio / Número *</label>
              <Input
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                required
                className="h-9 text-xs font-mono mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Título de la Propuesta *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Propuesta Técnica y Comercial..."
                required
                className="h-9 text-xs mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Cliente *</label>
              <Select value={clientId} onValueChange={setClientId} required>
                <SelectTrigger className="h-9 text-xs mt-1">
                  <SelectValue placeholder="Seleccione un cliente" />
                </SelectTrigger>
                <SelectContent className="z-[100] max-h-56 overflow-y-auto">
                  {clients.map((c) => (
                    <SelectItem key={c.id || c.ID} value={String(c.id || c.ID)}>
                      {c.Name} {c.Company ? `(${c.Company})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-border pb-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Tiempo de Ejecución</label>
              <Input
                value={executionTime}
                onChange={(e) => setExecutionTime(e.target.value)}
                placeholder="Ej. 15 días hábiles"
                className="h-9 text-xs mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Vigencia (Días)</label>
              <Input
                type="number"
                value={validityDays}
                onChange={(e) => setValidityDays(Number(e.target.value))}
                className="h-9 text-xs mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Estado</label>
              <Select value={status} onValueChange={(val: ProposalStatus) => setStatus(val)}>
                <SelectTrigger className="h-9 text-xs mt-1">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="sent">Enviada</SelectItem>
                  <SelectItem value="approved">Aprobada</SelectItem>
                  <SelectItem value="rejected">Rechazada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Objetivo de la Propuesta</label>
              <textarea
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Alcance Detallado</label>
              <textarea
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1"
              />
            </div>
          </div>

          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                3. Tabla de Ítems / Oferta Económica
              </h3>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select onValueChange={handleAddCatalogItem}>
                  <SelectTrigger className="h-8 text-xs w-full sm:w-64 border-primary/40 text-primary font-medium">
                    <Package className="h-3.5 w-3.5 mr-1 text-primary" />
                    <SelectValue
                      placeholder={
                        clientPriceList && clientPriceList.items && clientPriceList.items.length > 0
                          ? `Tarifario (${clientPriceList.name})...`
                          : "Agregar de Catálogo..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="z-[100] max-h-56 overflow-y-auto">
                    {clientPriceList && clientPriceList.items && clientPriceList.items.length > 0
                      ? clientPriceList.items.map((it, idx) => {
                          const pName = it.productName || it.product?.name || "Ítem";
                          const pCode = it.productCode || it.product?.code || "";
                          const pId = String(it.productId || (it as any).id || idx);
                          const pPrice = it.negotiatedPrice || it.regularPrice || 0;
                          return (
                            <SelectItem key={idx} value={pId}>
                              {pName} {pCode ? `(${pCode})` : ""} - {formatCurrency(pPrice)}
                            </SelectItem>
                          );
                        })
                      : products.map((p) => (
                          <SelectItem key={p.ID} value={String(p.ID)}>
                            {p.Name} {p.Code ? `(${p.Code})` : ""} - {formatCurrency(p.BasePrice ?? p.Price ?? 0)}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>

                <Button type="button" variant="outline" size="sm" onClick={handleAddEmptyItem} className="h-8 text-xs shrink-0">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Agregar Línea
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto border border-border rounded-lg">
              {items.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground border-2 border-dashed border-border rounded-lg bg-muted/20">
                  No hay ítems en la propuesta. Selecciona un producto del tarifario o haz clic en "+ Agregar Línea" para comenzar.
                </div>
              ) : (
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-2.5 w-10 text-center">#</th>
                      <th className="p-2.5 min-w-[220px]">Producto / Servicio</th>
                      <th className="p-2.5 min-w-[200px]">Descripción</th>
                      <th className="p-2.5 w-20 text-center">Cant.</th>
                      <th className="p-2.5 w-28 text-right">Precio Unit.</th>
                      <th className="p-2.5 w-28 text-right">Subtotal</th>
                      <th className="p-2.5 w-10 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {items.map((item, index) => (
                      <tr key={index} className="hover:bg-muted/40 transition-colors">
                        <td className="p-2.5 text-center font-mono">{index + 1}</td>
                        <td className="p-2.5">
                          <Input
                            className="h-8 text-xs font-semibold"
                            placeholder="Nombre del producto/servicio..."
                            value={item.productName}
                            onChange={(e) => handleItemChange(index, "productName", e.target.value)}
                          />
                        </td>
                        <td className="p-2.5">
                          <Input
                            className="h-8 text-xs"
                            placeholder="Descripción o detalle..."
                            value={item.description || ""}
                            onChange={(e) => handleItemChange(index, "description", e.target.value)}
                          />
                        </td>
                        <td className="p-2.5">
                          <Input
                            type="number"
                            min={1}
                            className="h-8 text-xs text-center"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                          />
                        </td>
                        <td className="p-2.5">
                          <Input
                            type="number"
                            min={0}
                            className="h-8 text-xs text-right font-mono"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                          />
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-foreground">
                          {formatCurrency(item.subtotal)}
                        </td>
                        <td className="p-2.5 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 p-4 rounded-lg border border-border">
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><span className="font-semibold text-foreground">Subtotal:</span> {formatCurrency(subtotal)}</p>
              <p><span className="font-semibold text-foreground">IVA (19%):</span> {formatCurrency(taxAmount)}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground font-semibold block">Total Propuesta</span>
              <span className="text-lg font-bold font-mono text-primary">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Entregables</label>
              <textarea
                value={deliverables}
                onChange={(e) => setDeliverables(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Términos y Condiciones Comerciales</label>
              <textarea
                value={commercialTerms}
                onChange={(e) => setCommercialTerms(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {proposal ? "Guardar Cambios" : "Crear Propuesta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
