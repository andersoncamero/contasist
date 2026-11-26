import React, { useState } from "react";
import { DianProviderCard } from "./DianProviderCard";
import { useDianEmail } from "@/useCases/useDianEmail";
import { useDianSessionStatus } from "@/useCases/useDianPortal";
import { DianProvider, formatDianIntervalText } from "@/entities/dian";
import { toast } from "sonner";
import { Activity, Info, Mail } from "lucide-react";
import { DianSessionCard } from "./DianSessionCard";
import { DianMonitorIntervalControl } from "./DianMonitorIntervalControl";
import { FactusConfigCard } from "./FactusConfigCard";

export const DianEmailConfig: React.FC = () => {
  const {
    statusData,
    isStatusLoading,
    getAuthUrlAsync,
    disconnectProviderAsync,
    monitorConfig,
    isMonitorConfigLoading,
    updateMonitorIntervalAsync,
    isUpdatingMonitorInterval,
  } = useDianEmail();

  const { data: sessionStatus } = useDianSessionStatus();

  const [connectingProvider, setConnectingProvider] = useState<DianProvider | null>(null);
  const [disconnectingProvider, setDisconnectingProvider] = useState<DianProvider | null>(null);

  const isAnyConnected = Boolean(
    statusData?.gmail?.authenticated || statusData?.outlook?.authenticated
  );

  const isSessionActive = Boolean(
    sessionStatus?.session.active || monitorConfig?.session_active
  );
  const isMonitoring = Boolean(monitorConfig?.monitoring);

  const intervalMinutes = monitorConfig?.interval_minutes ?? 15;
  const intervalText = formatDianIntervalText(intervalMinutes);

  const handleSaveMonitorInterval = async (minutes: number) => {
    try {
      await updateMonitorIntervalAsync(minutes);
      toast.success(
        `Frecuencia del monitor actualizada a cada ${formatDianIntervalText(minutes)}`
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Error al actualizar el tiempo de monitoreo";
      toast.error(message);
    }
  };

  const handleConnectProvider = async (provider: DianProvider) => {
    setConnectingProvider(provider);
    try {
      const response = await getAuthUrlAsync(provider);
      if (response.auth_url) {
        window.open(response.auth_url, "_blank");
        toast.info("Redirigiendo para autorizar acceso con el proveedor...");
      } else {
        toast.error("No se pudo obtener la URL de autorización");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error al solicitar URL de autorización";
      toast.error(message);
    } finally {
      setConnectingProvider(null);
    }
  };

  const handleDisconnectProvider = async (provider: DianProvider) => {
    setDisconnectingProvider(provider);
    try {
      await disconnectProviderAsync(provider);
      toast.success("Proveedor desconectado correctamente");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error al desconectar el proveedor";
      toast.error(message);
    } finally {
      setDisconnectingProvider(null);
    }
  };

  return (
    <div className="space-y-8">
      <FactusConfigCard />

      <div className="rounded-lg border-2 border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Configuración de Correo DIAN
            </h2>
            <p className="text-sm text-muted-foreground">
              Gestiona las conexiones OAuth2 con los proveedores de correo electrónico (Gmail y Outlook).
            </p>
          </div>
        </div>

        <div className="mt-6">
          {isAnyConnected ? (
            isSessionActive ? (
              <div className="mb-4 flex items-center gap-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                <Activity className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Sesión DIAN activa — monitoreo de correo detenido mientras el token sea válido.</span>
              </div>
            ) : isMonitoring ? (
              <div className="mb-4 flex items-center gap-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Activity className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Monitoreo activo — buscando nuevo token cada {intervalText}.</span>
              </div>
            ) : (
              <div className="mb-4 flex items-center gap-2 rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
                <Info className="h-4 w-4 shrink-0 text-primary" />
                <span>
                  Monitoreo en espera — solicita un nuevo token en el portal DIAN para iniciar la búsqueda automática.
                </span>
              </div>
            )
          ) : (
            <div className="mb-4 flex items-center gap-2 rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
              <Info className="h-4 w-4 shrink-0 text-primary" />
              <span>
                Conecta tu cuenta de correo corporativo para permitir la extracción automatizada de tokens de factura electrónica enviados por la DIAN.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DianProviderCard
              provider="gmail"
              title="Google Gmail"
              status={statusData?.gmail}
              isLoadingStatus={isStatusLoading}
              isConnecting={connectingProvider === "gmail"}
              isDisconnecting={disconnectingProvider === "gmail"}
              onConnect={handleConnectProvider}
              onDisconnect={handleDisconnectProvider}
            />
            <DianProviderCard
              provider="outlook"
              title="Microsoft Outlook"
              status={statusData?.outlook}
              isLoadingStatus={isStatusLoading}
              isConnecting={connectingProvider === "outlook"}
              isDisconnecting={disconnectingProvider === "outlook"}
              onConnect={handleConnectProvider}
              onDisconnect={handleDisconnectProvider}
            />
          </div>

          <DianMonitorIntervalControl
            config={monitorConfig}
            isLoading={isMonitorConfigLoading}
            isSaving={isUpdatingMonitorInterval}
            onSave={handleSaveMonitorInterval}
          />
        </div>
      </div>

      <DianSessionCard />
    </div>
  );
};
