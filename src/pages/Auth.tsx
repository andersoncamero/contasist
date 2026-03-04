import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/useCases/auth";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/molecules/Card";
import { Label } from "@/components/atoms/Label";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";

export const Auth = () => {
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (isAuthenticated) {
    navigate("/");
    return null;
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
    <div className="min-h-screen bg-white flex overflow-hidden">
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
              {mode === "login" ? "Hola," : "Únete a"}
            </h1>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
              {mode === "login" ? "Bienvenido de nuevo" : "ContAsist hoy"}
            </h2>
            <p className="text-slate-500 font-medium">
              {mode === "login"
                ? "Bienvenido de nuevo a tu espacio contable"
                : "Comienza a gestionar tus finanzas de forma profesional"}
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
                    className="pl-10 h-12 bg-slate-50/50 border-slate-200 focus:bg-white rounded-xl transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900 transition-colors">
                  <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4" />
                  <span>Recuérdame</span>
                </label>
                <a href="#" className="font-semibold text-slate-500 hover:text-primary transition-colors">¿Olvidaste tu contraseña?</a>
              </div>

              <Button type="submit" className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all" disabled={isLoading}>
                {isLoading ? "Iniciando..." : "Ingresar"}
              </Button>
            </form>
          ) : (
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
                    className="pl-10 h-12 bg-slate-50/50 border-slate-200 rounded-xl"
                    required
                  />
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
                    className="pl-10 h-12 bg-slate-50/50 border-slate-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 text-base font-bold rounded-xl mt-4" disabled={isLoading}>
                {isLoading ? "Creando cuenta..." : "Registrarse"}
              </Button>
            </form>
          )}

          <div className="mt-8 text-center text-sm">
            <span className="text-slate-500">
              {mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes una cuenta? "}
            </span>
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="font-bold text-primary hover:underline underline-offset-4 decoration-2"
            >
              {mode === "login" ? "Regístrate" : "Inicia sesión"}
            </button>
          </div>
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

      {/* Right Side: Illustration */}
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden bg-slate-50 border-l border-slate-100 p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />

        {/* Decorative clouds / circles */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />

        <div className="relative h-full flex flex-col items-center justify-center">
          {/* Collage Grid */}
          <div className="grid grid-cols-2 gap-6 w-full max-w-2xl animate-in zoom-in duration-1000 px-4">
            <div className="space-y-6">
              <div className="group relative overflow-hidden rounded-2xl shadow-2xl border border-white/20 transform hover:scale-[1.03] transition-all duration-500">
                <img
                  src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=800&auto=format&fit=crop"
                  alt="Contabilidad"
                  className="w-full h-[280px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                  <span className="text-white font-bold text-lg tracking-tight">Contabilidad Precisas</span>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-2xl shadow-2xl border border-white/20 transform hover:scale-[1.03] transition-all duration-500">
                <img
                  src="https://www.edenred.mx/hs-fs/hubfs/Media%20Source%202023%20%20(imagenes%20blog)/Diciembre/Procesos%20de%20gesti%C3%B3n%20administrativa%20qu%C3%A9%20son%20y%20para%20qu%C3%A9%20sirven/que-son-los-procesos-de-gestion-administrativa.png?width=600&height=343&name=que-son-los-procesos-de-gestion-administrativa.png"
                  alt="Administración"
                  className="w-full h-[200px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                  <span className="text-white font-bold text-lg tracking-tight">Gestión Administrativa</span>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-12">
              <div className="group relative overflow-hidden rounded-2xl shadow-2xl border border-white/20 transform hover:scale-[1.03] transition-all duration-500">
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop"
                  alt="Finanzas"
                  className="w-full h-[200px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                  <span className="text-white font-bold text-lg tracking-tight">Análisis Financiero</span>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-2xl shadow-2xl border border-white/20 transform hover:scale-[1.03] transition-all duration-500">
                <img
                  src="https://images.unsplash.com/photo-1543286386-713bdd548da4?q=80&w=800&auto=format&fit=crop"
                  alt="Dashboard"
                  className="w-full h-[280px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                  <span className="text-white font-bold text-lg tracking-tight">Control Total</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center max-w-md animate-in slide-in-from-bottom-8 duration-700">
            <h3 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Solución Integral</h3>
            <p className="text-slate-500 leading-relaxed font-semibold text-lg">
              Gestión contable, financiera y administrativa en un solo lugar. Conecta tus datos y toma el control de tu empresa hoy mismo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
