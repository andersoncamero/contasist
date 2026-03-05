import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, Info, PlusCircle } from 'lucide-react';
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
import { Badge } from '@/components/atoms/Badge';
import { Account, AccountNature } from '@/entities/Account';
import { cn } from '@/lib/utils';

const accountSchema = z.object({
    code: z.string().min(1, 'El código es requerido').regex(/^\d+$/, 'Solo números'),
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    description: z.string().optional(),
    class: z.string().min(1, 'La clase es requerida'),
    nature: z.string().min(1, 'La naturaleza es requerida'),
    parent_id: z.string().optional().nullable(),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface AccountFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    account: Account | null;
    allAccounts: Account[];
    onSave: (data: any) => void;
}

export function AccountForm({
    open,
    onOpenChange,
    account,
    allAccounts = [],
    onSave,
}: AccountFormProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const form = useForm<AccountFormData>({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            code: '',
            name: '',
            class: '1',
            nature: AccountNature.Debito,
            parent_id: '',
        },
    });

    // Sugerencias del PUC Estándar (cuentas que no pertenecen a ninguna business_id)
    const pucSuggestions = allAccounts
        .filter(a => !a.business_id || a.business_id === "")
        .filter(a =>
            a.code.includes(searchTerm) ||
            a.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 5); // Limitar a las 5 mejores coincidencias

    const handleSelectSuggestion = (suggestion: Account) => {
        form.setValue('code', suggestion.code);
        form.setValue('name', suggestion.name);
        form.setValue('class', suggestion.class.toString());
        form.setValue('nature', suggestion.nature);
        setSearchTerm(''); // Limpiar búsqueda
    };

    useEffect(() => {
        if (account) {
            form.reset({
                code: account.code,
                name: account.name,
                description: account.description || '',
                class: account.class.toString(),
                nature: account.nature,
                parent_id: account.parent_id || '',
            });
        } else {
            form.reset({
                code: '',
                name: '',
                description: '',
                class: '1',
                nature: AccountNature.Debito,
                parent_id: '',
            });
            setSearchTerm('');
        }
    }, [account, form, open]);

    const watchCode = form.watch("code");
    const watchClass = form.watch("class");

    // Automate Class based on Code prefix
    useEffect(() => {
        if (watchCode && watchCode.length >= 1) {
            const firstDigit = watchCode[0];
            if (["1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(firstDigit)) {
                form.setValue("class", firstDigit);
            }
        }
    }, [watchCode, form]);

    // Automate Nature based on Class
    useEffect(() => {
        if (!watchClass) return;
        const cls = parseInt(watchClass);
        // Naturaleza Débito para: Activo (1), Gastos (5), Costos (6, 7), Orden Deudoras (8)
        if ([1, 5, 6, 7, 8].includes(cls)) {
            form.setValue("nature", AccountNature.Debito);
        } else {
            form.setValue("nature", AccountNature.Credito);
        }
    }, [watchClass, form]);

    const onSubmit = (data: AccountFormData) => {
        let level: 1 | 2 | 3 | 4 = 1;
        const len = data.code.length;
        if (len === 1) level = 1;
        else if (len === 2) level = 2;
        else if (len === 4) level = 3;
        else if (len >= 6) level = 4;

        onSave({
            ...data,
            description: data.description || '',
            class: parseInt(data.class),
            level: level,
            is_active: true,
        });
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
                        {/* PUC Search / Selector (Only for new accounts) */}
                        {!account && (
                            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                                <div className="flex items-center gap-2 mb-1">
                                    <Search className="h-4 w-4 text-primary" />
                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Buscar en PUC Estándar</span>
                                </div>
                                <div className="relative">
                                    <Input
                                        placeholder="Escribe código o nombre (ej: 1105 o Caja)..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-white border-slate-200 h-10 rounded-xl focus:ring-primary/20"
                                    />
                                    {searchTerm && pucSuggestions.length > 0 && (
                                        <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                            {pucSuggestions.map((suggestion) => (
                                                <button
                                                    key={suggestion.id}
                                                    type="button"
                                                    onClick={() => handleSelectSuggestion(suggestion)}
                                                    className="w-full flex items-center justify-between p-3 hover:bg-primary/5 transition-colors border-b border-slate-50 last:border-0 text-left group"
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                                                            {suggestion.code} - {suggestion.name}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 font-medium">Naturaleza: {suggestion.nature}</span>
                                                    </div>
                                                    <PlusCircle className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {searchTerm && pucSuggestions.length === 0 && (
                                        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 p-5 rounded-2xl shadow-2xl text-center space-y-3 animate-in fade-in zoom-in-95 duration-200 ring-4 ring-black/5">
                                            <button
                                                type="button"
                                                onClick={() => setSearchTerm('')}
                                                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors"
                                                title="Cerrar aviso"
                                            >
                                                <PlusCircle className="h-4 w-4 rotate-45" />
                                            </button>

                                            <div className="pt-1">
                                                <p className="text-sm text-slate-900 font-bold">No está en el PUC estándar</p>
                                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-[220px] mx-auto mt-1">
                                                    No te preocupes, puedes registrar esta cuenta manualmente en los campos de abajo.
                                                </p>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => setSearchTerm('')}
                                                className="w-full rounded-xl text-[10px] h-9 font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all active:scale-95"
                                            >
                                                Entendido, crear manual
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium italic">
                                    <Info className="h-3 w-3" />
                                    <span>Al seleccionar una cuenta, los campos se autocompletarán</span>
                                </div>
                            </div>
                        )}

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
                                                placeholder="P. ej. 110505"
                                                className="rounded-xl border-slate-200 bg-white"
                                                onFocus={() => setSearchTerm('')}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="class"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold text-slate-700">Clase (Auto)</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 opacity-80">
                                                    <SelectValue placeholder="Seleccione clase" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl border-slate-200">
                                                <SelectItem value="1">1. Activo</SelectItem>
                                                <SelectItem value="2">2. Pasivo</SelectItem>
                                                <SelectItem value="3">3. Patrimonio</SelectItem>
                                                <SelectItem value="4">4. Ingresos</SelectItem>
                                                <SelectItem value="5">5. Gastos</SelectItem>
                                                <SelectItem value="6">6. Costos de Ventas</SelectItem>
                                                <SelectItem value="7">7. Costos de Producción</SelectItem>
                                                <SelectItem value="8">8. Orden Deudoras</SelectItem>
                                                <SelectItem value="9">9. Orden Acreedoras</SelectItem>
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
                                            onFocus={() => setSearchTerm('')}
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

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="nature"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold text-slate-700">Naturaleza</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="rounded-xl border-slate-200 bg-white">
                                                    <SelectValue placeholder="Seleccione naturaleza" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl border-slate-200">
                                                <SelectItem value={AccountNature.Debito}>Débito (DB)</SelectItem>
                                                <SelectItem value={AccountNature.Credito}>Crédito (CR)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="parent_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold text-slate-700">Cuenta Superior (Opcional)</FormLabel>
                                        <Select
                                            onValueChange={(val) => field.onChange(val === "0" ? null : val)}
                                            defaultValue={field.value || "0"}
                                            value={field.value || "0"}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="rounded-xl border-slate-200 bg-white">
                                                    <SelectValue placeholder="Ninguna" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl border-slate-200 max-h-[200px]">
                                                <SelectItem value="0">--- Ninguna ---</SelectItem>
                                                {allAccounts
                                                    .filter(a => a.level < 4 && a.id !== account?.id)
                                                    .map(a => (
                                                        <SelectItem key={a.id} value={a.id}>
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

