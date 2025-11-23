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
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const showToast = ({
    title,
    description,
    variant = "default",
    duration = 5000,
  }: {
    title: string;
    description: string;
    variant?: "default" | "destructive";
    duration?: number;
  }) => {
    toast({ title, description, variant, duration });
  };

  const validatePassword = (password: string) => {
    if (password.trim() && password.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres";
    }
    return "";
  };

  const validateConfirmPassword = (password: string, confirm: string) => {
    if (confirm.trim() && password !== confirm) {
      return "Las contraseñas no coinciden";
    }
    return "";
  };

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    const passwordError = validatePassword(value);
    setErrors((prev) => ({ ...prev, newPassword: passwordError }));
    if (confirmPassword.trim()) {
      const confirmError = validateConfirmPassword(value, confirmPassword);
      setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    const confirmError = validateConfirmPassword(newPassword, value);
    setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
  };

  const hasValidPasswords = () => {
    return (
      newPassword.trim() !== "" &&
      confirmPassword.trim() !== "" &&
      !errors.newPassword &&
      !errors.confirmPassword &&
      newPassword === confirmPassword
    );
  };

  const handleReset = async (e: React.FormEvent) => {
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
        }, 3000);
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

  // Lógica de clases dinámica optimizada para dark mode
  const getInputClasses = (hasError: boolean, hasContent: boolean) => {
    return cn(
      "h-10 pr-10 transition-all",
      // Base y Focus
      "border-input focus-visible:ring-2 focus-visible:ring-offset-0",
      // Estados
      hasError
        ? "border-red-500 focus-visible:ring-red-400 dark:border-red-700 dark:focus-visible:ring-red-900"
        : hasContent
        ? "border-green-500 focus-visible:ring-green-400 dark:border-green-700 dark:focus-visible:ring-green-900"
        : "focus-visible:ring-blue-400 dark:focus-visible:ring-blue-800"
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4 dark:bg-background">
      <Card className="w-full max-w-md mx-auto shadow-lg border-border rounded-xl">
        <CardHeader className="p-6 text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
            <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
            Restablecer Contraseña
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            Ingresa y confirma tu nueva contraseña.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          {success ? (
            <div className="text-center space-y-4 py-8 animate-fade-in">
              <PartyPopper className="mx-auto h-16 w-16 text-green-500 dark:text-green-400" />
              <h3 className="text-xl font-semibold text-foreground">
                ¡Contraseña Actualizada!
              </h3>
              <p className="text-muted-foreground">
                Serás redirigido a la página de inicio de sesión en unos
                segundos.
              </p>
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-6">
              {/* Nueva Contraseña */}
              <div className="space-y-2">
                <Label
                  htmlFor="newPassword"
                  className="font-semibold text-foreground"
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
                    className={getInputClasses(
                      !!errors.newPassword,
                      !!newPassword
                    )}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-3">
                    {errors.newPassword ? (
                      <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
                    ) : (
                      newPassword && (
                        <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                      )
                    )}
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
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
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="font-semibold text-foreground"
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
                    className={getInputClasses(
                      !!errors.confirmPassword,
                      !!confirmPassword &&
                        !errors.confirmPassword &&
                        newPassword === confirmPassword
                    )}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-3">
                    {errors.confirmPassword ? (
                      <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
                    ) : (
                      confirmPassword &&
                      newPassword === confirmPassword && (
                        <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                      )
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="text-muted-foreground hover:text-foreground transition-colors"
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
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </form>
          )}
        </CardContent>
        {!success && (
          <CardFooter className="p-6 pt-0">
            <Button
              type="submit"
              onClick={handleReset}
              disabled={loading || !hasValidPasswords()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50"
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