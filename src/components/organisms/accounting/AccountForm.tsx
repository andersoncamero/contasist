import React, { useEffect } from 'react';
import { useForm, Resolver } from 'react-hook-form';
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
import { Account, AccountNature } from '@/entities/Account';

const accountSchema = z.object({
    code: z.string().min(5, 'El código debe tener al menos 5 dígitos').max(20, 'Máximo 20 dígitos').regex(/^\d+$/, 'Solo números'),
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    description: z.string().optional(),
    parentId: z.string().min(1, 'La cuenta superior es requerida'),
});

const editAccountSchema = z.object({
    code: z.string().optional(),
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    description: z.string().optional(),
    parentId: z.string().optional(),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface AccountFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    account: Account | null;
    allAccounts: Account[];
    onSave: (data: { code?: string; name: string; description?: string; parentId?: number }) => void;
}

export function AccountForm({
    open,
    onOpenChange,
    account,
    allAccounts = [],
    onSave,
}: AccountFormProps) {
    const form = useForm<AccountFormData>({
        resolver: zodResolver(account ? editAccountSchema : accountSchema) as Resolver<AccountFormData>,
        defaultValues: {
            code: '',
            name: '',
            description: '',
            parentId: '',
        },
    });

    useEffect(() => {
        if (account) {
            form.reset({
                code: account.code,
                name: account.name,
                description: account.description || '',
                parentId: account.parent_id ? account.parent_id.toString() : '',
            });
        } else {
            form.reset({
                code: '',
                name: '',
                description: '',
                parentId: '',
            });
        }
    }, [account, form, open]);

    const watchCode = form.watch("code");
    const derivedNature = watchCode && [1, 5, 6, 7, 8].includes(Number(watchCode[0]))
        ? AccountNature.Debito
        : AccountNature.Credito;

    const parentOptions = allAccounts
        .filter(a => a.is_active && a.id !== account?.id)
        .sort((a, b) => a.code.localeCompare(b.code));

    const onSubmit = (data: AccountFormData) => {
        if (account) {
            onSave({
                name: data.name,
                description: data.description || '',
            });
        } else {
            onSave({
                code: data.code,
                name: data.name,
                description: data.description || '',
                parentId: Number(data.parentId),
            });
        }
        form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <DialogHeader>
                    <DialogTitle>
                        {account ? 'Editar Cuenta Contable' : 'Nueva Cuenta Contable'}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold text-slate-700">Código Cuenta *</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="P. ej. 130505"
                                                disabled={!!account}
                                                className="rounded-xl border-slate-200 bg-white disabled:opacity-60"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="parentId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold text-slate-700">Cuenta Superior *</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={!!account}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="rounded-xl border-slate-200 bg-white disabled:opacity-60">
                                                    <SelectValue placeholder="Seleccione la cuenta padre" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl border-slate-200 max-h-[200px]">
                                                {parentOptions.map(a => (
                                                    <SelectItem key={a.id} value={a.id.toString()}>
                                                        {a.code} - {a.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold text-slate-700">Nombre de la Cuenta *</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Ej: Caja General o Bancos"
                                            className="rounded-xl border-slate-200 bg-white"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold text-slate-700">Descripción</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Opcional: Detalles adicionales de la cuenta" {...field} className="rounded-xl border-slate-200 bg-white" />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />

                        {!account && (
                            <p className="text-xs text-slate-500 font-medium">
                                Naturaleza asignada automáticamente según el código: <span className="font-bold">{derivedNature}</span>.
                                El código debe colgar del código de la cuenta superior (ej. 130505 bajo 1305).
                            </p>
                        )}

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