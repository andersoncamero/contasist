import { MainLayout } from "@/templates/MainLayout";
import { Button } from "@/components/atoms/Button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/molecules/Form";
import { Input } from "@/components/atoms/Input";
import { Switch } from "@/components/atoms/Switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/molecules/Tabs";
import { useCompany } from "@/useCases/useCompany";
import { DianEmailConfig } from "@/components/organisms/dian/DianEmailConfig";
import { AccountingSettingsConfig } from "@/components/organisms/accounting/AccountingSettingsConfig";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, FileText, Link2, Save, Sliders } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { SEO } from "@/components/atoms/SEO";

const businessSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Teléfono debe tener al menos 10 dígitos"),
  address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  taxId: z.string().min(6, "RFC/NIT debe tener al menos 6 caracteres"),
  website: z.string().url().optional().or(z.literal("")),
  defaultTaxRate: z.string().min(0).max(100),
  pdfHeaderImage: z.string().url().optional().or(z.literal("")),
  pdfShowBorder: z.boolean().optional(),
});

type BusinessFormData = z.infer<typeof businessSchema>;

export const Settings = () => {
  const { businessInfo, activeCompany, updateCompany, isLoading } =
    useCompany();

  const form = useForm({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: businessInfo.name,
      email: businessInfo.email,
      phone: businessInfo.phone,
      address: businessInfo.address,
      taxId: businessInfo.taxId,
      website: businessInfo.website || "",
      defaultTaxRate: String(businessInfo.defaultTaxRate ?? "19"),
      pdfHeaderImage: businessInfo.pdfHeaderImage || "",
      pdfShowBorder: businessInfo.pdfShowBorder ?? true,
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
      defaultTaxRate: String(businessInfo.defaultTaxRate ?? "19"),
      pdfHeaderImage: businessInfo.pdfHeaderImage || "",
      pdfShowBorder: businessInfo.pdfShowBorder ?? true,
    });
  }, [
    businessInfo.name,
    businessInfo.email,
    businessInfo.phone,
    businessInfo.address,
    businessInfo.taxId,
    businessInfo.website,
    businessInfo.defaultTaxRate,
    businessInfo.pdfHeaderImage,
    businessInfo.pdfShowBorder,
    form,
  ]);

  const onSubmit = async (data: BusinessFormData) => {
    const targetId = activeCompany?.id || activeCompany?.ID;
    if (!targetId) {
      toast.error("Primero debes registrar una empresa");
      return;
    }
    try {
      await updateCompany({
        id: targetId,
        data: {
          name: data.name,
          nit: data.taxId,
          email: data.email,
          phone: data.phone,
          address: data.address,
          website: data.website,
          defaultTaxRate: data.defaultTaxRate ? parseFloat(data.defaultTaxRate) : 0,
          pdfHeaderImage: data.pdfHeaderImage || "",
          pdfShowBorder: Boolean(data.pdfShowBorder),
        },
      });
      toast.success("Configuración guardada exitosamente");
    } catch {
      toast.error("Error al actualizar la configuración");
    }
  };

  return (
    <MainLayout>
      <SEO title="Configuración" description="Configura los datos de tu empresa e integraciones." />
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="mt-1 text-muted-foreground">
          Información de tu negocio, personalización de PDFs e integraciones del sistema.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Sliders className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="contabilidad" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Contabilidad
          </TabsTrigger>
          <TabsTrigger value="integraciones" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Integraciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 items-stretch">
                <div className="border-2 border-border bg-card p-6 rounded-lg h-full flex flex-col justify-between">
                  <div>
                    <h2 className="mb-6 text-lg font-bold">Datos del Negocio</h2>

                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre del Negocio *</FormLabel>
                            <FormControl>
                              <Input placeholder="Mi Empresa S.A.S." {...field} />
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
                                <Input placeholder="+57 300 000 0000" {...field} />
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
                          name="defaultTaxRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tasa de Impuesto por Defecto (%)</FormLabel>
                              <FormControl>
                                <Input type="number" min="0" max="100" step="1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-2 border-border bg-card p-6 rounded-lg h-full flex flex-col justify-between">
                  <div>
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
                    </div>
                  </div>

                  <div className="bg-muted/50 border-2 border-dashed border-border p-4 rounded-lg mt-6">
                    <p className="text-sm text-muted-foreground text-center">
                      💡 Al configurar las imágenes y el slogan, el PDF mostrará un encabezado 
                      personalizado con imágenes a los lados y tu información centrada.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" size="lg" disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="contabilidad" className="space-y-6">
          <AccountingSettingsConfig />
        </TabsContent>

        <TabsContent value="integraciones" className="space-y-6">
          <DianEmailConfig />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};
