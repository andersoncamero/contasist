import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/molecules/Dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/molecules/Form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/molecules/Select';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { Textarea } from '@/components/atoms/Textarea';
import { Expense } from '@/entities/Expense';
import { useSupplier } from '@/useCases/useSupplier';
import { useExpenseCategory } from '@/useCases/useExpenseCategory';

const expenseSchema = z.object({
    SupplierId: z.string().min(1, 'Requerido'),
    CategoryId: z.string().min(1, 'Requerido'),
    Date: z.string().min(1, 'Requerida'),
    DueDate: z.string().min(1, 'Requerida'),
    Amount: z.coerce.number().min(0, 'Monto inválido'),
    TaxAmount: z.coerce.number().min(0, 'Impuesto inválido'),
    TotalAmount: z.coerce.number().min(0, 'Total inválido'),
    Status: z.enum(['pending', 'paid', 'overdue']),
    Reference: z.string().optional(),
    Notes: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    expense: Expense | null;
    onSave: (data: Omit<Expense, 'ID' | 'CreatedAt' | 'SupplierName' | 'CategoryName'>) => void;
}

export function ExpenseForm({
    open,
    onOpenChange,
    expense,
    onSave,
}: ExpenseFormProps) {
    const { suppliers } = useSupplier();
    const { categories } = useExpenseCategory();

    const form = useForm<ExpenseFormData>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            SupplierId: '',
            CategoryId: '',
            Date: new Date().toISOString().split('T')[0],
            DueDate: new Date().toISOString().split('T')[0],
            Amount: 0,
            TaxAmount: 0,
            TotalAmount: 0,
            Status: 'pending',
            Reference: '',
            Notes: '',
        },
    });

    const amount = useWatch({ control: form.control, name: 'Amount' });
    const taxAmount = useWatch({ control: form.control, name: 'TaxAmount' });

    // Auto-calculate total
    useEffect(() => {
        const total = (Number(amount) || 0) + (Number(taxAmount) || 0);
        form.setValue('TotalAmount', total, { shouldValidate: true });
    }, [amount, taxAmount, form]);

    useEffect(() => {
        if (expense) {
            form.reset({
                SupplierId: expense.SupplierId,
                CategoryId: expense.CategoryId,
                Date: new Date(expense.Date).toISOString().split('T')[0],
                DueDate: new Date(expense.DueDate).toISOString().split('T')[0],
                Amount: expense.Amount,
                TaxAmount: expense.TaxAmount,
                TotalAmount: expense.TotalAmount,
                Status: expense.Status,
                Reference: expense.Reference || '',
                Notes: expense.Notes || '',
            });
        } else {
            form.reset({
                SupplierId: '',
                CategoryId: '',
                Date: new Date().toISOString().split('T')[0],
                DueDate: new Date().toISOString().split('T')[0],
                Amount: 0,
                TaxAmount: 0,
                TotalAmount: 0,
                Status: 'pending',
                Reference: '',
                Notes: '',
            });
        }
    }, [expense, form, open]);

    const onSubmit = (data: ExpenseFormData) => {
        onSave({
            SupplierId: data.SupplierId,
            CategoryId: data.CategoryId,
            Date: new Date(data.Date),
            DueDate: new Date(data.DueDate),
            Amount: data.Amount,
            TaxAmount: data.TaxAmount,
            TotalAmount: data.TotalAmount,
            Status: data.Status,
            Reference: data.Reference,
            Notes: data.Notes,
        });
        form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {expense ? 'Editar Gasto / Factura' : 'Registrar Nuevo Gasto'}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="SupplierId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Proveedor *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione un proveedor" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {suppliers.map(s => (
                                                    <SelectItem key={s.ID} value={s.ID}>{s.Name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="CategoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Categoría *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione categoría" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.map(c => (
                                                    <SelectItem key={c.ID} value={c.ID}>{c.Name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="Date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha Emisión *</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="DueDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha Vencimiento *</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="Amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Subtotal *</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="TaxAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Impuestos *</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="TotalAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" disabled {...field} className="bg-muted" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="Reference"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Referencia / Folio</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. FACT-1234" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="Status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estado</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione el estado" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="pending">Pendiente</SelectItem>
                                                <SelectItem value="paid">Pagado</SelectItem>
                                                <SelectItem value="overdue">Vencido</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="Notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notas adicionales</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Observaciones o descripción adicional..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit">
                                {expense ? 'Guardar Cambios' : 'Registrar Gasto'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
