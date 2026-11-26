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
import { useCompany } from '@/useCases/useCompany';
import { useToast } from '@/hooks/useToast';

const companySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  nit: z.string().min(5, 'El NIT o Cédula es requerido'),
  economicActivity: z.string().optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface CompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (companyId: number) => void;
}

export function CompanyDialog({ open, onOpenChange, onSuccess }: CompanyDialogProps) {
  const { addCompany, isLoading } = useCompany();
  const { toast } = useToast();

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      nit: '',
      economicActivity: '',
    },
  });

  const onSubmit = async (data: CompanyFormData) => {
    const res = await addCompany(data);
    if (res.success && res.data) {
      toast({
        title: 'Empresa creada',
        description: `Se registró la empresa ${data.name} exitosamente`,
      });
      const newId = res.data.id || res.data.ID;
      if (newId && onSuccess) {
        onSuccess(newId);
      }
      form.reset();
      onOpenChange(false);
    } else {
      toast({
        title: 'Error',
        description: res.error || 'No se pudo crear la empresa',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Nueva Empresa</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razón Social / Nombre *</FormLabel>
                  <FormControl>
                    <Input className="h-9 text-xs" placeholder="Ej. ElectroMecánicos del Sur S.A.S." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIT / RUT / ID Tributario *</FormLabel>
                  <FormControl>
                    <Input className="h-9 text-xs" placeholder="Ej. 901450890-1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="economicActivity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Actividad Económica (Opcional)</FormLabel>
                  <FormControl>
                    <Input className="h-9 text-xs" placeholder="Ej. Mantenimiento Industrial" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Guardando...' : 'Crear Empresa'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
