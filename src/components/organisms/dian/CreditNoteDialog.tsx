import React, { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { DianDocument } from "@/entities/dian";
import { useBillingConfig, useEmitCreditNote } from "@/useCases/useBilling";

interface CreditNoteDialogProps {
  document: DianDocument;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreditNoteDialog: React.FC<CreditNoteDialogProps> = ({ document, open, onOpenChange }) => {
  const { data: config } = useBillingConfig();
  const emitMutation = useEmitCreditNote();

  const [concept, setConcept] = useState("2");
  const [itemName, setItemName] = useState(`Anulación factura ${document.documentNumber}`);
  const [basePrice, setBasePrice] = useState(() => (document.totalAmount / 1.19).toFixed(2));
  const [taxRate, setTaxRate] = useState("19");

  const handleEmit = async () => {
    const price = Number(basePrice);
    if (!itemName.trim() || !Number.isFinite(price) || price < 0) {
      toast.error("Ingresa un ítem válido para la nota crédito");
      return;
    }
    const total = price * (1 + Number(taxRate) / 100);
    try {
      const result = await emitMutation.mutateAsync({
        numberingRangeId: config?.numberingRangeId || undefined,
        referenceCode: `NC-${document.documentNumber}-${Date.now()}`,
        correctionConceptCode: concept,
        billNumber: document.documentNumber,
        paymentDetails: [
          { paymentForm: "1", paymentMethodCode: "10", amount: total.toFixed(2) },
        ],
        customer: {
          identificationDocumentCode: "31",
          identification: document.counterpartNit,
          legalOrganizationCode: "1",
          company: document.counterpartName,
          names: document.counterpartName,
        },
        items: [
          {
            codeReference: "NC-ITEM-1",
            name: itemName.trim(),
            quantity: 1,
            price,
            unitMeasureCode: "94",
            standardCode: "999",
            taxes: [{ code: "01", rate: taxRate }],
          },
        ],
      });
      toast.success(`Nota crédito emitida: ${result.number}`);
      onOpenChange(false);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : "Error al emitir la nota crédito";
      toast.error(raw.length > 250 ? `${raw.slice(0, 250)}...` : raw);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Anular factura {document.documentNumber}</DialogTitle>
          <DialogDescription>
            Se emitirá una nota crédito asociada a esta factura ante la DIAN.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Concepto de corrección</Label>
            <Select value={concept} onValueChange={setConcept}>
              <SelectTrigger>
                <SelectValue placeholder="Concepto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Ajuste de valores</SelectItem>
                <SelectItem value="2">Anulación del documento soporte</SelectItem>
                <SelectItem value="3">Descuento global</SelectItem>
                <SelectItem value="4">Devolución parcial de bienes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="credit-note-item-name">Ítem</Label>
            <Input
              id="credit-note-item-name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="credit-note-base-price">Precio base (sin IVA)</Label>
              <Input
                id="credit-note-base-price"
                type="number"
                step="0.01"
                min="0"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>IVA</Label>
              <Select value={taxRate} onValueChange={setTaxRate}>
                <SelectTrigger>
                  <SelectValue placeholder="IVA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="19">19%</SelectItem>
                  <SelectItem value="5">5%</SelectItem>
                  <SelectItem value="0">0%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="button" disabled={emitMutation.isPending} onClick={handleEmit} className="gap-1.5">
              {emitMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Emitir nota crédito
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
