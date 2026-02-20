import React, { useEffect } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/molecules/Select";
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { Account, AccountClass, AccountNature } from '@/entities/Account';

const accountSchema = z.object({
    Code: z.string().min(1, 'El código es requerido').regex(/^\d+$/, 'Solo números'),
    Name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    Class: z.string().min(1, 'La clase es requerida'),
    Nature: z.string().min(1, 'La naturaleza es requerida'),
    ParentID: z.string().optional(),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface AccountFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    account: Account | null;
    accounts: Account[];
    onSave: (data: any) => void;
}

export function AccountForm({
    open,
    onOpenChange,
    account,
    accounts,
    onSave,
}: AccountFormProps) {
    const form = useForm<AccountFormData>({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            Code: '',
            Name: '',
            Class: '1',
            Nature: AccountNature.Debito,
            ParentID: '',
        },
    });

    useEffect(() => {
        if (account) {
            form.reset({
                Code: account.Code,
                Name: account.Name,
                Class: account.Class.toString(),
                Nature: account.Nature,
                ParentID: account.ParentID || '',
            });
        } else {
            form.reset({
                Code: '',
                Name: '',
                Class: '1',
                Nature: AccountNature.Debito,
                ParentID: '',
            });
        }
    }, [account, form]);

    const watchClass = form.watch("Class");
    useEffect(() => {
        const cls = parseInt(watchClass);
        if ([1, 5, 6, 7, 8].includes(cls)) {
            form.setValue("Nature", AccountNature.Debito);
        } else {
            form.setValue("Nature", AccountNature.Credito);
        }
    }, [watchClass, form]);

    const onSubmit = (data: AccountFormData) => {
        let level: 1 | 2 | 3 | 4 = 1;
        const len = data.Code.length;
        if (len === 1) level = 1;
        else if (len === 2) level = 2;
        else if (len === 4) level = 3;
        else if (len >= 6) level = 4;

        onSave({
            ...data,
            Class: parseInt(data.Class),
            Level: level,
            IsActive: true,
        });
        form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {account ? 'Editar Cuenta Contable' : 'Nueva Cuenta Contable'}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="Code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Código PUC *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: 110505" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="Class"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Clase *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione clase" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="1">1. Activo</SelectItem>
                                                <SelectItem value="2">2. Pasivo</SelectItem>
                                                <SelectItem value="3">3. Patrimonio</SelectItem>
                                                <SelectItem value="4">4. Ingresos</SelectItem>
                                                <SelectItem value="5">5. Gastos</SelectItem>
                                                <SelectItem value="6">6. Costos de Ventas</SelectItem>
                                                <SelectItem value="7">7. Costos de Producción</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="Name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre de la Cuenta *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Caja General" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="Nature"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Naturaleza</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Naturaleza" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={AccountNature.Debito}>Débito</SelectItem>
                                                <SelectItem value={AccountNature.Credito}>Crédito</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="ParentID"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cuenta Padre</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Ninguna" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="">Ninguna</SelectItem>
                                                {accounts
                                                    .filter(a => a.Level < 4)
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

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit">
                                {account ? 'Guardar Cambios' : 'Crear Cuenta'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default AccountForm;
