import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, Calculator } from "lucide-react";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { Button } from "@/components/atoms/Button";
import { JournalEntryService } from "@/services/journalEntryService";
import { useToast } from "@/hooks/useToast";

const fields: { key: keyof SettingsFormState; label: string; hint: string }[] = [
    { key: "clientsAccountCode", label: "Clientes (Cartera)", hint: "Débito al emitir factura. Por defecto 1305." },
    { key: "salesIncomeAccountCode", label: "Ingresos por Ventas", hint: "Crédito por el subtotal de la factura. Por defecto 4135." },
    { key: "vatGeneratedAccountCode", label: "IVA Generado", hint: "Crédito por los impuestos de la factura. Por defecto 2408." },
    { key: "cashAccountCode", label: "Caja", hint: "Débito en recaudos en efectivo. Por defecto 1105." },
    { key: "bankAccountCode", label: "Bancos", hint: "Débito en recaudos por transferencia o tarjeta. Por defecto 1110." },
];

interface SettingsFormState {
    clientsAccountCode: string;
    salesIncomeAccountCode: string;
    vatGeneratedAccountCode: string;
    cashAccountCode: string;
    bankAccountCode: string;
}

const emptySettings: SettingsFormState = {
    clientsAccountCode: "",
    salesIncomeAccountCode: "",
    vatGeneratedAccountCode: "",
    cashAccountCode: "",
    bankAccountCode: "",
};

export function AccountingSettingsConfig() {
    const [form, setForm] = React.useState<SettingsFormState>(emptySettings);
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: settings, isLoading } = useQuery({
        queryKey: ["accounting-settings"],
        queryFn: () => JournalEntryService.getSettings(),
    });

    React.useEffect(() => {
        if (settings) {
            setForm({
                clientsAccountCode: settings.clientsAccountCode,
                salesIncomeAccountCode: settings.salesIncomeAccountCode,
                vatGeneratedAccountCode: settings.vatGeneratedAccountCode,
                cashAccountCode: settings.cashAccountCode,
                bankAccountCode: settings.bankAccountCode,
            });
        }
    }, [settings]);

    const updateMutation = useMutation({
        mutationFn: (data: SettingsFormState) => JournalEntryService.updateSettings(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["accounting-settings"] });
            toast({ title: "Configuración guardada", description: "Las cuentas de causación automática fueron actualizadas." });
        },
        onError: (error: Error) => {
            toast({ title: "No se pudo guardar", description: error.message, variant: "destructive" });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate(form);
    };

    return (
        <div className="border-2 border-border bg-card p-6 rounded-lg max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">Causación Automática</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
                Cuentas del PUC que el sistema usa para generar los asientos contables al facturar y registrar recaudos.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
                {fields.map(({ key, label, hint }) => (
                    <div key={key} className="space-y-1.5">
                        <Label htmlFor={key}>{label}</Label>
                        <Input
                            id={key}
                            value={form[key]}
                            onChange={(e) => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                            disabled={isLoading}
                            className="font-mono"
                        />
                        <p className="text-xs text-muted-foreground">{hint}</p>
                    </div>
                ))}

                <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={isLoading || updateMutation.isPending}>
                        <Save className="mr-2 h-4 w-4" />
                        {updateMutation.isPending ? "Guardando..." : "Guardar Configuración"}
                    </Button>
                </div>
            </form>
        </div>
    );
}