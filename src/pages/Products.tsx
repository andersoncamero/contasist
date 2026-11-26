import { useState } from "react";
import { Plus, Search, Pencil, Trash2, Package, Building2, FileSpreadsheet } from "lucide-react";
import { MainLayout } from "@/templates/MainLayout";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { ProductDialog, ProductFormData } from "@/components/organisms/products/ProductDialog";
import { formatCurrency } from "@/lib/utils";
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
import { Product, ItemType } from "@/entities/Product";
import { useProduct } from "@/useCases/useProduct";
import { usePriceList } from "@/useCases/usePriceList";
import { PriceList } from "@/entities/PriceList";
import { PriceListDialog } from "@/components/organisms/priceLists/PriceListDialog";
import { PriceListTable } from "@/components/organisms/priceLists/PriceListTable";
import { toast } from "sonner";
import { SEO } from "@/components/atoms/SEO";
import { TableEmptyState } from "@/components/molecules/TableEmptyState";

export default function Products() {
  const {
    products,
    addProduct,
    deleteProduct,
    updateProduct,
    isLoading: isProductLoading,
  } = useProduct();

  const {
    priceLists,
    addPriceList,
    updatePriceList,
    deletePriceList,
    isLoading: isPriceListLoading,
  } = usePriceList();

  const [activeTab, setActiveTab] = useState<"CATALOG" | "PRICE_LISTS">("CATALOG");

  const [search, setSearch] = useState("");
  const [selectedItemType, setSelectedItemType] = useState<ItemType | "ALL">("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [priceListDialogOpen, setPriceListDialogOpen] = useState(false);
  const [editingPriceList, setEditingPriceList] = useState<PriceList | null>(null);
  const [deletePriceListId, setDeletePriceListId] = useState<number | null>(null);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.Name.toLowerCase().includes(search.toLowerCase()) ||
      product.Category.toLowerCase().includes(search.toLowerCase()) ||
      product.Code.toLowerCase().includes(search.toLowerCase());

    const matchesType =
      selectedItemType === "ALL" ||
      (product.ItemType || (product.IsService ? "SERVICE" : "PIECE")) === selectedItemType;

    return matchesSearch && matchesType;
  });

  const filteredPriceLists = priceLists.filter((pl) => {
    return (
      pl.name.toLowerCase().includes(search.toLowerCase()) ||
      pl.customerName.toLowerCase().includes(search.toLowerCase()) ||
      pl.code.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleSaveProduct = async (data: ProductFormData) => {
    if (editingProduct) {
      const result = await updateProduct(editingProduct.ID, data);
      if (result.success) {
        toast.success("Ítem actualizado exitosamente");
      } else {
        toast.error(result.error || "Error al actualizar ítem");
      }
    } else {
      const result = await addProduct(data);
      if (result.success) {
        toast.success("Ítem creado exitosamente");
      } else {
        toast.error(result.error || "Error al crear ítem");
      }
    }
    setDialogOpen(false);
    setEditingProduct(null);
  };

  const handleSavePriceList = async (data: Omit<PriceList, "id">) => {
    if (editingPriceList) {
      const targetId = editingPriceList.id || (editingPriceList as any).ID;
      const result = await updatePriceList(targetId, data);
      if (result.success) {
        toast.success("Tarifario actualizado exitosamente");
      } else {
        toast.error(result.error || "Error al actualizar tarifario");
      }
    } else {
      const result = await addPriceList(data);
      if (result.success) {
        toast.success("Tarifario creado exitosamente");
      } else {
        toast.error(result.error || "Error al crear tarifario");
      }
    }
    setPriceListDialogOpen(false);
    setEditingPriceList(null);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleEditPriceList = (priceList: PriceList) => {
    setEditingPriceList(priceList);
    setPriceListDialogOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (deleteId) {
      const result = await deleteProduct(deleteId);
      if (result.success) {
        toast.success("Ítem eliminado exitosamente");
      } else {
        toast.error(result.error || "Error al eliminar ítem");
      }
      setDeleteId(null);
    }
  };

  const handleDeletePriceList = async () => {
    if (deletePriceListId) {
      const result = await deletePriceList(deletePriceListId);
      if (result.success) {
        toast.success("Tarifario eliminado exitosamente");
      } else {
        toast.error(result.error || "Error al eliminar tarifario");
      }
      setDeletePriceListId(null);
    }
  };

  const getItemTypeBadge = (type: ItemType | undefined, isService: boolean) => {
    const resolvedType = type || (isService ? "SERVICE" : "PIECE");
    switch (resolvedType) {
      case "PIECE":
        return (
          <span className="inline-flex items-center gap-1 border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-xs font-bold rounded-md">
            PIECE
          </span>
        );
      case "SERVICE":
        return (
          <span className="inline-flex items-center gap-1 border border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 text-xs font-bold rounded-md">
            SERVICE
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <SEO title="Productos y Listas de Precios" description="Catálogo adaptativo multi-tenant y listas de precios por cliente." />
      
      <div className="page-header">
        <div>
          <h1 className="page-title">Catálogo y Listas de Precios</h1>
          <p className="page-subtitle">
            Gestión multi-tenant de productos, servicios y tarifarios por cliente
          </p>
        </div>

        {activeTab === "CATALOG" ? (
          <Button onClick={() => { setEditingProduct(null); setDialogOpen(true); }} disabled={isProductLoading}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Ítem
          </Button>
        ) : (
          <Button onClick={() => { setEditingPriceList(null); setPriceListDialogOpen(true); }} disabled={isPriceListLoading}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Tarifario de Cliente
          </Button>
        )}
      </div>

      <div className="flex items-center border-b border-border mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("CATALOG")}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold text-sm border-b-2 transition-colors ${
            activeTab === "CATALOG"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Package className="h-4 w-4" />
          Catálogo General
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("PRICE_LISTS")}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold text-sm border-b-2 transition-colors ${
            activeTab === "PRICE_LISTS"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="h-4 w-4" />
          Listas de Precios por Cliente
        </button>
      </div>

      {activeTab === "CATALOG" ? (
        <>
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, código o categoría..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border self-start">
              <Button
                type="button"
                variant={selectedItemType === "ALL" ? "default" : "ghost"}
                size="sm"
                className="text-xs h-8"
                onClick={() => setSelectedItemType("ALL")}
              >
                Todos
              </Button>
              <Button
                type="button"
                variant={selectedItemType === "PIECE" ? "default" : "ghost"}
                size="sm"
                className="text-xs h-8"
                onClick={() => setSelectedItemType("PIECE")}
              >
                Productos
              </Button>
              <Button
                type="button"
                variant={selectedItemType === "SERVICE" ? "default" : "ghost"}
                size="sm"
                className="text-xs h-8"
                onClick={() => setSelectedItemType("SERVICE")}
              >
                Servicios
              </Button>
            </div>
          </div>

          {!isProductLoading && filteredProducts.length === 0 ? (
            <TableEmptyState
              icon={Package}
              title="Sin Ítems en el Catálogo"
              description={
                search || selectedItemType !== "ALL"
                  ? "No se encontraron productos o servicios con los filtros aplicados."
                  : "Crea un nuevo producto o servicio adaptativo para tu catálogo."
              }
              actionLabel={!search && selectedItemType === "ALL" ? "Nuevo Ítem" : undefined}
              actionIcon={Plus}
              onAction={
                !search && selectedItemType === "ALL"
                  ? () => {
                      setEditingProduct(null);
                      setDialogOpen(true);
                    }
                  : undefined
              }
            />
          ) : (
          <div className="border-2 border-border bg-card rounded-lg overflow-hidden">
            <div className="table-header rounded-t-lg hidden md:flex gap-4">
              <div className="w-[120px] text-left font-mono">Código</div>
              <div className="flex-1 text-left">Producto / Servicio</div>
              <div className="w-[120px] text-left">Categoría</div>
              <div className="w-[130px] text-right">Precio Base</div>
              <div className="w-[110px] text-center">Tipo</div>
              <div className="w-[100px] text-right">Acciones</div>
            </div>

              <div className="divide-y-2 divide-border">
                {filteredProducts.map((product) => (
                  <div
                    key={product.ID}
                    className="p-4 transition-colors hover:bg-accent/40 space-y-2"
                  >
                    <div className="hidden md:flex gap-4 items-center">
                      <div className="w-[120px] text-left font-mono text-xs font-bold text-muted-foreground">
                        {product.Code || "S/C"}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-bold truncate">{product.Name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {product.Description}
                        </p>
                      </div>
                      <div className="w-[120px] text-left text-xs font-medium">
                        {product.Category}
                      </div>
                      <div className="w-[130px] text-right">
                        <p className="font-bold font-mono text-sm">
                          {formatCurrency(product.BasePrice ?? product.Price ?? 0)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.TaxType || "IVA"} ({product.TaxRate ?? 19}%) / {product.UnitCode || "NIU"}
                        </p>
                      </div>
                      <div className="w-[110px] text-center">
                        {getItemTypeBadge(product.ItemType, product.IsService)}
                      </div>
                      <div className="w-[100px] flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full border border-border bg-background hover:bg-accent text-foreground"
                          onClick={() => handleEditProduct(product)}
                          disabled={isProductLoading}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-sm"
                          onClick={() => setDeleteId(product.ID)}
                          disabled={isProductLoading}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          </div>
          )}
        </>
      ) : (
        <>
          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, nombre de tarifario o código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {!isPriceListLoading && filteredPriceLists.length === 0 ? (
            <TableEmptyState
              icon={FileSpreadsheet}
              title="Sin Tarifarios Registrados"
              description={
                search
                  ? "No se encontraron listas de precios que coincidan con tu búsqueda."
                  : "Crea una lista de precios por cliente (ej: Postobón, PuroPollo)."
              }
              actionLabel={!search ? "Nuevo Tarifario" : undefined}
              actionIcon={Plus}
              onAction={
                !search
                  ? () => {
                      setEditingPriceList(null);
                      setPriceListDialogOpen(true);
                    }
                  : undefined
              }
            />
          ) : (
            <PriceListTable
              priceLists={filteredPriceLists}
              onEdit={handleEditPriceList}
              onDelete={(id) => setDeletePriceListId(id)}
            />
          )}
        </>
      )}

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editingProduct}
        onSave={handleSaveProduct}
      />

      <PriceListDialog
        open={priceListDialogOpen}
        onOpenChange={setPriceListDialogOpen}
        priceList={editingPriceList}
        products={products}
        onSave={handleSavePriceList}
      />

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el producto/servicio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deletePriceListId !== null} onOpenChange={() => setDeletePriceListId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Tarifario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la lista de precios asignada al cliente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePriceList}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
