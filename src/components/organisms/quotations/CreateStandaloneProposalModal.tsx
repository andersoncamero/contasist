import { useState, useEffect } from 'react';
import { Client } from '@/entities/Client';
import { PriceList } from '@/entities/PriceList';
import { useClient } from '@/useCases/useClient';
import { useProduct } from '@/useCases/useProduct';
import { usePriceList } from '@/useCases/usePriceList';
import { generateProposalPDF } from '@/lib/ProposalPDF';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/molecules/Dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/molecules/Select';
import { FileText, Download, Plus, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

interface ProposalItem {
  id: number;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface CreateStandaloneProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessInfo: any;
}

export const CreateStandaloneProposalModal = ({
  isOpen,
  onClose,
  businessInfo,
}: CreateStandaloneProposalModalProps) => {
  const { clients } = useClient();
  const { products } = useProduct();
  const { resolvePriceList } = usePriceList();

  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [clientPriceList, setClientPriceList] = useState<PriceList | null>(null);
  const [proposalNumber, setProposalNumber] = useState<string>(`PROP-${Date.now().toString().slice(-4)}`);
  const [introductionText, setIntroductionText] = useState<string>(
    'Estimados señores,\n\nCordial saludo.\n\nPor medio de la presente nos complace presentar nuestra propuesta comercial y técnica para la prestación de los servicios solicitados.'
  );
  const [scopeDetails, setScopeDetails] = useState<string>(
    'La presente propuesta contempla el desarrollo integral de los servicios especificados, incluyendo mano de obra especializada, insumos de alta calidad y supervisión técnica constante.'
  );
  const [warrantyInfo, setWarrantyInfo] = useState<string>(
    'Garantía técnica de 12 meses en servicios y repuestos suministrados. Cobertura prioritaria ante eventualidades.'
  );
  const [paymentTerms, setPaymentTerms] = useState<string>(
    'Forma de pago: 50% al momento de la aprobación y 50% contra entrega final de los servicios.'
  );

  const [items, setItems] = useState<ProposalItem[]>([]);

  useEffect(() => {
    if (!selectedClientId) {
      setClientPriceList(null);
      return;
    }
    const loadPriceList = async () => {
      const list = await resolvePriceList(Number(selectedClientId));
      setClientPriceList(list || null);
    };
    loadPriceList();
  }, [selectedClientId]);

  if (!isOpen) return null;

  const selectedClient = clients.find(
    (c) => String(c.id || c.ID) === selectedClientId
  );

  const handleAddEmptyItem = () => {
    setItems([
      ...items,
      { id: Date.now(), productName: '', description: '', quantity: 1, unitPrice: 0, subtotal: 0 },
    ]);
  };

  const handleAddCatalogItem = (itemIdVal: string) => {
    if (!itemIdVal) return;

    if (clientPriceList && clientPriceList.items && clientPriceList.items.length > 0) {
      const plItem = clientPriceList.items.find(
        (it) => String(it.productId || (it as any).id) === itemIdVal
      );
      if (plItem) {
        const pName = plItem.productName || plItem.product?.name || '';
        const pCode = plItem.productCode || plItem.product?.code || '';
        const price = plItem.negotiatedPrice || plItem.regularPrice || 0;
        const desc = plItem.comments || '';
        setItems([
          ...items,
          {
            id: Date.now(),
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
        id: Date.now(),
        productName: prod.Name,
        description: prod.Description || prod.Category || '',
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

    if (field === 'quantity' || field === 'unitPrice') {
      const q = field === 'quantity' ? Number(value) : current.quantity;
      const p = field === 'unitPrice' ? Number(value) : current.unitPrice;
      current.subtotal = q * p;
    }

    updated[index] = current;
    setItems(updated);
  };

  const totalAmount = items.reduce((acc, item) => acc + item.subtotal, 0);

  const handleGeneratePDF = async () => {
    if (!selectedClient) {
      toast.error('Seleccione un cliente antes de generar la propuesta');
      return;
    }

    const mockQuotation: any = {
      ID: Date.now(),
      Number: proposalNumber,
      ClientID: selectedClient.id || selectedClient.ID,
      ClientName: selectedClient.Name,
      ClientCompany: selectedClient.Company,
      CreatedAt: new Date().toISOString(),
      ValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      Subtotal: totalAmount,
      TaxRate: 19,
      TaxAmount: totalAmount * 0.19,
      Total: totalAmount * 1.19,
      Status: 'draft',
      Items: items.map((it) => ({
        ID: it.id,
        ProductName: it.productName || 'Servicio/Producto',
        Description: it.description,
        Quantity: it.quantity,
        UnitPrice: it.unitPrice,
        Subtotal: it.subtotal,
      })),
    };

    try {
      await generateProposalPDF(mockQuotation, selectedClient, businessInfo, {
        introductionText,
        scopeDetails,
        warrantyInfo,
        paymentTerms,
      });
      toast.success('Propuesta Comercial descargada en PDF');
      onClose();
    } catch {
      toast.error('Error al generar el PDF de la propuesta');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[98vw] max-w-5xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader className="flex items-center justify-between border-b pb-3">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-primary">
            <FileText className="h-5 w-5" />
            Crear Propuesta Comercial Independiente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-border pb-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Cliente *</label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger className="h-9 text-xs mt-1">
                  <SelectValue placeholder="Seleccione un cliente" />
                </SelectTrigger>
                <SelectContent className="z-[100] max-h-56 overflow-y-auto">
                  {clients.map((c) => (
                    <SelectItem key={c.id || c.ID} value={String(c.id || c.ID)}>
                      {c.Name} {c.Company ? `(${c.Company})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Número de Propuesta</label>
              <Input
                value={proposalNumber}
                onChange={(e) => setProposalNumber(e.target.value)}
                className="h-9 text-xs mt-1 font-mono"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">1. Texto de Presentación e Introducción</label>
              <textarea
                value={introductionText}
                onChange={(e) => setIntroductionText(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">2. Alcance Detallado del Servicio</label>
              <textarea
                value={scopeDetails}
                onChange={(e) => setScopeDetails(e.target.value)}
                rows={3}
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
                          : 'Agregar de Catálogo...'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="z-[100] max-h-56 overflow-y-auto">
                    {clientPriceList && clientPriceList.items && clientPriceList.items.length > 0
                      ? clientPriceList.items.map((it, idx) => {
                          const pName = it.productName || it.product?.name || 'Ítem';
                          const pCode = it.productCode || it.product?.code || '';
                          const pId = String(it.productId || (it as any).id || idx);
                          const pPrice = it.negotiatedPrice || it.regularPrice || 0;
                          return (
                            <SelectItem key={idx} value={pId}>
                              {pName} {pCode ? `(${pCode})` : ''} - {formatCurrency(pPrice)}
                            </SelectItem>
                          );
                        })
                      : products.map((p) => (
                          <SelectItem key={p.ID} value={String(p.ID)}>
                            {p.Name} {p.Code ? `(${p.Code})` : ''} - {formatCurrency(p.BasePrice ?? p.Price ?? 0)}
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
                      <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                        <td className="p-2.5 text-center font-mono">{index + 1}</td>
                        <td className="p-2.5">
                          <Input
                            className="h-8 text-xs font-semibold"
                            placeholder="Nombre del producto/servicio..."
                            value={item.productName}
                            onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                          />
                        </td>
                        <td className="p-2.5">
                          <Input
                            className="h-8 text-xs"
                            placeholder="Descripción o detalle..."
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          />
                        </td>
                        <td className="p-2.5">
                          <Input
                            type="number"
                            min={1}
                            className="h-8 text-xs text-center"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          />
                        </td>
                        <td className="p-2.5">
                          <Input
                            type="number"
                            min={0}
                            className="h-8 text-xs text-right font-mono"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">4. Garantía Técnica</label>
              <textarea
                value={warrantyInfo}
                onChange={(e) => setWarrantyInfo(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">5. Términos y Condiciones Comerciales</label>
              <textarea
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1"
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleGeneratePDF} className="gap-2">
              <Download className="h-4 w-4" />
              Descargar Propuesta Comercial (PDF)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
