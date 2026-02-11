import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, Package } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/UI/Button";
import { Input } from "@/components/UI/Input";

import { ProductDialog } from "@/components/products/ProductDialog";

import { formatCurrency, generateId } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/UI/AlertDialog";
import { Product } from "@/entities/Product";
import { useProduct } from "@/useCase/useProduct";
import { toast } from "sonner";

export default function Products() {
  const {
    products,
    addProduct,
    deleteProduct,
    updateProduct,
    isLoading,
  } = useProduct();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // React Query fetches automatically on mount

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.category.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSave = async (data: Omit<Product, "id">) => {
    if (editingProduct) {
      const result = await updateProduct(editingProduct.id, data);
      if (result.success) {
        toast.success("Producto actualizado exitosamente");
      } else {
        toast.error(result.error || "Error al actualizar producto");
      }
    } else {
      const result = await addProduct(data);
      if (result.success) {
        toast.success("Producto creado exitosamente");
      } else {
        toast.error(result.error || "Error al crear producto");
      }
    }
    setDialogOpen(false);
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      const result = await deleteProduct(deleteId);
      if (result.success) {
        toast.success("Producto eliminado exitosamente");
      } else {
        toast.error(result.error || "Error al eliminar producto");
      }
      setDeleteId(null);
    }
  };

  return (
    <MainLayout>

      <div className="page-header">
        <div>
          <h1 className="page-title">Catálogo</h1>
          <p className="page-subtitle">
            Productos y servicios disponibles
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} disabled={isLoading}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border-2 border-border bg-card rounded-lg">
        <div className="table-header hidden md:flex gap-4">
          <div className="flex-1 text-left">Producto/Servicio</div>
          <div className="flex-1 text-left">Descripción</div>
          <div className="w-[120px] text-right">Precio</div>
          <div className="w-[100px] text-center">Tipo</div>
          <div className="w-[100px] text-right">Acciones</div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">No hay productos</p>
            <p className="text-muted-foreground">
              Agrega productos o servicios a tu catálogo
            </p>
          </div>
        ) : (
          <div className="divide-y-2 divide-border">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="p-4 transition-colors hover:bg-accent"
              >
                {/* Layout móvil */}
                <div className="md:hidden space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.category}
                      </p>
                    </div>
                    <span className="shrink-0 border-2 border-border px-2 py-1 text-xs font-bold uppercase rounded-lg">
                      {product.isService ? "Servicio" : "Producto"}
                    </span>
                  </div>
                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono font-bold">
                        {formatCurrency(product.price)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        /{product.unit}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(product)}
                        disabled={isLoading}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setDeleteId(product.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Layout desktop */}

                <div className="hidden md:flex gap-4 items-center">
                  <div className="flex-1 text-left">
                    <p className="font-bold">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.category}
                    </p>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                  <div className="w-[120px] text-right">
                    <p className="font-mono font-bold">
                      {formatCurrency(product.price)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      /{product.unit}
                    </p>
                  </div>
                  <div className="w-[100px] text-center">
                    <span className="inline-block border-2 border-border px-2 py-1 text-xs font-bold uppercase rounded-lg">
                      {product.isService ? "Servicio" : "Producto"}
                    </span>
                  </div>
                  <div className="w-[100px] flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(product)}
                      disabled={isLoading}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setDeleteId(product.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProductDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingProduct(null);
        }}
        product={editingProduct}
        onSave={handleSave}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será eliminado
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </MainLayout>
  );
}
