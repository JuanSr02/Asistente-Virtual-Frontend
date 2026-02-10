"use client";

import { useState } from "react";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { resetPasswordSchema } from "@/lib/schemas/reset-password";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const validateForm = () => {
    try {
      resetPasswordSchema.parse({
        newPassword,
        confirmPassword,
      });
      setErrors({ newPassword: "", confirmPassword: "" });
      return true;
    } catch (error: any) {
      if (error.errors) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          if (err.path[0]) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors({
          newPassword: fieldErrors.newPassword || "",
          confirmPassword: fieldErrors.confirmPassword || "",
        });
      }
      return false;
    }
  };

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    // Limpiar error al escribir
    if (errors.newPassword) {
      setErrors((prev) => ({ ...prev, newPassword: "" }));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    // Limpiar error al escribir
    if (errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Error de validación", {
        description: "Por favor corrige los errores antes de continuar.",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        toast.error("Error al actualizar", {
          description: error.message,
        });
      } else {
        setSuccess(true);
        toast.success("Contraseña actualizada", {
          description: "Tu contraseña ha sido actualizada correctamente.",
        });
        setTimeout(() => {
          router.push("/auth");
        }, 3000);
      }
    } catch (error) {
      toast.error("Error inesperado", {
        description: "Ocurrió un error al intentar actualizar la contraseña.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper de estilos consistente con Auth
  const getInputClasses = (hasError: boolean, hasContent: boolean) => {
    return cn(
      "h-10 pr-10 transition-all bg-slate-50/50 dark:bg-slate-900/50",
      "border-input focus-visible:ring-2 focus-visible:ring-offset-0",
      hasError
        ? "border-red-500 focus-visible:ring-red-500 dark:border-red-700"
        : hasContent
          ? "border-green-500 focus-visible:ring-green-500 dark:border-green-600"
          : "focus-visible:ring-blue-400 dark:focus-visible:ring-blue-800"
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4 dark:bg-background animate-in fade-in duration-500">
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
            <div className="text-center space-y-4 py-8 animate-in zoom-in-95 duration-300">
              <PartyPopper className="mx-auto h-16 w-16 text-green-500 dark:text-green-400 animate-bounce" />
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
              disabled={loading || !newPassword || !confirmPassword}
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
