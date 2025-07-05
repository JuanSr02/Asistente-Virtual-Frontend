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
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, CheckCircle, XCircle, Lock, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

  const showToast = ({
    title,
    description,
    variant = "default",
    duration = 5000,
  }) => {
    toast({
      title,
      description,
      variant,
      duration,
    });
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

    // Re-validar confirmación si ya hay algo escrito
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

    // Validar campos antes de enviar
    const passwordError = validatePassword(newPassword);
    const confirmError = validateConfirmPassword(newPassword, confirmPassword);

    if (passwordError || confirmError) {
      setErrors({
        newPassword: passwordError,
        confirmPassword: confirmError,
      });
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
          router.push("/");
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

  return (
    <div className="min-h-screen bg-white px-4 pt-10 pb-20">
      <Card className="w-full max-w-2xl mx-auto bg-white shadow-lg border border-blue-200 rounded-xl">
        <CardHeader className="px-6 py-5 border-b border-blue-100">
          <CardTitle className="text-xl sm:text-2xl font-bold text-blue-800 flex items-center gap-2">
            <Lock className="w-6 h-6" />
            Restablecer Contraseña
          </CardTitle>
          <CardDescription className="text-sm text-blue-600 mt-1">
            Ingresá tu nueva contraseña
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 py-6">
          {success ? (
            <div className="text-center space-y-4">
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                ✅ ¡Contraseña actualizada con éxito! Serás redirigido...
              </div>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-6">
              {/* Nueva Contraseña */}
              <div className="space-y-3">
                <Label
                  htmlFor="newPassword"
                  className="text-blue-900 font-medium"
                >
                  Nueva Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Ingresa tu nueva contraseña (mínimo 8 caracteres)"
                    value={newPassword}
                    onChange={(e) => handleNewPasswordChange(e.target.value)}
                    className={`h-10 pr-20 border-blue-300 focus:ring-2 focus:ring-blue-400 ${
                      errors.newPassword
                        ? "border-red-500"
                        : newPassword.trim() && !errors.newPassword
                          ? "border-green-500"
                          : ""
                    }`}
                  />
                  <div className="absolute right-3 top-2.5 flex items-center gap-2">
                    {newPassword.trim() && !errors.newPassword && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {errors.newPassword && (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="h-4 w-4 text-blue-400 hover:text-blue-600"
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
                  <p className="text-red-500 text-sm">{errors.newPassword}</p>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div className="space-y-3">
                <Label
                  htmlFor="confirmPassword"
                  className="text-blue-900 font-medium"
                >
                  Confirmar Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repetí tu contraseña"
                    value={confirmPassword}
                    onChange={(e) =>
                      handleConfirmPasswordChange(e.target.value)
                    }
                    className={`h-10 pr-20 border-blue-300 focus:ring-2 focus:ring-blue-400 ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : confirmPassword.trim() &&
                            !errors.confirmPassword &&
                            newPassword === confirmPassword
                          ? "border-green-500"
                          : ""
                    }`}
                  />
                  <div className="absolute right-3 top-2.5 flex items-center gap-2">
                    {confirmPassword.trim() &&
                      !errors.confirmPassword &&
                      newPassword === confirmPassword && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    {errors.confirmPassword && (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="h-4 w-4 text-blue-400 hover:text-blue-600"
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
                  <p className="text-red-500 text-sm">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading || !hasValidPasswords()}
                  className={`w-full h-10 ${
                    hasValidPasswords()
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Actualizando..." : "Actualizar Contraseña"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
