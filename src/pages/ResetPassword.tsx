import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { SEO } from "@/components/atoms/SEO";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/useCases/auth";

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const token = searchParams.get("token")?.trim() ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const result = await resetPassword(token, newPassword);
    setIsLoading(false);

    if (result.success) {
      setIsSuccess(true);
      toast({
        title: "Contraseña actualizada",
        description: result.message || "Ya puedes iniciar sesión con tu nueva contraseña.",
      });
      return;
    }

    toast({
      title: "Error",
      description: result.error,
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-6 md:p-12">
      <SEO title="Restablecer Contraseña" description="Crea una nueva contraseña para tu cuenta ContAsist." />

      <div className="flex items-center gap-2">
        <div className="bg-primary p-2 rounded-lg">
          <img src="/logo-sin.png" alt="Logo" className="h-6 w-6 invert brightness-0" />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-800">ContAsist</span>
      </div>

      <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-6 my-8">
        {!token ? (
          <div className="space-y-5 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-slate-900">Enlace inválido</h1>
              <p className="text-sm text-slate-500">
                El enlace de recuperación está incompleto o no contiene un token válido. Solicita uno nuevo desde la pantalla de inicio de sesión.
              </p>
            </div>
            <Button type="button" onClick={() => navigate("/auth")} className="w-full h-12 text-base font-bold rounded-xl">
              Ir a iniciar sesión
            </Button>
          </div>
        ) : isSuccess ? (
          <div className="space-y-5 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-slate-900">¡Contraseña actualizada!</h1>
              <p className="text-sm text-slate-500">
                Tu contraseña se restableció correctamente. Ahora puedes iniciar sesión con tu nueva clave.
              </p>
            </div>
            <Button type="button" onClick={() => navigate("/auth")} className="w-full h-12 text-base font-bold rounded-xl">
              Ir a iniciar sesión
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Restablece tu contraseña</h1>
              <p className="text-sm text-slate-500">
                Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nueva contraseña</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-slate-50/50 border-slate-200 focus:bg-white rounded-xl transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirmar nueva contraseña</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="confirm-new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Repite tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-slate-50/50 border-slate-200 focus:bg-white rounded-xl transition-all"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all"
                disabled={isLoading}
              >
                {isLoading ? "Guardando..." : "Guardar nueva contraseña"}
              </Button>
            </form>

            <div className="text-center">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver a iniciar sesión</span>
              </Link>
            </div>
          </>
        )}
      </div>

      <div className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
        CONTASIST · PLATAFORMA FINANCIERA
      </div>
    </div>
  );
};
