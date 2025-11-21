"use client";

import { useState } from "react";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Lock,
  Loader2,
  PartyPopper,
} from "lucide-react";
// Usamos el toast de shadcn/ui que ya está configurado en el proyecto
import { useToast } from "@/components/ui/use-toast";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast(); // Hook de shadcn/ui

  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // --- LÓGICA DEL COMPONENTE SIN CAMBIOS ---
  const showToast = ({
    title,
    description,
    variant = "default",
    duration = 5000,
  }) => {
    toast({ title, description, variant, duration });
  };

  const validatePassword = (password) => {
    if (password.trim() && password.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres";
    }
    return "";
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (confirmPassword.trim() && password !== confirmPassword) {
      return "Las contraseñas no coinciden";
    }
    return "";
  };

  const handleNewPasswordChange = (value) => {
    setNewPassword(value);
    const passwordError = validatePassword(value);
    setErrors((prev) => ({ ...prev, newPassword: passwordError }));
    if (confirmPassword.trim()) {
      const confirmError = validateConfirmPassword(value, confirmPassword);
      setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    const confirmError = validateConfirmPassword(newPassword, value);
    setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
  };

  const hasValidPasswords = () => {
    return (
      newPassword.trim() &&
      confirmPassword.trim() &&
      !errors.newPassword &&
      !errors.confirmPassword &&
      newPassword === confirmPassword
    );
  };

  const handleReset = async (e) => {
    e.preventDefault();
    const passwordError = validatePassword(newPassword);
    const confirmError = validateConfirmPassword(newPassword, confirmPassword);
    if (passwordError || confirmError) {
      setErrors({ newPassword: passwordError, confirmPassword: confirmError });
      showToast({
        title: "❌ Error de validación",
        description: "Por favor corrige los errores antes de continuar",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        showToast({
          title: "❌ Error al actualizar",
          description: error.message,
          variant: "destructive",
          duration: 6000,
        });
      } else {
        setSuccess(true);
        showToast({
          title: "✅ Contraseña actualizada",
          description: "Tu contraseña ha sido actualizada correctamente",
          duration: 5000,
        });
        setTimeout(() => {
          router.push("/auth");
        }, 3000); // Redirigir a la página de login
      }
    } catch (error) {
      showToast({
        title: "❌ Error inesperado",
        description: "Ocurrió un error al actualizar la contraseña",
        variant: "destructive",
        duration: 6000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para clases de input, similar al componente de Perfil
  const inputClasses = (hasError, hasContent) =>
    `h-10 border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-0
     pr-20
     ${hasError ? "border-red-500 focus-visible:ring-red-400" : ""}
     ${!hasError && hasContent ? "border-green-500 focus-visible:ring-green-400" : ""}`;

  // --- JSX RESPONSIVE ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md mx-auto bg-background shadow-lg border border-gray-200 rounded-xl">
        <CardHeader className="p-6 text-center">
          <Lock className="mx-auto h-10 w-10 text-blue-600 mb-3" />
          <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
            Restablecer Contraseña
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            Ingresa y confirma tu nueva contraseña.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          {success ? (
            <div className="text-center space-y-4 py-8 animate-fade-in">
              <PartyPopper className="mx-auto h-16 w-16 text-green-500" />
              <h3 className="text-xl font-semibold text-foreground">
                ¡Contraseña Actualizada!
              </h3>
              <p className="text-muted-foreground">
                Serás redirigido a la página de inicio de sesión en unos
                segundos.
              </p>
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-6">
              {/* Nueva Contraseña */}
              <div className="space-y-2">
                <Label
                  htmlFor="newPassword"
                  className="font-semibold text-gray-700"
                >
                  Nueva Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={newPassword}
                    onChange={(e) => handleNewPasswordChange(e.target.value)}
                    className={inputClasses(
                      !!errors.newPassword,
                      !!newPassword
                    )}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-3">
                    {errors.newPassword ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      newPassword && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )
                    )}
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-muted-foreground hover:text-gray-700"
                      aria-label={
                        showNewPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                {errors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="font-semibold text-gray-700"
                >
                  Confirmar Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repite tu contraseña"
                    value={confirmPassword}
                    onChange={(e) =>
                      handleConfirmPasswordChange(e.target.value)
                    }
                    className={inputClasses(
                      !!errors.confirmPassword,
                      !!confirmPassword &&
                        !errors.confirmPassword &&
                        newPassword === confirmPassword
                    )}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-3">
                    {errors.confirmPassword ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      confirmPassword &&
                      newPassword === confirmPassword && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="text-muted-foreground hover:text-gray-700"
                      aria-label={
                        showConfirmPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </form>
          )}
        </CardContent>
        {!success && (
          <CardFooter className="p-6">
            <Button
              type="submit"
              onClick={handleReset} // El botón está fuera del form, necesita su propio onClick
              disabled={loading || !hasValidPasswords()}
              className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:text-muted-foreground"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Actualizar Contraseña"
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
