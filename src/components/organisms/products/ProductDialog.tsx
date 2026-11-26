/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
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
import { Switch } from '@/components/atoms/Switch';
import { Product, ItemType } from '@/entities/Product';
import { ServiceCategory } from '@/entities/ServiceCategory';
import { getServiceCategories } from '@/services/serviceCategoryService';

const productSchema = z.object({
  Code: z.string().optional(),
  Name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  PackageQuantity: z.coerce.number().min(0, 'La cantidad no puede ser negativa').optional(),
  PackageUnit: z.string().optional(),
  Description: z.string().optional(),
  ItemType: z.enum(['PIECE', 'SERVICE']),
  Category: z.string().optional(),
  BasePrice: z.coerce.number().min(0, 'El precio base debe ser mayor o igual a 0'),
  TaxRate: z.coerce.number().min(0, 'La tasa de impuesto no puede ser negativa'),
  TaxType: z.string().min(1, 'El tipo de impuesto es requerido'),
  UnitCode: z.string().min(1, 'El código de unidad es requerido'),
  TrackInventory: z.boolean(),
  StockQuantity: z.coerce.number().min(0, 'El stock no puede ser negativo'),
  MinStock: z.coerce.number().min(0, 'El stock mínimo no puede ser negativo'),
  CustomAttributes: z.record(z.string(), z.unknown()).optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSave: (data: ProductFormData) => void;
}

export function ProductDialog({
  open,
  onOpenChange,
  product,
  onSave,
}: ProductDialogProps) {
  const [categoriesList, setCategoriesList] = useState<ServiceCategory[]>([]);
  const [selectedCategorySelect, setSelectedCategorySelect] = useState<string>('General');
  const [customCategoryInput, setCustomCategoryInput] = useState<string>('');

  const isExistingServiceWithCategory = Boolean(
    product &&
    (product.ItemType === 'SERVICE' || product.IsService) &&
    product.Category &&
    product.Category.trim() !== ''
  );

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      Code: '',
      Name: '',
      PackageQuantity: 1,
      PackageUnit: 'UND',
      Description: '',
      ItemType: 'PIECE',
      Category: 'General',
      BasePrice: 0,
      TaxRate: 19,
      TaxType: 'IVA',
      UnitCode: 'NIU',
      TrackInventory: true,
      StockQuantity: 0,
      MinStock: 0,
      CustomAttributes: {},
    },
  });

  const selectedItemType = useWatch({
    control: form.control,
    name: 'ItemType',
  });

  const trackInventory = useWatch({
    control: form.control,
    name: 'TrackInventory',
  });

  useEffect(() => {
    if (open) {
      getServiceCategories()
        .then((cats) => setCategoriesList(cats))
        .catch(() => setCategoriesList([]));
    }
  }, [open]);

  useEffect(() => {
    if (product) {
      const existingCat = product.Category || 'General';
      form.reset({
        Code: product.Code || '',
        Name: product.Name || '',
        PackageQuantity: product.PackageQuantity ?? 1,
        PackageUnit: product.PackageUnit || 'UND',
        Description: product.Description || '',
        ItemType: product.ItemType || (product.IsService ? 'SERVICE' : 'PIECE'),
        Category: existingCat,
        BasePrice: product.BasePrice ?? product.Price ?? 0,
        TaxRate: product.TaxRate ?? 19,
        TaxType: product.TaxType || 'IVA',
        UnitCode: product.UnitCode || (product.ItemType === 'SERVICE' ? 'WSD' : 'NIU'),
        TrackInventory: product.TrackInventory ?? !product.IsService,
        StockQuantity: product.StockQuantity ?? product.InitialStock ?? 0,
        MinStock: product.MinStock ?? 0,
        CustomAttributes: product.CustomAttributes || {},
      });

      const isKnown = ['General', 'Mantenimiento', 'Instalaciones', 'Consultoría'].includes(existingCat) ||
        categoriesList.some((c) => c.name === existingCat);

      if (isKnown) {
        setSelectedCategorySelect(existingCat);
        setCustomCategoryInput('');
      } else {
        setSelectedCategorySelect('Otros');
        setCustomCategoryInput(existingCat);
      }
    } else {
      setSelectedCategorySelect('General');
      setCustomCategoryInput('');
      form.reset({
        Code: '',
        Name: '',
        PackageQuantity: 1,
        PackageUnit: 'UND',
        Description: '',
        ItemType: 'PIECE',
        Category: 'General',
        BasePrice: 0,
        TaxRate: 19,
        TaxType: 'IVA',
        UnitCode: 'NIU',
        TrackInventory: true,
        StockQuantity: 0,
        MinStock: 0,
        CustomAttributes: {},
      });
    }
  }, [product, form, open]);

  const handleItemTypeChange = (value: ItemType) => {
    form.setValue('ItemType', value);
    if (value === 'SERVICE') {
      form.setValue('TrackInventory', false);
      form.setValue('UnitCode', 'WSD');
      form.setValue('PackageQuantity', 1);
      form.setValue('PackageUnit', 'UND');
    } else if (value === 'PIECE') {
      form.setValue('TrackInventory', true);
      form.setValue('UnitCode', 'NIU');
      form.setValue('PackageQuantity', 1);
      form.setValue('PackageUnit', 'UND');
      form.setValue('Category', 'General');
    }
  };

  const handleCategorySelectChange = (val: string) => {
    setSelectedCategorySelect(val);
    if (val !== 'Otros') {
      form.setValue('Category', val);
    } else {
      form.setValue('Category', customCategoryInput);
    }
  };

  const handleCustomCategoryInputChange = (val: string) => {
    setCustomCategoryInput(val);
    form.setValue('Category', val);
  };

  const onSubmit = (data: ProductFormData) => {
    let finalCategory = data.Category;
    if (data.ItemType === 'PIECE') {
      finalCategory = 'General';
    } else if (selectedCategorySelect === 'Otros') {
      finalCategory = customCategoryInput.trim() !== '' ? customCategoryInput.trim() : 'General';
    }
    if (!finalCategory || finalCategory.trim() === '') {
      finalCategory = 'General';
    }

    const qtyStr = data.ItemType === 'PIECE' && data.PackageQuantity && data.PackageQuantity > 0 ? ` ${data.PackageQuantity}` : '';
    const unitStr = data.ItemType === 'PIECE' && data.PackageUnit && data.PackageUnit !== 'UND' ? `${data.PackageUnit}` : '';
    const formattedFullName = data.ItemType === 'PIECE'
      ? `${data.Name}${qtyStr}${unitStr ? ' ' + unitStr : ''}`.trim()
      : data.Name.trim();

    const finalData = {
      ...data,
      Name: formattedFullName,
      Category: finalCategory,
      PackageQuantity: data.ItemType === 'SERVICE' ? 1 : (data.PackageQuantity || 1),
      PackageUnit: data.ItemType === 'SERVICE' ? 'UND' : (data.PackageUnit || 'UND'),
      Description: data.Description && data.Description.trim() !== '' ? data.Description : formattedFullName,
    };
    onSave(finalData);
    form.reset();
  };

  const PRESET_CATEGORIES = ['General', 'Mantenimiento', 'Instalaciones', 'Consultoría'];
  const dbCategoryNames = categoriesList.map((c) => c.name);
  const combinedOptions = Array.from(new Set([...PRESET_CATEGORIES, ...dbCategoryNames]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Editar Producto / Servicio' : 'Nuevo Producto / Servicio'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
              <div className="sm:col-span-2">
                <FormField
                  control={form.control}
                  name="ItemType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Ítem *</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(val: ItemType) => handleItemTypeChange(val)}
                        disabled={Boolean(product)}
                      >
                        <FormControl>
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="Tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PIECE">Producto</SelectItem>
                          <SelectItem value="SERVICE">Servicio</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="sm:col-span-4">
                <FormField
                  control={form.control}
                  name="Name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Ítem *</FormLabel>
                      <FormControl>
                        <Input
                          className="h-9 text-xs"
                          placeholder={
                            selectedItemType === 'SERVICE'
                              ? 'Ej. Servicio de Asesoría, Mantenimiento, Diagnóstico...'
                              : 'Ej. Detergente Industrial, Insumo, Repuesto...'
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {selectedItemType === 'SERVICE' && (
              <div className="grid grid-cols-1 gap-3">
                <FormField
                  control={form.control}
                  name="Category"
                  render={() => (
                    <FormItem>
                      <FormLabel>Categoría del Servicio *</FormLabel>
                      <div className="space-y-2">
                        <Select
                          value={selectedCategorySelect}
                          onValueChange={(val: string) => handleCategorySelectChange(val)}
                          disabled={isExistingServiceWithCategory}
                        >
                          <FormControl>
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue placeholder="Seleccione Categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {combinedOptions.map((catName) => (
                              <SelectItem key={catName} value={catName}>
                                {catName}
                              </SelectItem>
                            ))}
                            <SelectItem value="Otros">Otros / Especificar...</SelectItem>
                          </SelectContent>
                        </Select>

                        {selectedCategorySelect === 'Otros' && (
                          <Input
                            className="h-9 text-xs border-indigo-500/50"
                            placeholder="Escriba la Categoría Personalizada..."
                            value={customCategoryInput}
                            onChange={(e) => handleCustomCategoryInputChange(e.target.value)}
                            disabled={isExistingServiceWithCategory}
                          />
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {selectedItemType === 'PIECE' && (
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="PackageQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          className="h-9 text-xs"
                          placeholder="1"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="PackageUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidad *</FormLabel>
                      <FormControl>
                        <Input
                          className="h-9 text-xs uppercase"
                          placeholder="L, GL, KG, UND"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <FormField
                  control={form.control}
                  name="BasePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio Base *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          className="h-9 text-xs"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="sm:col-span-1">
                <FormField
                  control={form.control}
                  name="TaxRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tarifa IVA (%) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          className="h-9 text-xs"
                          placeholder="19"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="sm:col-span-1">
                <FormField
                  control={form.control}
                  name="UnitCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Código Unidad DIAN *</FormLabel>
                      <FormControl>
                        <Input
                          className="h-9 text-xs uppercase"
                          placeholder={selectedItemType === 'SERVICE' ? 'WSD' : 'NIU'}
                          {...field}
                        />
                      </FormControl>
                      <div className="text-[10px] text-muted-foreground mt-1 truncate">
                        {selectedItemType === 'SERVICE' ? 'WSD = Servicio Estándar' : 'NIU = Unidad Física'}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="Description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción Breve</FormLabel>
                    <FormControl>
                      <Input
                        className="h-9 text-xs"
                        placeholder="Descripción opcional del ítem..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center justify-between border p-3 rounded-lg bg-muted/20">
              <div className="space-y-0.5">
                <FormLabel className="text-xs font-semibold">Controlar Inventario</FormLabel>
                <div className="text-[11px] text-muted-foreground">
                  Habilitar seguimiento de stock físico en bodega.
                </div>
              </div>
              <FormField
                control={form.control}
                name="TrackInventory"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
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

            {trackInventory && (
              <div className="grid grid-cols-2 gap-3 bg-muted/10 p-3 rounded-lg border border-dashed">
                <FormField
                  control={form.control}
                  name="StockQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Stock Actual</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" className="h-9 text-xs" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="MinStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Stock Mínimo</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" className="h-9 text-xs" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-9 text-xs"
              >
                Cancelar
              </Button>
              <Button type="submit" className="h-9 text-xs font-medium">
                {product ? 'Actualizar' : 'Guardar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
