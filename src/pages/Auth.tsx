import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/useCases/auth";
import React, { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, CheckCircle2, ArrowLeft } from "lucide-react";
import { Label } from "@/components/atoms/Label";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { SEO } from "@/components/atoms/SEO";
import { AuthShowcase } from "@/components/organisms/auth/AuthShowcase";

export const Auth = () => {
  const navigate = useNavigate();
  const { login, register, forgotPassword, checkSession, hasCheckedSession, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!hasCheckedSession) {
      void checkSession();
    }
  }, [hasCheckedSession, checkSession]);

  if (hasCheckedSession && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleModeSwitch = () => {
    setShowPassword(false);
    setForgotSent(false);
    setMode(mode === "login" ? "register" : "login");
  };

  const handleOpenForgotPassword = () => {
    setShowPassword(false);
    setForgotEmail(loginEmail);
    setForgotSent(false);
    setForgotMessage("");
    setMode("forgot");
  };

  const handleBackToLogin = () => {
    setShowPassword(false);
    setForgotSent(false);
    setMode("login");
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = forgotEmail.trim();
    if (!trimmedEmail) {
      toast({
        title: "Error",
        description: "Ingresa tu correo electrónico",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const result = await forgotPassword(trimmedEmail);
    setIsLoading(false);

    if (result.success) {
      const confirmation =
        result.message ||
        "Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña";
      setForgotMessage(confirmation);
      setForgotSent(true);
      toast({
        title: "Solicitud enviada",
        description: confirmation,
      });
      return;
    }

    toast({
      title: "Error",
      description: result.error,
      variant: "destructive",
    });
  };

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
      registerName,
      "admin"
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
    <div className="min-h-screen bg-white flex overflow-hidden">
      <SEO title="Iniciar Sesión" description="Accede a tu panel de control de ContAsist." />
      {/* Left Side: Form */}
      <div className="w-full lg:w-[45%] flex flex-col p-8 md:p-12 lg:p-16">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2 mb-12">
          <div className="bg-primary p-2 rounded-lg">
            <img src="/logo-sin.png" alt="Logo" className="h-6 w-6 invert brightness-0" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">ContAsist</span>
        </div>

        {/* Content Container */}
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <div className="space-y-2 mb-8 animate-in fade-in slide-in-from-left-4 duration-500">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 border-none p-0">
              {mode === "login" ? "Hola," : mode === "register" ? "Únete a" : "Recupera"}
            </h1>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
              {mode === "login"
                ? "Bienvenido de nuevo"
                : mode === "register"
                  ? "ContAsist hoy"
                  : "tu contraseña"}
            </h2>
            <p className="text-slate-500 font-medium">
              {mode === "login"
                ? "Bienvenido de nuevo a tu espacio contable"
                : mode === "register"
                  ? "Comienza a gestionar tus finanzas de forma profesional"
                  : "Ingresa tu correo y te enviaremos un enlace temporal para cambiar tu contraseña"}
            </p>
          </div>

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in duration-700">
              <div className="space-y-2">
                <Label htmlFor="login-email">Correo electrónico</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="stanley@gmail.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="pl-10 h-12 bg-slate-50/50 border-slate-200 focus:bg-white rounded-xl transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Contraseña</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-slate-50/50 border-slate-200 focus:bg-white rounded-xl transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900 transition-colors">
                  <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4" />
                  <span>Recuérdame</span>
                </label>
                <button
                  type="button"
                  onClick={handleOpenForgotPassword}
                  className="font-semibold text-slate-500 hover:text-primary transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <Button type="submit" className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all" disabled={isLoading}>
                {isLoading ? "Iniciando..." : "Ingresar"}
              </Button>
            </form>
          ) : mode === "register" ? (
            <form onSubmit={handleRegister} className="space-y-4 animate-in fade-in duration-700">
              <div className="space-y-2">
                <Label htmlFor="register-name">Nombre completo</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Tu nombre aquí"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="pl-10 h-12 bg-slate-50/50 border-slate-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Correo electrónico</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="pl-10 h-12 bg-slate-50/50 border-slate-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Contraseña</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-slate-50/50 border-slate-200 rounded-xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-confirm">Confirmar contraseña</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="register-confirm"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-slate-50/50 border-slate-200 rounded-xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-12 text-base font-bold rounded-xl mt-4" disabled={isLoading}>
                {isLoading ? "Creando cuenta..." : "Registrarse"}
              </Button>
            </form>
          ) : forgotSent ? (
            <div className="space-y-5 animate-in fade-in duration-500">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <span>Revisa tu correo electrónico</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{forgotMessage}</p>
              </div>
              <Button
                type="button"
                onClick={handleBackToLogin}
                className="w-full h-12 text-base font-bold rounded-xl"
              >
                Volver a iniciar sesión
              </Button>
              <button
                type="button"
                onClick={() => setForgotSent(false)}
                className="w-full text-sm font-semibold text-slate-500 hover:text-primary transition-colors"
              >
                Intentar con otro correo
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-5 animate-in fade-in duration-500">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Correo electrónico</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="pl-10 h-12 bg-slate-50/50 border-slate-200 focus:bg-white rounded-xl transition-all"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all"
                disabled={isLoading}
              >
                {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
              </Button>

              <button
                type="button"
                onClick={handleBackToLogin}
                className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver a iniciar sesión</span>
              </button>
            </form>
          )}

          {mode !== "forgot" ? (
            <div className="mt-8 text-center text-sm">
              <span className="text-slate-500">
                {mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes una cuenta? "}
              </span>
              <button
                type="button"
                onClick={handleModeSwitch}
                className="font-bold text-primary hover:underline underline-offset-4 decoration-2"
              >
                {mode === "login" ? "Regístrate" : "Inicia sesión"}
              </button>
            </div>
          ) : null}
        </div>

        {/* Footer info */}
        <div className="mt-auto pt-8 flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-slate-400">
          <span>PLATAFORMA FINANCIERA v2.0</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary transition-colors">SOPORTE</a>
            <a href="#" className="hover:text-primary transition-colors">PRIVACIDAD</a>
          </div>
        </div>
      </div>

      <AuthShowcase />
    </div>
  );
};
