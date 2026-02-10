import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/UI/Button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/UI/Form";
import { Input } from "@/components/UI/Input";
import { Switch } from "@/components/UI/Switch";
import { useBusiness } from "@/useCase/useBusiness";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const businessSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.email("Email inválido"),
  phone: z.string().min(10, "Teléfono debe tener al menos 10 dígitos"),
  address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  taxId: z.string().min(6, "RFC debe tener al menos 6 caracteres"),
  website: z.url().optional().or(z.literal("")),
  defaultTaxRate: z.string().min(0).max(100),
  pdfHeaderImage: z.url().optional().or(z.literal("")),
  pdfShowBorder: z.boolean().optional(),
});

type BusinessFormData = z.infer<typeof businessSchema>;

export const Settings = () => {
  const { businessInfo, updateBusinessInfo, fetchBusinessInfo, isLoading } =
    useBusiness();

  useEffect(() => {
    fetchBusinessInfo();
  }, [fetchBusinessInfo]);

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: businessInfo.name,
      email: businessInfo.email,
      phone: businessInfo.phone,
      address: businessInfo.address,
      taxId: businessInfo.taxId,
      website: businessInfo.website || "",
      defaultTaxRate:  businessInfo.defaultTaxRate,
      pdfHeaderImage: businessInfo.pdfHeader?.headerImage || "",
      pdfShowBorder: businessInfo.pdfHeader?.showBorder !== false,
    },
  });

  useEffect(() => {
    form.reset({
      name: businessInfo.name,
      email: businessInfo.email,
      phone: businessInfo.phone,
      address: businessInfo.address,
      taxId: businessInfo.taxId,
      website: businessInfo.website || "",
      defaultTaxRate: businessInfo.defaultTaxRate,
      pdfHeaderImage: businessInfo.pdfHeader?.headerImage || "",
      pdfShowBorder: businessInfo.pdfHeader?.showBorder !== false,
    });
  }, [businessInfo, form]);

  const onSubmit = async (data: BusinessFormData) => {
    const result = await updateBusinessInfo({
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      taxId: data.taxId,
      website: data.website || undefined,
      defaultTaxRate: data.defaultTaxRate,
      pdfHeader: {
        headerImage: data.pdfHeaderImage || undefined,
        showBorder: data.pdfShowBorder,
      },
    });
    if (result.success) {
      toast.success("Configuración guardada exitosamente");
    } else {
      toast.error(result.error || "Error al guardar configuración");
    }
  };

 return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="mt-1 text-muted-foreground">
          Información de tu negocio y personalización de PDFs
        </p>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
  
            <div className="border-2 border-border bg-card p-6 rounded-lg">
              <h2 className="mb-6 text-lg font-bold">Datos del Negocio</h2>

              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Negocio *</FormLabel>
                      <FormControl>
                        <Input placeholder="Mi Empresa S.A. de C.V." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="contacto@empresa.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono *</FormLabel>
                        <FormControl>
                          <Input placeholder="+52 55 1234 5678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección *</FormLabel>
                      <FormControl>
                        <Input placeholder="Dirección completa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="taxId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Identificador Fiscal *</FormLabel>
                        <FormControl>
                          <Input placeholder="RFC / NIT / CUIT" {...field} />
                        </FormControl>
                        <FormDescription>RFC, NIT, CUIT, o equivalente</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sitio Web</FormLabel>
                        <FormControl>
                          <Input placeholder="https://miempresa.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="defaultTaxRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tasa de Impuesto por Defecto (%)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="100" step="1" {...field} />
                      </FormControl>
                      <FormDescription>
                        Este porcentaje se aplicará automáticamente a las cotizaciones
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>


            <div className="border-2 border-border bg-card p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="h-5 w-5" />
                <h2 className="text-lg font-bold">Personalización del PDF</h2>
              </div>
              
              <p className="text-sm text-muted-foreground mb-6">
                Sube una imagen de encabezado personalizada que incluya tu logo, slogan y cualquier diseño que desees para tus cotizaciones.
              </p>

              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="pdfHeaderImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imagen de Encabezado (URL)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormDescription>
                        URL de la imagen completa del encabezado. Tamaño recomendado: 1200x200 píxeles (proporción 6:1)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pdfShowBorder"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border-2 border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Mostrar línea separadora</FormLabel>
                        <FormDescription>
                          Añade una línea debajo del encabezado del PDF
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="bg-muted/50 border-2 border-dashed border-border p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground text-center">
                    💡 Al configurar las imágenes y el slogan, el PDF mostrará un encabezado 
                    personalizado con imágenes a los lados y tu información centrada.
                  </p>
                </div>
              </div>
            </div>

            <Button type="submit" size="lg" disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </Button>
          </form>
        </Form>
      </div>
    </MainLayout>
  );
};
