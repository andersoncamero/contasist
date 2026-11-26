import React from "react";
import { useForm, useFieldArray, Resolver } from "react-hook-form";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/molecules/Select";
import { Account } from "@/entities/Account";
import { CreateJournalEntryReq } from "@/entities/JournalEntry";
import { cn } from "@/lib/utils";

const lineSchema = z.object({
    accountId: z.string().min(1, "La cuenta es requerida"),
    debit: z.coerce.number().min(0),
    credit: z.coerce.number().min(0),
    description: z.string().optional(),
});

const journalEntrySchema = z.object({
    date: z.string().min(1, "La fecha es requerida"),
    description: z.string().min(3, "La descripción general es requerida"),
    lines: z.array(lineSchema).min(2, "Se requieren al menos 2 movimientos"),
});

type JournalEntryFormData = z.infer<typeof journalEntrySchema>;

interface JournalEntryFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    accounts: Account[];
    isSaving?: boolean;
    onSave: (data: CreateJournalEntryReq) => void;
}

export function JournalEntryForm({
    open,
    onOpenChange,
    accounts,
    isSaving = false,
    onSave,
}: JournalEntryFormProps) {
    const form = useForm<JournalEntryFormData>({
        resolver: zodResolver(journalEntrySchema) as Resolver<JournalEntryFormData>,
        defaultValues: {
            date: new Date().toISOString().split("T")[0],
            description: "",
            lines: [
                { accountId: "", debit: 0, credit: 0, description: "" },
                { accountId: "", debit: 0, credit: 0, description: "" },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "lines",
    });

    const watchLines = form.watch("lines");
    const totalDebit = watchLines.reduce((sum, m) => sum + (Number(m.debit) || 0), 0);
    const totalCredit = watchLines.reduce((sum, m) => sum + (Number(m.credit) || 0), 0);
    const diff = Math.abs(totalDebit - totalCredit);
    const isBalanced = diff < 0.01 && totalDebit > 0;

    const selectableAccounts = accounts
        .filter(a => a.is_active && a.level >= 3)
        .sort((a, b) => a.code.localeCompare(b.code));

    const onSubmit = (data: JournalEntryFormData) => {
        if (!isBalanced) {
            return;
        }

        onSave({
            date: new Date(`${data.date}T00:00:00`).toISOString(),
            description: data.description,
            lines: data.lines.map((line) => ({
                accountId: Number(line.accountId),
                debit: Math.round(Number(line.debit) || 0),
                credit: Math.round(Number(line.credit) || 0),
                description: line.description || undefined,
            })),
        });
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="date"
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
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Concepto General *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: Ajuste de cartera" {...field} />
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
                                    onClick={() => append({ accountId: "", debit: 0, credit: 0, description: "" })}
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Agregar Línea
                                </Button>
                            </div>

                            <div className="space-y-2">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start bg-muted/20 p-2 rounded-lg border border-border">
                                        <div className="md:col-span-5">
                                            <FormField
                                                control={form.control}
                                                name={`lines.${index}.accountId`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-9">
                                                                    <SelectValue placeholder="Cuenta..." />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="max-h-72">
                                                                {selectableAccounts.map(a => (
                                                                    <SelectItem key={a.id} value={a.id.toString()}>
                                                                        {a.code} - {a.name}
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
                                                name={`lines.${index}.debit`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input type="number" step="1" min="0" placeholder="Debe" className="h-9" {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <FormField
                                                control={form.control}
                                                name={`lines.${index}.credit`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input type="number" step="1" min="0" placeholder="Haber" className="h-9" {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="md:col-span-3 flex gap-2">
                                            <FormField
                                                control={form.control}
                                                name={`lines.${index}.description`}
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
                                <Button type="submit" disabled={!isBalanced || isSaving}>
                                    {isSaving ? "Guardando..." : "Guardar Asiento"}
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