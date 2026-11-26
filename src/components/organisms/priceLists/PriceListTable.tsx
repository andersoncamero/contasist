import { useState } from "react";
import { ChevronDown, ChevronRight, Package, Tag, Clock, Calendar, CheckCircle2, XCircle, Trash2, Pencil, Download } from "lucide-react";
import { PriceList } from "@/entities/PriceList";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/atoms/Button";
import { generatePriceListPDF } from "@/lib/PDF";
import { useCompany } from "@/useCases/useCompany";
import { TableEmptyState } from "@/components/molecules/TableEmptyState";

interface PriceListTableProps {
  priceLists: PriceList[];
  onEdit?: (priceList: PriceList) => void;
  onDelete?: (id: number) => void;
}

export function PriceListTable({ priceLists, onEdit, onDelete }: PriceListTableProps) {
  const { businessInfo } = useCompany();
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  if (priceLists.length === 0) {
    return (
      <TableEmptyState
        icon={Tag}
        title="Sin Listas de Precios"
        description="Crea tu primer tarifario especial o lista de precios negociada asignada a un cliente."
      />
    );
  }

  return (
    <div className="space-y-3">
      {priceLists.map((pl) => {
        const isExpanded = expandedIds.includes(pl.id);
        return (
          <div
            key={pl.id}
            className="border border-border rounded-xl bg-card overflow-hidden transition-all shadow-sm"
          >
            <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-muted/20">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => toggleExpand(pl.id)}
                  className="mt-1 p-1 hover:bg-accent rounded text-muted-foreground transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-foreground">{pl.name}</h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {pl.isActive ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Activo
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 text-muted-foreground" /> Inactivo
                        </>
                      )}
                    </span>
                    {pl.isDefault && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                        Predeterminado
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1 flex-wrap">
                    <span className="flex items-center gap-1 font-semibold text-foreground">
                      <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                      Cliente: {pl.customerName || "General / Todos"}
                    </span>
                    <span>
                      Código: <span className="font-mono font-medium text-foreground">{pl.code}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> Plazo Pago: {pl.paymentTermsDays} Días
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> Vigencia: {pl.validityMonths} Meses
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleExpand(pl.id)}
                  className="text-xs h-8"
                >
                  {isExpanded ? "Ocultar Matriz" : "Ver Matriz de Precios"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generatePriceListPDF(pl, businessInfo)}
                  className="text-xs h-8 flex items-center gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                  title="Descargar PDF"
                >
                  <Download className="h-3.5 w-3.5" />
                  Descargar PDF
                </Button>
                {onEdit && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(pl)}
                    className="h-8 w-8 rounded-full border border-border bg-background hover:bg-accent text-foreground"
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => onDelete(pl.id)}
                    className="h-8 w-8 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-sm"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {isExpanded && (
              <div className="p-4 border-t border-border space-y-3 bg-card">
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/80 text-muted-foreground font-bold">
                      <tr>
                        <th className="p-2.5 text-center">#</th>
                        <th className="p-2.5">Producto / Servicio</th>
                        <th className="p-2.5">Código</th>
                        <th className="p-2.5 text-right">Precio Base ($)</th>
                        <th className="p-2.5 text-right">Precio Pactado ($)</th>
                        <th className="p-2.5 text-center">% Desc.</th>
                        <th className="p-2.5">Tiempo SLA</th>
                        <th className="p-2.5">Comentarios</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {pl.items?.map((item, idx) => {
                        const productName = item.product?.name || item.productName || "Ítem General";
                        const productCode = item.product?.code || item.productCode || "S/C";
                        return (
                          <tr key={idx} className="hover:bg-muted/40 transition-colors">
                            <td className="p-2.5 text-center font-mono">{idx + 1}</td>
                            <td className="p-2.5 font-bold text-foreground">
                              <div className="flex items-center gap-1.5">
                                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{productName}</span>
                              </div>
                            </td>
                            <td className="p-2.5 font-mono text-muted-foreground">
                              {productCode}
                            </td>
                            <td className="p-2.5 text-right font-mono text-muted-foreground">
                              {formatCurrency(item.regularPrice)}
                            </td>
                            <td className="p-2.5 text-right font-bold font-mono text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(item.negotiatedPrice)}
                            </td>
                            <td className="p-2.5 text-center font-mono font-semibold text-blue-600 dark:text-blue-400">
                              {item.discountPercentage ?? 0}%
                            </td>
                            <td className="p-2.5">{item.deliveryDays ?? 3} Días Hábiles</td>
                            <td className="p-2.5 text-muted-foreground italic">
                              {item.comments || ""}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
