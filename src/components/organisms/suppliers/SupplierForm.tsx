import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { Supplier } from '@/entities/Supplier';

const supplierSchema = z.object({
    Name: z.string().min(2, 'La razón social debe tener al menos 2 caracteres'),
    Email: z.email('Email inválido'),
    Phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
    ContactName: z.string().optional(),
    Address: z.string().optional(),
    TaxId: z.string().optional(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface SupplierFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    supplier: Supplier | null;
    onSave: (data: SupplierFormData) => void;
}

export function SupplierForm({
    open,
    onOpenChange,
    supplier,
    onSave,
}: SupplierFormProps) {
    const form = useForm<SupplierFormData>({
        resolver: zodResolver(supplierSchema),
        defaultValues: {
            Name: '',
            Email: '',
            Phone: '',
            ContactName: '',
            Address: '',
            TaxId: '',
        },
    });

    useEffect(() => {
        if (supplier) {
            form.reset({
                Name: supplier.Name,
                Email: supplier.Email,
                Phone: supplier.Phone,
                ContactName: supplier.ContactName || '',
                Address: supplier.Address || '',
                TaxId: supplier.TaxId || '',
            });
        } else {
            form.reset({
                Name: '',
                Email: '',
                Phone: '',
                ContactName: '',
                Address: '',
                TaxId: '',
            });
        }
    }, [supplier, form]);

    const onSubmit = (data: SupplierFormData) => {
        onSave(data);
        form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {supplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="Name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Razón Social *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Tech Supplies SA" {...field} className="placeholder:text-gray-500" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="Email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email *</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="ventas@tech.com" {...field} className="placeholder:text-gray-500" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="Phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Teléfono *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+52 55 1234 5678" {...field} className="placeholder:text-gray-500" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="ContactName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre de Contacto</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Carlos López" {...field} className="placeholder:text-gray-500" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="TaxId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>NIT / ID Fiscal</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123456789" {...field} className="placeholder:text-gray-500" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="Address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dirección</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Dirección completa" {...field} className="placeholder:text-gray-500" />
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
                                {supplier ? 'Guardar Cambios' : 'Crear Proveedor'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
