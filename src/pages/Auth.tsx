import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/useCase/auth";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/UI/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/UI/Tabs";
import { Label } from "@/components/UI/Label";
import { Input } from "@/components/UI/Input";
import { Button } from "@/components/UI/Button";

export const Auth = () => {
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    navigate("/");
    return null;
  }

  const togglePasswordVisibility = () => {
    const input = document.getElementById("login-password") || document.getElementById("register-password")
    if (input?.getAttribute("type") === "password") {
      input?.setAttribute("type", "text")
    } else {
      input?.setAttribute("type", "password")
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await login(loginEmail, loginPassword);

    if (result.success) {
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente.",
      });
      navigate("/");
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (registerPassword !== registerConfirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });

      setIsLoading(false);
      return;
    }

    if (registerPassword.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });

      setIsLoading(false);
      return;
    }

    const result = await register(
      registerEmail,
      registerPassword,
      registerName
    );

    if (result.success) {
      toast({
        title: "¡Cuenta creada!",
        description: "Tu cuenta ha sido creada exitosamente.",
      });
      navigate("/");
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center justify-center">
            <img src="/logo.png" alt="ContAsist" className="h-48 w-auto object-contain drop-shadow-2xl" />
          </div>
          <p className="text-muted-foreground text-center">
            Sistema profesional de cotizaciones
          </p>
        </div>

        <Card className="border-2 border-border rounded-lg">
          <Tabs defaultValue="login" className="w-full">
            <CardHeader className="pb-0">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="pt-6">
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Correo electronico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="corre@ejemplo.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10 placeholder:text-gray-500 placeholder:italic"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10 placeholder:text-gray-500"
                        required
                      />
                      <Eye className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" onClick={togglePasswordVisibility} />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Iniciando..." : "Iniciar Sesión"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-0">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nombre completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Juan Pérez"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        className="pl-10 placeholder:text-gray-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Correo electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="pl-10 placeholder:text-gray-500 placeholder:italic"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="pl-10 placeholder:text-gray-500"
                        required
                      />
                      <Eye className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" onClick={togglePasswordVisibility} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm">
                      Confirmar contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-confirm"
                        type="password"
                        placeholder="Repite tu contraseña"
                        value={registerConfirmPassword}
                        onChange={(e) =>
                          setRegisterConfirmPassword(e.target.value)
                        }
                        className="pl-10 placeholder:text-gray-500"
                        required
                      />
                      <Eye className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" onClick={togglePasswordVisibility} />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Conectado a API en Go
        </p>
      </div>
    </div>
  );
};

