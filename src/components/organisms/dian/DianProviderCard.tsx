import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/molecules/Card";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { DianProvider, ProviderStatus } from "@/entities/dian";
import { ExternalLink, Loader2, RefreshCw, Unlink } from "lucide-react";

interface DianProviderCardProps {
  provider: DianProvider;
  title: string;
  status?: ProviderStatus;
  isLoadingStatus: boolean;
  isConnecting: boolean;
  isDisconnecting?: boolean;
  onConnect: (provider: DianProvider) => void;
  onDisconnect?: (provider: DianProvider) => void;
}

const GoogleIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const MicrosoftIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 23 23">
    <path fill="#f35325" d="M1 1h10v10H1z" />
    <path fill="#81bc06" d="M12 1h10v10H12z" />
    <path fill="#05a6f0" d="M1 12h10v10H1z" />
    <path fill="#ffba08" d="M12 12h10v10H12z" />
  </svg>
);

export const DianProviderCard: React.FC<DianProviderCardProps> = ({
  provider,
  title,
  status,
  isLoadingStatus,
  isConnecting,
  isDisconnecting = false,
  onConnect,
  onDisconnect,
}) => {
  const getStatusBadge = () => {
    if (isLoadingStatus) {
      return (
        <Badge variant="outline" className="gap-1">
          <RefreshCw className="h-3 w-3 animate-spin" />
          Cargando...
        </Badge>
      );
    }

    if (status?.authenticated) {
      return <Badge variant="success">Conectado</Badge>;
    }

    if (status?.configured) {
      return <Badge variant="secondary">Sin conectar</Badge>;
    }

    return <Badge variant="outline">No disponible en el servidor</Badge>;
  };

  const isButtonDisabled =
    isConnecting || isDisconnecting || isLoadingStatus || status?.configured === false;

  const getButtonText = () => {
    if (status?.configured === false) {
      return "No disponible en el servidor";
    }
    if (status?.authenticated) {
      return `Reconectar con ${title}`;
    }
    return `Conectar con ${title}`;
  };

  return (
    <Card className="flex flex-col justify-between border-2 transition-all hover:border-primary/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/60">
            {provider === "gmail" ? <GoogleIcon /> : <MicrosoftIcon />}
          </div>
          <div>
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {status?.authenticated && status.email
                ? status.email
                : `Proveedor OAuth2 para ${title}`}
            </p>
          </div>
        </div>
        <div>{getStatusBadge()}</div>
      </CardHeader>
      <CardContent className="pt-2 space-y-2">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between"
          disabled={isButtonDisabled}
          onClick={() => onConnect(provider)}
        >
          <span className="flex items-center gap-2">
            {isConnecting && <Loader2 className="h-4 w-4 animate-spin" />}
            {getButtonText()}
          </span>
          {status?.configured !== false && <ExternalLink className="h-4 w-4 opacity-70" />}
        </Button>
        {status?.authenticated && onDisconnect && (
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-center text-destructive hover:text-destructive hover:bg-destructive/10"
            disabled={isButtonDisabled}
            onClick={() => onDisconnect(provider)}
          >
            {isDisconnecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Unlink className="h-4 w-4" />
            )}
            Desconectar
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
