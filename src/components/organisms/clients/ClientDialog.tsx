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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/molecules/Select';
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
import { Client } from '@/entities/Client';


const clientSchema = z.object({
  Name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  Email: z.email('Email inválido'),
  Phone: z.string().min(10, 'Teléfono debe tener al menos 10 dígitos'),
  PersonType: z.enum(['natural', 'juridica']),
  Company: z.string().optional(),
  Address: z.string().optional(),
  TaxID: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onSave: (data: ClientFormData) => void;
}

export function ClientDialog({
  open,
  onOpenChange,
  client,
  onSave,
}: ClientDialogProps) {
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      Name: '',
      Email: '',
      Phone: '',
      PersonType: 'juridica',
      Company: '',
      Address: '',
      TaxID: '',
    },
  });

  useEffect(() => {
    if (client) {
      form.reset({
        Name: client.Name,
        Email: client.Email,
        Phone: client.Phone,
        PersonType: client.PersonType || 'juridica',
        Company: client.Company || '',
        Address: client.Address || '',
        TaxID: client.TaxID || '',
      });
    } else {
      form.reset({
        Name: '',
        Email: '',
        Phone: '',
        PersonType: 'juridica',
        Company: '',
        Address: '',
        TaxID: '',
      });
    }
  }, [client, form]);

  const onSubmit = (data: ClientFormData) => {
    onSave(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[95vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle>
            {client ? 'Editar Cliente' : 'Nuevo Cliente'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            <FormField
              control={form.control}
              name="PersonType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Persona *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="natural">Persona Natural</SelectItem>
                      <SelectItem value="juridica">Persona Jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre de la empresa" {...field} className="placeholder:text-gray-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="TaxID"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIT / ID Fiscal *</FormLabel>
                  <FormControl>
                    <Input placeholder=" " {...field} className="placeholder:text-gray-500" />
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

            <FormField
              control={form.control}
              name="Name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Contacto *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del Contacto" {...field} className="placeholder:text-gray-500" />
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
                      <Input type="email" placeholder="juan@email.com" {...field} className="placeholder:text-gray-500" />
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



            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {client ? 'Guardar Cambios' : 'Crear Cliente'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
