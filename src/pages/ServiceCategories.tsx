import { useEffect, useState } from "react";
import { MainLayout } from "@/templates/MainLayout";
import { SEO } from "@/components/atoms/SEO";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { Badge } from "@/components/atoms/Badge";
import { Textarea } from "@/components/atoms/Textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/molecules/Card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/molecules/Dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/molecules/AlertDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/molecules/Select";
import { toast } from "sonner";
import {
  Plus,
  Edit2,
  Trash2,
  Layers,
  Wrench,
  Car,
  Code2,
  Wind,
  Sparkles,
  Search,
  FileCode,
  Building2,
} from "lucide-react";
import { ServiceCategory } from "@/entities/ServiceCategory";
import { useServiceCategory } from "@/useCases/useServiceCategory";
import { TableEmptyState } from "@/components/molecules/TableEmptyState";

const INDUSTRY_PRESETS = [
  {
    id: "ELECTROMECHANICAL",
    label: "Electromecánica / Rebobinado",
    icon: Wrench,
    schema: JSON.stringify(
      {
        potenciaHP: "float",
        voltaje: "string",
        rpm: "integer",
        tipoAislamiento: "string",
        numeroPolos: "integer",
      },
      null,
      2
    ),
  },
  {
    id: "AUTOMOTIVE",
    label: "Automotriz / Taller",
    icon: Car,
    schema: JSON.stringify(
      {
        placaVehiculo: "string",
        marcaModelo: "string",
        kilometraje: "integer",
        tipoAceite: "string",
      },
      null,
      2
    ),
  },
  {
    id: "SOFTWARE",
    label: "Desarrollo de Software / TI",
    icon: Code2,
    schema: JSON.stringify(
      {
        horasEstimadas: "integer",
        stackTecnologico: "string",
        seniority: "string",
        entregables: "string",
      },
      null,
      2
    ),
  },
  {
    id: "HVAC",
    label: "Climatización / HVAC",
    icon: Wind,
    schema: JSON.stringify(
      {
        gasRefrigerante: "string",
        capacidadBTU: "integer",
        tipoEquipo: "string",
      },
      null,
      2
    ),
  },
  {
    id: "GENERAL",
    label: "General / Multiservicio",
    icon: Layers,
    schema: JSON.stringify(
      {
        descripcionDetallada: "string",
        tiempoEjecucionHoras: "integer",
      },
      null,
      2
    ),
  },
];

