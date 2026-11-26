import { MainLayout } from "@/templates/MainLayout";
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
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/molecules/Select";
import { ClientDialog } from "@/components/organisms/clients/ClientDialog";
import { useClient } from "@/useCases/useClient";
import { Client } from "@/entities/Client";
import { formatShortDate } from "@/lib/utils";
import { Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SEO } from "@/components/atoms/SEO";
import { TableEmptyState } from "@/components/molecules/TableEmptyState";

export const Clients = () => {
  const { clients, addClient, updateClient, deleteClient, isLoading } = useClient();
  const [search, setSearch] = useState("");
  const [personTypeFilter, setPersonTypeFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.Name.toLowerCase().includes(search.toLowerCase()) ||
      client.Email?.toLowerCase().includes(search.toLowerCase()) ||
      client.Company?.toLowerCase().includes(search.toLowerCase());

    const matchesPersonType =
      personTypeFilter === "all" || client.PersonType === personTypeFilter;

    return matchesSearch && matchesPersonType;
  });

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setDialogOpen(true);
  };

  const handleSaveClient = async (data: any) => {
    if (editingClient) {
      const clientID = editingClient.id || editingClient.ID;
      const result = await updateClient(clientID, data);
      if (result.success) {
        toast.success("Cliente actualizado exitosamente");
        setDialogOpen(false);
        setEditingClient(null);
      } else {
        toast.error(`Error al actualizar cliente: ${result.error}`);
      }
    } else {
      const result = await addClient(data);
      if (result.success) {
        toast.success("Cliente creado exitosamente");
        setDialogOpen(false);
        setEditingClient(null);
      } else {
        toast.error(`Error al crear cliente: ${result.error}`);
      }
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      const result = await deleteClient(deleteId);
      if (result.success) {
        toast.success("Cliente eliminado exitosamente");
      } else {
        toast.error(result.error || "Error al eliminar cliente");
      }
      setDeleteId(null);
    }
  };

  return (
    <MainLayout>
      <SEO title="Clientes" description="Administra tus clientes." />
      <div className="page-header">
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="page-subtitle">Gestiona tu base de clientes</p>
        </div>
        <Button
          onClick={() => {
            setEditingClient(null);
            setDialogOpen(true);
          }}
          disabled={isLoading}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email o empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={personTypeFilter} onValueChange={setPersonTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Tipo de persona" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="natural">Persona Natural</SelectItem>
            <SelectItem value="juridica">Persona Jurídica</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredClients.length === 0 ? (
        <TableEmptyState
          icon={Users}
          title="Sin Clientes Registrados"
          description={
            search || personTypeFilter !== "all"
              ? "No se encontraron clientes con los filtros aplicados."
              : "Agrega tu primer cliente para comenzar."
          }
          actionLabel={!search && personTypeFilter === "all" ? "Nuevo Cliente" : undefined}
          actionIcon={Plus}
          onAction={
            !search && personTypeFilter === "all"
              ? () => {
                  setEditingClient(null);
                  setDialogOpen(true);
                }
              : undefined
          }
          actionDisabled={isLoading}
        />
      ) : (
      <div className="border-2 border-border bg-card rounded-lg overflow-hidden shadow-sm">
        <div className="table-header rounded-t-lg hidden md:flex items-center gap-4 px-4 py-3 bg-muted/60 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <div className="flex-1 text-left">Cliente / Empresa</div>
          <div className="flex-1 text-left">Contacto</div>
          <div className="flex-1 text-left">Tipo</div>
          <div className="w-[100px] text-right">Acciones</div>
        </div>

          <div className="divide-y-2 divide-border">
            {filteredClients.map((client) => (
              <div
                key={client.ID}
                className="p-4 transition-colors hover:bg-accent"
              >
                <div className="md:hidden space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold">{client.Company || client.Name}</p>
                      <p className="text-sm text-muted-foreground">
                        Desde {formatShortDate(client.CreatedAt)}
                      </p>
                    </div>
                    <span className="text-xs capitalize px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                      Persona {client.PersonType || 'jurídica'}
                    </span>
                  </div>
                  {client.Company && client.Name && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Contacto:</span>{" "}
                      {client.Name}
                    </p>
                  )}
                  <div className="text-sm text-muted-foreground space-y-1">
                    {client.Email && <p>{client.Email}</p>}
                    {client.Phone && <p>{client.Phone}</p>}
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full border border-border bg-background hover:bg-accent text-foreground"
                      onClick={() => handleEdit(client)}
                      disabled={isLoading}
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-sm"
                      onClick={() => setDeleteId(client.ID)}
                      disabled={isLoading}
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="hidden md:flex gap-4 items-center">
                  <div className="flex-1 flex flex-col justify-center items-start text-left">
                    <p className="font-bold text-sm">{client.Company || client.Name}</p>
                    <p className="text-xs text-muted-foreground">
                      Desde {formatShortDate(client.CreatedAt)}
                    </p>
                  </div>

                  <div className="flex-1 flex flex-col justify-center items-start text-left text-xs text-muted-foreground">
                    <p className="truncate text-foreground font-medium">{client.Name}</p>
                    {client.Email && <p className="truncate">{client.Email}</p>}
                    {client.Phone && <p>{client.Phone}</p>}
                  </div>

                  <div className="flex-1 flex flex-col justify-center items-start text-left">
                    <span className="text-xs capitalize px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                      Persona {client.PersonType || 'jurídica'}
                    </span>
                  </div>

                  <div className="w-[100px] flex gap-2 justify-end items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full border border-border bg-background hover:bg-accent text-foreground"
                      onClick={() => handleEdit(client)}
                      disabled={isLoading}
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-sm"
                      onClick={() => setDeleteId(client.ID)}
                      disabled={isLoading}
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

      <ClientDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingClient(null);
        }}
        client={editingClient}
        onSave={handleSaveClient}
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
};
