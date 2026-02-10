import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, Building2 } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/UI/Button";
import { Input } from "@/components/UI/Input";
import { ClientDialog } from "@/components/clients/ClientDialog";
import { formatShortDate, generateId } from "@/lib/utils";
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
import { Client } from "@/entities/Client";
import { useClient } from "@/useCase/useClient";
import { toast } from "sonner";

export default function Clients() {
  const {
    clients,
    addClient,
    updateClient,
    deleteClient,
    isLoading,
  } = useClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

 

  const filteredClients = clients.filter(
    (client) =>
      client.name?.toLowerCase().includes(search.toLowerCase()) ||
      client.email?.toLowerCase().includes(search.toLowerCase()) ||
      client.company?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSave = async (data: Omit<Client, "id" | "createdAt">) => {
    if (editingClient) {
      const result = await updateClient(editingClient.id, data);

      if (result.success) {
        toast.success("Cliente actualizado exitosamente");
      } else {
        toast.error(result.error || "Error al actualizar el cliente");
      }
    } else {
      const result = await addClient(data);
      if (result.success) {
        toast.success("Cliente creado exitosamente");
      } else {
        toast.error(result.error || "Error al crear cliente");
      }
    }
    setDialogOpen(false);
    setEditingClient(null);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setDialogOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteClient(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <MainLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="mt-1 text-muted-foreground">
            Gestiona tu base de clientes
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} disabled={isLoading}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email o empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border-2 border-border bg-card rounded-lg">
        <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_auto] gap-4 border-b-2 border-border bg-muted p-4 text-xs font-bold uppercase tracking-wide rounded-t-lg">
          <div>Cliente</div>
          <div>Contacto</div>
          <div>Empresa</div>
          <div>Acciones</div>
        </div>

 {filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">No hay clientes</p>
            <p className="text-muted-foreground">
              Agrega tu primer cliente para comenzar
            </p>
          </div>
        ) : (
          <div className="divide-y-2 divide-border">
            {filteredClients.map((client) => (
              <div key={client.id}>

                <div className="md:hidden p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{client.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Desde {formatShortDate(client.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(client)}
                        disabled={isLoading}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setDeleteId(client.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>{client.email}</p>
                    <p className="text-muted-foreground">{client.phone}</p>
                  </div>
                </div>

                <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_auto] gap-4 p-4 transition-colors hover:bg-accent">
                  <div>
                    <p className="font-bold">{client.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Desde {formatShortDate(client.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">{client.email}</p>
                    <p className="text-sm text-muted-foreground">{client.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(client)}
                      disabled={isLoading}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setDeleteId(client.id)}
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

      <ClientDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingClient(null);
        }}
        client={editingClient}
        onSave={handleSave}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El cliente será eliminado
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
