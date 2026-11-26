import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, PlugZap, RefreshCw, Save, Settings2 } from "lucide-react";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/molecules/Card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/molecules/Select";
import { BillingEnvironment, BillingProviderType } from "@/entities/billing";
import {
  useBillingConfig,
  useBillingNumberingRanges,
  useSyncBillingDocuments,
  useTestBillingConnection,
  useUpdateBillingConfig,
} from "@/useCases/useBilling";

export const FactusConfigCard: React.FC = () => {
  const { data: config, isLoading } = useBillingConfig();
  const updateMutation = useUpdateBillingConfig();
  const testMutation = useTestBillingConnection();
  const syncMutation = useSyncBillingDocuments();

  const [provider, setProvider] = useState<BillingProviderType>("factus");
  const [environment, setEnvironment] = useState<BillingEnvironment>("sandbox");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [numberingRangeId, setNumberingRangeId] = useState("0");

  const isFactus = provider === "factus";
  const canLoadRanges = Boolean(config?.configured && config?.provider === "factus");
  const { data: ranges, isFetching: isFetchingRanges } = useBillingNumberingRanges(canLoadRanges);

  useEffect(() => {
    if (!config) return;
    setProvider(config.provider || "factus");
    setEnvironment(config.environment || "sandbox");
    setClientId(config.clientId || "");
    setUsername(config.username || "");
    setNumberingRangeId(String(config.numberingRangeId || 0));
    setClientSecret("");
    setPassword("");
  }, [config]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await updateMutation.mutateAsync({
        provider,
        environment,
        clientId: clientId.trim(),
        clientSecret: clientSecret.trim() || undefined,
        username: username.trim(),
        password: password || undefined,
        numberingRangeId: Number(numberingRangeId) || 0,
      });
      setClientSecret("");
      setPassword("");
      toast.success("Configuración de facturación guardada");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al guardar la configuración";
      toast.error(message);
    }
  };

  const handleTestConnection = async () => {
    try {
      const result = await testMutation.mutateAsync();
      toast.success(result.message || "Conexión con Factus verificada");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "No se pudo conectar con el proveedor";
      toast.error(message);
    }
  };

  const handleSync = async () => {
    try {
      const result = await syncMutation.mutateAsync();
      toast.success(
        `Sincronización completada (${result.provider}): ${result.sentSynced} emitidas, ${result.receivedSynced} recibidas`
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al sincronizar facturas";
      toast.error(message);
    }
  };

  const isBusy =
    isLoading || updateMutation.isPending || testMutation.isPending || syncMutation.isPending;

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Settings2 className="size-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <CardTitle className="text-lg font-bold text-foreground">
                Integración de Facturación (Factus / DIAN)
              </CardTitle>
              <CardDescription className="text-xs">
                Configura el adaptador de facturación electrónica de la empresa activa.
              </CardDescription>
            </div>
          </div>

          {config?.configured ? (
            <Badge variant="success" className="gap-1.5 py-1 px-3">
              <CheckCircle2 className="size-3.5" />
              Configurado ({config.environment === "production" ? "Producción" : "Sandbox"})
            </Badge>
          ) : (
            <Badge variant="secondary">Sin configurar</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="billing-provider">Proveedor de integración</Label>
              <Select
                value={provider}
                onValueChange={(value) => setProvider(value as BillingProviderType)}
                disabled={isBusy}
              >
                <SelectTrigger id="billing-provider">
                  <SelectValue placeholder="Selecciona un proveedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="factus">Factus (Halltec API)</SelectItem>
                    <SelectItem value="dian_portal">Portal DIAN (Solución Gratuita)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="billing-environment">Ambiente</Label>
              <Select
                value={environment}
                onValueChange={(value) => setEnvironment(value as BillingEnvironment)}
                disabled={isBusy || !isFactus}
              >
                <SelectTrigger id="billing-environment">
                  <SelectValue placeholder="Selecciona el ambiente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="sandbox">Sandbox (Pruebas)</SelectItem>
                    <SelectItem value="production">Producción</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isFactus && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="factus-client-id">Client ID</Label>
                  <Input
                    id="factus-client-id"
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="Ingresa tu Client ID de Factus"
                    disabled={isBusy}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="factus-client-secret">Client Secret</Label>
                  <Input
                    id="factus-client-secret"
                    type="password"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    placeholder={
                      config?.hasClientSecret
                        ? "•••••••• (guardado — escribe para reemplazar)"
                        : "Ingresa tu Client Secret"
                    }
                    disabled={isBusy}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="factus-username">Usuario Factus (correo)</Label>
                  <Input
                    id="factus-username"
                    type="email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="sandbox@factus.com.co"
                    disabled={isBusy}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="factus-password">Contraseña Factus</Label>
                  <Input
                    id="factus-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      config?.hasPassword
                        ? "•••••••• (guardada — escribe para reemplazar)"
                        : "Ingresa tu contraseña"
                    }
                    disabled={isBusy}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 md:w-1/2">
                <Label htmlFor="factus-numbering-range">
                  Rango de numeración predeterminado
                </Label>
                {ranges && ranges.length > 0 ? (
                  <Select
                    value={numberingRangeId}
                    onValueChange={setNumberingRangeId}
                    disabled={isBusy || isFetchingRanges}
                  >
                    <SelectTrigger id="factus-numbering-range">
                      <SelectValue placeholder="Selecciona un rango" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="0">Sin rango predeterminado</SelectItem>
                        {ranges.map((r) => (
                          <SelectItem key={r.id} value={String(r.id)}>
                            {r.prefix} ({r.from}–{r.to}) — Actual: {r.current}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="factus-numbering-range"
                    type="number"
                    min={0}
                    value={numberingRangeId}
                    onChange={(e) => setNumberingRangeId(e.target.value)}
                    placeholder="ID de rango (ej. 8)"
                    disabled={isBusy}
                  />
                )}
              </div>
            </>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button type="submit" size="sm" disabled={isBusy} className="gap-1.5">
              {updateMutation.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Save />
              )}
              Guardar configuración
            </Button>

            {isFactus && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isBusy || !config?.configured}
                onClick={handleTestConnection}
                className="gap-1.5"
              >
                {testMutation.isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <PlugZap />
                )}
                Probar conexión
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isBusy || !config?.configured}
              onClick={handleSync}
              className="gap-1.5"
            >
              {syncMutation.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <RefreshCw />
              )}
              Sincronizar facturas
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
