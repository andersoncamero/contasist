import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { FileText, FileX2, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/molecules/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/molecules/Tabs";
import { DianDocument, DianDocumentDirection, DianSyncResult } from "@/entities/dian";
import { useDianDocuments, useDianSessionStatus, useDianSyncDocuments } from "@/useCases/useDianPortal";
import { useBillingConfig, useSyncBillingDocuments } from "@/useCases/useBilling";
import { billingService } from "@/services/billingService";
import { CreditNoteDialog } from "./CreditNoteDialog";
import { formatCurrency } from "@/lib/utils";
import { TableEmptyState } from "@/components/molecules/TableEmptyState";

const saveBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const downloadDocument = async (documentNumber: string, kind: "pdf" | "xml") => {
  try {
    const blob =
      kind === "pdf"
        ? await billingService.downloadDocumentPdf(documentNumber)
        : await billingService.downloadDocumentXml(documentNumber);
    saveBlob(blob, `${documentNumber}.${kind}`);
  } catch (err: unknown) {
    const raw = err instanceof Error ? err.message : `Error al descargar el ${kind.toUpperCase()}`;
    toast.error(raw.length > 250 ? `${raw.slice(0, 250)}...` : raw);
  }
};

const DocumentsTable: React.FC<{ direction: DianDocumentDirection }> = ({ direction }) => {
  const { data: documents, isLoading } = useDianDocuments(direction);
  const [creditNoteTarget, setCreditNoteTarget] = useState<DianDocument | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
        Cargando documentos...
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <TableEmptyState
        icon={FileText}
        title="Sin Documentos Sincronizados"
        description='Usa el botón "Sincronizar documentos" para traer las facturas desde Factus o el portal de la DIAN.'
      />
    );
  }

  const counterpartLabel = direction === "SENT" ? "Cliente" : "Proveedor";

  return (
    <>
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-4 py-2.5 font-semibold">Número</th>
              <th className="px-4 py-2.5 font-semibold">{counterpartLabel}</th>
              <th className="px-4 py-2.5 font-semibold">NIT</th>
              <th className="px-4 py-2.5 font-semibold">Fecha</th>
              <th className="px-4 py-2.5 font-semibold text-right">Total</th>
              <th className="px-4 py-2.5 font-semibold">Estado</th>
              {direction === "SENT" && <th className="px-4 py-2.5 font-semibold text-right">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-4 py-2.5 font-mono text-xs">{doc.documentNumber || "—"}</td>
                <td className="px-4 py-2.5 text-xs">{doc.counterpartName || "—"}</td>
                <td className="px-4 py-2.5 text-xs font-mono">{doc.counterpartNit || "—"}</td>
                <td className="px-4 py-2.5 text-xs">{doc.issueDate || "—"}</td>
                <td className="px-4 py-2.5 text-xs text-right font-semibold">
                  {formatCurrency(doc.totalAmount)}
                </td>
                <td className="px-4 py-2.5 text-xs">{doc.status || "—"}</td>
                {direction === "SENT" && (
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => downloadDocument(doc.documentNumber, "pdf")}
                      >
                        PDF
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => downloadDocument(doc.documentNumber, "xml")}
                      >
                        XML
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-destructive gap-1"
                        onClick={() => setCreditNoteTarget(doc)}
                      >
                        <FileX2 className="h-3.5 w-3.5" />
                        Anular
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
      {creditNoteTarget && (
        <CreditNoteDialog
          document={creditNoteTarget}
          open={creditNoteTarget !== null}
          onOpenChange={(open) => {
            if (!open) setCreditNoteTarget(null);
          }}
        />
      )}
    </>
  );
};

export const DianDocumentsCard: React.FC = () => {
  const { data: status } = useDianSessionStatus();
  const { data: billingConfig } = useBillingConfig();
  const dianSyncMutation = useDianSyncDocuments();
  const billingSyncMutation = useSyncBillingDocuments();
  const [lastSync, setLastSync] = useState<DianSyncResult | null>(null);

  const isFactusReady = Boolean(
    billingConfig?.provider === "factus" && billingConfig?.configured
  );
  const sessionActive = Boolean(status?.session.active);
  const canSync = isFactusReady || sessionActive;
  const isSyncing = billingSyncMutation.isPending || dianSyncMutation.isPending;

  const handleSync = async () => {
    try {
      const result = isFactusReady
        ? await billingSyncMutation.mutateAsync()
        : await dianSyncMutation.mutateAsync();
      setLastSync({
        sentSynced: result.sentSynced,
        receivedSynced: result.receivedSynced,
      });
      toast.success(
        `Sincronización completa: ${result.sentSynced} emitidas, ${result.receivedSynced} recibidas`
      );
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : "Error al sincronizar documentos DIAN";
      toast.error(raw.length > 250 ? `${raw.slice(0, 250)}...` : raw);
    }
  };

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-bold text-foreground">
              Documentos DIAN
            </CardTitle>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canSync || isSyncing}
            onClick={handleSync}
            className="gap-1.5 text-xs"
            title={
              canSync
                ? undefined
                : "Configura Factus o inicia sesión en el portal DIAN primero"
            }
          >
            {isSyncing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Sincronizar documentos
          </Button>
        </div>
        {lastSync && (
          <p className="text-xs text-muted-foreground">
            Última sincronización: <strong className="text-foreground">{lastSync.sentSynced}</strong> emitidas,{" "}
            <strong className="text-foreground">{lastSync.receivedSynced}</strong> recibidas
          </p>
        )}
        {!canSync && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Configura las credenciales de Factus o inicia una sesión en el portal DIAN desde{" "}
            <Link to="/settings" className="underline font-medium">
              Configuración → Integraciones
            </Link>{" "}
            para sincronizar documentos.
          </p>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="SENT">
          <TabsList>
            <TabsTrigger value="SENT">Emitidas</TabsTrigger>
            <TabsTrigger value="RECEIVED">Recibidas</TabsTrigger>
          </TabsList>
          <TabsContent value="SENT" className="mt-4">
            <DocumentsTable direction="SENT" />
          </TabsContent>
          <TabsContent value="RECEIVED" className="mt-4">
            <DocumentsTable direction="RECEIVED" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