export function ServiceCategories() {
  const {
    categories,
    hasCompanies,
    isLoading,
    isSaving,
    isDeleting,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useServiceCategory();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceCategory | null>(null);

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [industryType, setIndustryType] = useState<string>("GENERAL");
  const [attributeSchema, setAttributeSchema] = useState<string>("{}");

  useEffect(() => {
    if (hasCompanies && error) {
      toast.error(error);
    }
  }, [hasCompanies, error]);

  const handleOpenCreateDialog = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setIndustryType("GENERAL");
    setAttributeSchema(INDUSTRY_PRESETS.find((p) => p.id === "GENERAL")?.schema || "{}");
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (category: ServiceCategory) => {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description || "");
    setIndustryType(category.industryType || "GENERAL");
    setAttributeSchema(category.attributeSchema || "{}");
    setIsDialogOpen(true);
  };

  const handlePresetSelect = (presetId: string) => {
    setIndustryType(presetId);
    const preset = INDUSTRY_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setAttributeSchema(preset.schema);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("El nombre de la categoría es obligatorio");
      return;
    }

    try {
      JSON.parse(attributeSchema);
    } catch {
      toast.error("El esquema de atributos debe ser un JSON válido");
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      industryType,
      attributeSchema,
    };

    const result = editingCategory
      ? await updateCategory(editingCategory.id, payload)
      : await createCategory(payload);

    if (!result.success) {
      toast.error(result.error || "Error al guardar la categoría");
      return;
    }

    toast.success(
      editingCategory
        ? "Categoría actualizada correctamente"
        : "Categoría de servicio creada correctamente"
    );
    setIsDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteCategory(deleteTarget.id);
    if (!result.success) {
      toast.error(result.error || "Error al eliminar la categoría");
      return;
    }
    toast.success("Categoría eliminada");
    setDeleteTarget(null);
  };

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cat.industryType && cat.industryType.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <MainLayout>
      <SEO
        title="Categorías & Servicios"
        description="Administra categorías de servicios y atributos dinámicos para tu empresa."
      />

      <div className="page-header flex-col items-start gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="page-title">Categorías & Servicios</h1>
          <p className="page-subtitle">
            Administre familias de servicios personalizables para cualquier tipo de industria o modelo de negocio.
          </p>
        </div>
        <Button onClick={handleOpenCreateDialog} disabled={!hasCompanies}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Categoría
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar categoría por nombre, descripción o industria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            disabled={!hasCompanies}
          />
        </div>
      </div>

      {!hasCompanies ? (
        <TableEmptyState
          icon={Building2}
          title="Primero Registra una Empresa"
          description="Para crear y administrar categorías de servicios, registra o selecciona una empresa en tu espacio de trabajo."
        />
      ) : isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <TableEmptyState
          icon={Layers}
          title="Sin Categorías de Servicios"
          description={
            searchTerm
              ? "No se encontraron categorías que coincidan con tu búsqueda."
              : "Cree una nueva categoría de servicio para configurar metadatos dinámicos acordes a su industria."
          }
          actionLabel={!searchTerm ? "Crear Primera Categoría" : undefined}
          actionIcon={Plus}
          onAction={!searchTerm ? handleOpenCreateDialog : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => {
            const presetInfo = INDUSTRY_PRESETS.find((p) => p.id === category.industryType);
            const IconComponent = presetInfo?.icon || Layers;
            return (
              <Card
                key={category.id}
                className="border-2 border-border bg-card shadow-sm hover:border-primary/40 transition-colors flex flex-col justify-between"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-lg font-semibold text-foreground truncate">
                          {category.name}
                        </CardTitle>
                        <Badge variant="secondary" className="mt-1 font-mono text-[10px]">
                          {presetInfo?.label || category.industryType}
                        </Badge>
                      </div>
                    </div>
                    {category.isActive ? (
                      <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 shrink-0">
                        Activo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground shrink-0">
                        Inactivo
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-muted-foreground text-xs mt-2 line-clamp-2">
                    {category.description || "Sin descripción registrada."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 space-y-4">
                  <div className="bg-muted/50 rounded-lg p-3 border border-border font-mono text-xs text-foreground overflow-x-auto max-h-28">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1 font-sans">
                      <span className="flex items-center gap-1">
                        <FileCode className="h-3 w-3" /> Esquema de Atributos:
                      </span>
                    </div>
                    <pre className="text-[11px] text-foreground">{category.attributeSchema || "{}"}</pre>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditDialog(category)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(category)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {editingCategory ? "Editar Categoría de Servicio" : "Crear Nueva Categoría de Servicio"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Defina el nombre, tipo de industria y esquema de metadatos dinámicos para este tipo de servicio.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="service-category-name">Nombre de la Categoría</Label>
              <Input
                id="service-category-name"
                placeholder="Ej. Rebobinado de Motores, Mantenimiento Correctivo..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-category-description">Descripción</Label>
              <Input
                id="service-category-description"
                placeholder="Descripción funcional de la categoría..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-category-preset">Preset por Tipo de Industria</Label>
              <Select value={industryType} onValueChange={handlePresetSelect}>
                <SelectTrigger id="service-category-preset">
                  <SelectValue placeholder="Seleccione plantilla de industria" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRY_PRESETS.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-category-schema" className="flex items-center justify-between">
                <span>Esquema de Atributos Personalizados (JSON)</span>
                <span className="text-[10px] font-medium text-primary">Personalizable</span>
              </Label>
              <Textarea
                id="service-category-schema"
                rows={6}
                value={attributeSchema}
                onChange={(e) => setAttributeSchema(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar Categoría"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar categoría de servicio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente{" "}
              <span className="font-semibold text-foreground">{deleteTarget?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}

export default ServiceCategories;
