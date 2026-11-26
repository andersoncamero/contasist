import React, { useMemo } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FilePlus2, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/molecules/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/molecules/Select";
import { EmitDocumentResult } from "@/entities/billing";
import { useBillingConfig, useEmitInvoice } from "@/useCases/useBilling";
import { formatCurrency } from "@/lib/utils";

const itemSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  quantity: z.number().positive("Debe ser mayor a cero"),
  price: z.number().min(0, "No puede ser negativo"),
  taxRate: z.string(),
});

const invoiceSchema = z.object({
  referenceCode: z.string().min(1, "Referencia requerida"),
  customer: z.object({
    identificationDocumentCode: z.string().min(1),
    identification: z.string().min(1, "Identificación requerida"),
    legalOrganizationCode: z.string().min(1),
    names: z.string().min(1, "Nombre requerido"),
    email: z.union([z.literal(""), z.email("Correo inválido")]),
  }),
  items: z.array(itemSchema).min(1, "Agrega al menos un ítem"),
  paymentForm: z.string().min(1),
  paymentMethodCode: z.string().min(1),
  paymentDueDate: z.string(),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

const defaultItem = { name: "", quantity: 1, price: 0, taxRate: "19" };

const buildDefaultValues = (): InvoiceFormValues => ({
  referenceCode: `FAC-${Date.now()}`,
  customer: {
    identificationDocumentCode: "13",
    identification: "",
    legalOrganizationCode: "2",
    names: "",
    email: "",
  },
  items: [defaultItem],
  paymentForm: "1",
  paymentMethodCode: "10",
  paymentDueDate: "",
});

export const EmitInvoiceCard: React.FC = () => {
  const { data: config } = useBillingConfig();
  const emitMutation = useEmitInvoice();
  const [lastResult, setLastResult] = React.useState<EmitDocumentResult | null>(null);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: buildDefaultValues(),
  });
  const { register, control, handleSubmit, reset, formState } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const watchedItems = useWatch({ control, name: "items" });
  const paymentForm = useWatch({ control, name: "paymentForm" });

  const total = useMemo(
    () =>
      (watchedItems ?? []).reduce((sum, item) => {
        const base = (Number(item?.quantity) || 0) * (Number(item?.price) || 0);
        const rate = Number(item?.taxRate) || 0;
        return sum + base * (1 + rate / 100);
      }, 0),
    [watchedItems]
  );

  const onSubmit = async (values: InvoiceFormValues) => {
    try {
      const result = await emitMutation.mutateAsync({
        numberingRangeId: config?.numberingRangeId || undefined,
        referenceCode: values.referenceCode,
        paymentDetails: [
          {
            paymentForm: values.paymentForm,
            paymentMethodCode: values.paymentMethodCode,
            amount: total.toFixed(2),
            dueDate: values.paymentForm === "2" ? values.paymentDueDate || undefined : undefined,
          },
        ],
        customer: {
          identificationDocumentCode: values.customer.identificationDocumentCode,
          identification: values.customer.identification,
          legalOrganizationCode: values.customer.legalOrganizationCode,
          names: values.customer.names,
          company: values.customer.legalOrganizationCode === "1" ? values.customer.names : undefined,
          email: values.customer.email || undefined,
        },
        items: values.items.map((item, index) => ({
          codeReference: `ITEM-${index + 1}`,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          unitMeasureCode: "94",
          standardCode: "999",
          taxes: [{ code: "01", rate: item.taxRate }],
        })),
      });
      setLastResult(result);
      toast.success(`Factura emitida: ${result.number}`);
      reset(buildDefaultValues());
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : "Error al emitir la factura";
      toast.error(raw.length > 250 ? `${raw.slice(0, 250)}...` : raw);
    }
  };

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <FilePlus2 className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-bold text-foreground">
            Emitir factura electrónica
          </CardTitle>
        </div>
        {config && !config.configured && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Configura y verifica la conexión con el proveedor de facturación antes de emitir.
          </p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="referenceCode">Referencia</Label>
              <Input id="referenceCode" {...register("referenceCode")} />
              {formState.errors.referenceCode && (
                <p className="text-xs text-destructive">{formState.errors.referenceCode.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Tipo de documento</Label>
              <Controller
                control={control}
                name="customer.identificationDocumentCode"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="13">Cédula de ciudadanía</SelectItem>
                      <SelectItem value="31">NIT</SelectItem>
                      <SelectItem value="22">Cédula de extranjería</SelectItem>
                      <SelectItem value="41">Pasaporte</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="identification">Identificación</Label>
              <Input id="identification" {...register("customer.identification")} />
              {formState.errors.customer?.identification && (
                <p className="text-xs text-destructive">
                  {formState.errors.customer.identification.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Tipo de organización</Label>
              <Controller
                control={control}
                name="customer.legalOrganizationCode"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Organización" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">Persona natural</SelectItem>
                      <SelectItem value="1">Persona jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customerNames">Nombre / Razón social</Label>
              <Input id="customerNames" {...register("customer.names")} />
              {formState.errors.customer?.names && (
                <p className="text-xs text-destructive">{formState.errors.customer.names.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customerEmail">Correo (opcional)</Label>
              <Input id="customerEmail" type="email" {...register("customer.email")} />
              {formState.errors.customer?.email && (
                <p className="text-xs text-destructive">{formState.errors.customer.email.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Ítems</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => append({ ...defaultItem })}
              >
                <Plus className="h-3.5 w-3.5" />
                Agregar ítem
              </Button>
            </div>
            {fields.map((field, index) => (
              <div key={field.id} className="grid gap-3 sm:grid-cols-[1fr_100px_130px_110px_40px] items-end">
                <div className="space-y-1.5">
                  {index === 0 && <Label htmlFor={`items.${index}.name`}>Nombre</Label>}
                  <Input
                    id={`items.${index}.name`}
                    placeholder="Producto o servicio"
                    {...register(`items.${index}.name`)}
                  />
                </div>
                <div className="space-y-1.5">
                  {index === 0 && <Label htmlFor={`items.${index}.quantity`}>Cantidad</Label>}
                  <Input
                    id={`items.${index}.quantity`}
                    type="number"
                    step="0.01"
                    min="0"
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-1.5">
                  {index === 0 && <Label htmlFor={`items.${index}.price`}>Precio</Label>}
                  <Input
                    id={`items.${index}.price`}
                    type="number"
                    step="0.01"
                    min="0"
                    {...register(`items.${index}.price`, { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-1.5">
                  {index === 0 && <Label>IVA</Label>}
                  <Controller
                    control={control}
                    name={`items.${index}.taxRate`}
                    render={({ field: taxField }) => (
                      <Select value={taxField.value} onValueChange={taxField.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="IVA" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="19">19%</SelectItem>
                          <SelectItem value="5">5%</SelectItem>
                          <SelectItem value="0">0%</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                  aria-label="Eliminar ítem"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            {formState.errors.items?.message && (
              <p className="text-xs text-destructive">{formState.errors.items.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Forma de pago</Label>
              <Controller
                control={control}
                name="paymentForm"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Forma de pago" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Contado</SelectItem>
                      <SelectItem value="2">Crédito</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Método de pago</Label>
              <Controller
                control={control}
                name="paymentMethodCode"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">Efectivo</SelectItem>
                      <SelectItem value="42">Consignación bancaria</SelectItem>
                      <SelectItem value="48">Tarjeta de crédito</SelectItem>
                      <SelectItem value="49">Tarjeta débito</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {paymentForm === "2" && (
              <div className="space-y-1.5">
                <Label htmlFor="paymentDueDate">Fecha de vencimiento</Label>
                <Input id="paymentDueDate" type="date" {...register("paymentDueDate")} />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              Total: <strong className="text-foreground">{formatCurrency(total)}</strong>
            </p>
            <Button type="submit" disabled={emitMutation.isPending} className="gap-1.5">
              {emitMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Emitir factura
            </Button>
          </div>
        </form>

        {lastResult && (
          <div className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs space-y-1">
            <p>
              <strong>Factura emitida:</strong> {lastResult.number}
            </p>
            <p className="break-all">
              <strong>CUFE:</strong> {lastResult.cufe}
            </p>
            {lastResult.publicUrl && (
              <p>
                <a
                  href={lastResult.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Ver representación gráfica
                </a>
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
