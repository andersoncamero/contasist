import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, AlertCircle, Save } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/molecules/Dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/molecules/Form";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { Textarea } from "@/components/atoms/Textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/molecules/Select";
import { Account } from "@/entities/Account";
import { JournalEntry } from "@/entities/JournalEntry";
import { cn } from "@/lib/utils";

const movementSchema = z.object({
    AccountID: z.string().min(1, "La cuenta es requerida"),
    TerceroNombre: z.string().optional(),
    Debit: z.coerce.number().min(0),
    Credit: z.coerce.number().min(0),
    Description: z.string().optional(),
});

const journalEntrySchema = z.object({
    Date: z.string().min(1, "La fecha es requerida"),
    Description: z.string().min(3, "La descripción general es requerida"),
    Reference: z.string().optional(),
    Movements: z.array(movementSchema).min(2, "Se requieren al menos 2 movimientos"),
});

type JournalEntryFormData = z.infer<typeof journalEntrySchema>;

interface JournalEntryFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    accounts: Account[];
    onSave: (data: any) => void;
}

export function JournalEntryForm({
    open,
    onOpenChange,
    accounts,
    onSave,
}: JournalEntryFormProps) {
    const form = useForm<JournalEntryFormData>({
        resolver: zodResolver(journalEntrySchema) as any,
        defaultValues: {
            Date: new Date().toISOString().split("T")[0],
            Description: "",
            Reference: "",
            Movements: [
                { AccountID: "", Debit: 0, Credit: 0, Description: "" },
                { AccountID: "", Debit: 0, Credit: 0, Description: "" },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "Movements",
    });

    const watchMovements = form.watch("Movements");
    const totalDebit = watchMovements.reduce((sum, m) => sum + (m.Debit || 0), 0);
    const totalCredit = watchMovements.reduce((sum, m) => sum + (m.Credit || 0), 0);
    const diff = Math.abs(totalDebit - totalCredit);
    const isBalanced = diff < 0.01;

    const onSubmit = (data: JournalEntryFormData) => {
        if (!isBalanced) {
            alert("El asiento no está cuadrado (Débito != Crédito)");
            return;
        }

        const preparedData = {
            ...data,
            Movements: data.Movements.map((m) => {
                const account = accounts.find((a) => a.ID === m.AccountID);
                return {
                    ...m,
                    AccountCode: account?.Code || "",
                    AccountName: account?.Name || "",
                };
            }),
        };

        onSave(preparedData);
        form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Registrar Asiento Contable</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="Date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha *</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="Reference"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Doc. Soporte / Referencia</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: FAC-001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="Description"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-1">
                                        <FormLabel>Concepto General *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: Apertura de caja" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                    Movimientos
                                </h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => append({ AccountID: "", Debit: 0, Credit: 0, Description: "" })}
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Agregar Línea
                                </Button>
                            </div>

                            <div className="space-y-2">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start bg-muted/20 p-2 rounded-lg border border-border">
                                        <div className="md:col-span-4">
                                            <FormField
                                                control={form.control}
                                                name={`Movements.${index}.AccountID`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-9">
                                                                    <SelectValue placeholder="Cuenta..." />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {accounts
                                                                    .filter(a => a.Level === 4) // Solo subcuentas para asientos
                                                                    .sort((a, b) => a.Code.localeCompare(b.Code))
                                                                    .map(a => (
                                                                        <SelectItem key={a.ID} value={a.ID}>
                                                                            {a.Code} - {a.Name}
                                                                        </SelectItem>
                                                                    ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <FormField
                                                control={form.control}
                                                name={`Movements.${index}.TerceroNombre`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input placeholder="Tercero" className="h-9" {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <FormField
                                                control={form.control}
                                                name={`Movements.${index}.Debit`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input type="number" step="0.01" placeholder="Debe" className="h-9" {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <FormField
                                                control={form.control}
                                                name={`Movements.${index}.Credit`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input type="number" step="0.01" placeholder="Haber" className="h-9" {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="md:col-span-2 flex gap-2">
                                            <FormField
                                                control={form.control}
                                                name={`Movements.${index}.Description`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormControl>
                                                            <Input placeholder="Glosa" className="h-9" {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0"
                                                onClick={() => remove(index)}
                                                disabled={fields.length <= 2}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t-2 border-border pt-4 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex gap-8">
                                <div className="text-sm">
                                    <span className="text-muted-foreground block">Total Débito</span>
                                    <span className="text-lg font-bold">${totalDebit.toLocaleString()}</span>
                                </div>
                                <div className="text-sm">
                                    <span className="text-muted-foreground block">Total Crédito</span>
                                    <span className="text-lg font-bold">${totalCredit.toLocaleString()}</span>
                                </div>
                                <div className={cn("text-sm px-3 py-1 rounded-full flex items-center gap-2", isBalanced ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                                    {isBalanced ? (
                                        <><Save className="h-4 w-4" /> Asiento Cuadrado</>
                                    ) : (
                                        <><AlertCircle className="h-4 w-4" /> Dif: ${diff.toLocaleString()}</>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={!isBalanced}>
                                    Guardar Asiento
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default JournalEntryForm;
