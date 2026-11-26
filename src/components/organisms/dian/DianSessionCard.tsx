import React from "react";
import { Activity, Building2, Clock, ExternalLink, KeyRound, Loader2, ShieldAlert, User } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/molecules/Card";
import { formatDianDateTime } from "@/entities/dian";
import { useStartDianMonitor } from "@/useCases/useDianEmail";
import { useDianSessionStatus } from "@/useCases/useDianPortal";

const DIAN_PORTAL_URL = "https://catalogo-vpfe.dian.gov.co";

const openPortal = (path: string) => {
  window.open(`${DIAN_PORTAL_URL}${path}`, "_blank", "noopener,noreferrer");
};

export const DianSessionCard: React.FC = () => {
  const { data: status, isLoading } = useDianSessionStatus();
  const startMonitorMutation = useStartDianMonitor();

  const sessionActive = Boolean(status?.session.active);

  const handleRequestToken = async (path: string) => {
    openPortal(path);
    try {
      const res = await startMonitorMutation.mutateAsync();
      if (res.session_active) {
        toast.info("Tu token actual sigue siendo válido; sesión DIAN activa.");
      } else if (res.monitoring) {
        toast.info("Monitoreo de correo iniciado. Detectaremos el nuevo token cuando llegue.");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error al iniciar el monitoreo de correo";
      toast.error(message);
    }
  };

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-bold text-foreground">
              Sesión del Portal DIAN
            </CardTitle>
          </div>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : sessionActive ? (
            <Badge variant="success" className="gap-1.5 py-1 px-3">
              <Activity className="h-3.5 w-3.5" />
              Sesión activa
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1.5 py-1 px-3">
              <Clock className="h-3.5 w-3.5" />
              Sin sesión activa
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessionActive ? (
          <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-700 dark:text-emerald-400">
            <p>
              Autenticada: <strong>{formatDianDateTime(status?.session.authenticatedAt)}</strong>
            </p>
            <p>
              Expira: <strong>{formatDianDateTime(status?.session.expiresAt)}</strong>
            </p>
            <p className="mt-1">
              Ya puedes sincronizar los documentos desde la tarjeta "Documentos DIAN".
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              Para activar la sesión, solicita el token directamente en el portal de la DIAN.
              La DIAN enviará el token al correo registrado y el monitor lo capturará
              automáticamente para autenticar la sesión — no necesitas hacer nada más.
            </p>

            <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground">
              <li>Abre el portal de la DIAN según tu tipo de contribuyente.</li>
              <li>Ingresa tus datos y completa el captcha para solicitar el token.</li>
              <li>Espera el correo "Token Acceso DIAN" — el monitor lo detecta solo.</li>
              <li>Esta tarjeta mostrará "Sesión activa" en cuanto el token sea capturado.</li>
            </ol>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={startMonitorMutation.isPending}
                onClick={() => handleRequestToken("/User/CompanyLogin")}
                className="gap-1.5"
              >
                <Building2 className="h-4 w-4" />
                Solicitar token — Empresa
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={startMonitorMutation.isPending}
                onClick={() => handleRequestToken("/User/PersonLogin")}
                className="gap-1.5"
              >
                <User className="h-4 w-4" />
                Solicitar token — Persona natural
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>
          </>
        )}

        {status?.token.available && (status.token.date || status.token.fetched_at) && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <KeyRound className="h-3.5 w-3.5" />
            Último token recibido: <strong className="text-foreground">{formatDianDateTime(status.token.date || status.token.fetched_at)}</strong>
          </p>
        )}
      </CardContent>
    </Card>
  );
};
