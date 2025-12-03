"use client";

import { useState } from "react";
import { supabase } from "@/supabaseClient";
import { Loader2 } from "lucide-react";
import {
  loginSchema,
  registerSchema,
} from "@/lib/schemas/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nombre: "",
    apellido: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error al escribir
    if (errors[field]) {
      setErrors((prev) => {
        const newV = { ...prev };
        delete newV[field];
        return newV;
      });
    }
  };

  const validateForm = () => {
    try {
      if (showForgotPassword) {
        loginSchema.pick({ email: true }).parse({ email: formData.email });
      } else if (isSignUp) {
        registerSchema.parse(formData);
      } else {
        loginSchema.parse({
          email: formData.email,
          password: formData.password,
        });
      }
      setErrors({});
      return true;
    } catch (error: any) {
      if (error.errors) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          if (err.path[0]) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (showForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(
          formData.email,
          { redirectTo: `${window.location.origin}/reset-password` }
        );
        if (error) throw error;
        toast.success("¡Revisa tu email para restablecer tu contraseña!");
        setShowForgotPassword(false);
      } else if (isSignUp) {
        // Verificar existencia previa (opcional pero buena UX)
        const { data: userExists } = await supabase
          .from("users")
          .select("email")
          .eq("email", formData.email)
          .single();

        if (userExists) {
          toast.warning(
            "Este email ya está registrado. Por favor inicia sesión."
          );
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { full_name: `${formData.nombre} ${formData.apellido}` },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;

        if (data.user && data.user.identities?.length === 0) {
          toast.warning(
            "Este email ya está registrado. Por favor inicia sesión."
          );
        } else {
          toast.success("¡Cuenta creada! Revisa tu email para confirmar.");
          setIsSignUp(false);
        }
      } else {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        
        toast.success("¡Bienvenido!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error("Error con Google: " + error.message);
      setLoading(false);
    }
  };

  const renderLoadingSpinner = () => (
    <Loader2 className="h-5 w-5 animate-spin" />
  );

  const inputClasses = (fieldName: string) => {
    const hasError = !!errors[fieldName];
    // @ts-ignore
    const hasContent = !!formData[fieldName];

    return `w-full h-11 px-4 border-2 rounded-lg bg-slate-50/50 dark:bg-slate-900/50 text-foreground text-sm 
     transition-all focus:bg-background dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600
     ${hasError ? "border-red-500 dark:border-red-700" : ""}
     ${!hasError && hasContent ? "border-green-500 dark:border-green-600" : "border-blue-200 dark:border-blue-800"}`;
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 bg-background text-foreground rounded-2xl shadow-2xl overflow-hidden border border-border">
          {/* --- Panel Izquierdo --- */}
          <div className="col-span-1 lg:col-span-2 p-8 flex flex-col justify-between bg-gradient-to-b from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 text-white">
            <div>
              <div className="text-center lg:text-left mb-8">
                <h1 className="text-3xl font-extrabold mb-2">
                  Asistente Virtual
                </h1>
                <p className="text-lg text-indigo-100 dark:text-indigo-200 mb-4">
                  Un soporte académico para estudiantes
                </p>
                <div className="flex justify-center lg:justify-start items-center gap-3 text-sm font-medium text-indigo-200 dark:text-indigo-300">
                  <span>UNSL</span>
                  <span className="text-blue-300 dark:text-blue-400">|</span>
                  <span>Dpto. de Informática</span>
                </div>
              </div>
              <div className="flex justify-center gap-8 mb-8">
                <img
                  src="/logoUNSL.png"
                  alt="Logo UNSL"
                  className="h-16 object-contain"
                />
                <img
                  src="/logoDptoInfo.png"
                  alt="Logo Dpto Informática"
                  className="h-16 object-contain"
                />
              </div>
            </div>

            <div className="mt-auto">
              <button
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full h-11 inline-flex items-center justify-center gap-3 rounded-lg text-sm font-semibold transition-all
                           border-2 border-gray-200 dark:border-gray-700 bg-background text-gray-700 dark:text-gray-200
                           hover:bg-muted hover:shadow-md
                           disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  renderLoadingSpinner()
                ) : (
                  <>
                    <img
                      src="/logoGoogle.png"
                      alt="Google"
                      className="h-5 w-5"
                    />
                    Continuar con Google
                  </>
                )}
              </button>
            </div>
          </div>

          {/* --- Panel Derecho --- */}
          <div className="col-span-1 lg:col-span-3 p-8 flex flex-col justify-center bg-background">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                {showForgotPassword
                  ? "Recuperar Contraseña"
                  : isSignUp
                    ? "Crear Cuenta"
                    : "Iniciar Sesión"}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {showForgotPassword
                  ? "Te enviaremos un enlace de recuperación"
                  : isSignUp
                    ? "Completa tus datos para comenzar"
                    : "Bienvenido de nuevo"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-4">
              {isSignUp && !showForgotPassword && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nombre
                    </label>
                    <div className="relative mt-1">
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) =>
                          handleInputChange("nombre", e.target.value)
                        }
                        className={inputClasses("nombre")}
                        placeholder="Juan"
                      />
                      {errors.nombre && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.nombre}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Apellido
                    </label>
                    <div className="relative mt-1">
                      <input
                        type="text"
                        value={formData.apellido}
                        onChange={(e) =>
                          handleInputChange("apellido", e.target.value)
                        }
                        className={inputClasses("apellido")}
                        placeholder="Pérez"
                      />
                      {errors.apellido && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.apellido}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <div className="relative mt-1">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={inputClasses("email")}
                    placeholder="tu@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              {!showForgotPassword && (
                <div>
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Contraseña
                    </label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPassword(true);
                          setErrors({});
                        }}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    )}
                  </div>
                  <div className="relative mt-1">
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className={inputClasses("password")}
                      placeholder="••••••••"
                    />
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {isSignUp && !showForgotPassword && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirmar Contraseña
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      className={inputClasses("confirmPassword")}
                      placeholder="••••••••"
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 mt-2 inline-flex items-center justify-center rounded-lg text-sm font-semibold text-white 
                           bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-lg hover:from-blue-600 hover:to-indigo-700 
                           dark:from-blue-600 dark:to-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading
                  ? renderLoadingSpinner()
                  : showForgotPassword
                    ? "Enviar enlace"
                    : isSignUp
                      ? "Registrarse"
                      : "Iniciar Sesión"}
              </button>

              <div className="text-center pt-2">
                {showForgotPassword ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setErrors({});
                    }}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Volver a Iniciar Sesión
                  </button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {isSignUp ? "¿Ya tienes cuenta? " : "¿No tienes cuenta? "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setErrors({});
                        setFormData((prev) => ({
                          ...prev,
                          password: "",
                          confirmPassword: "",
                        }));
                      }}
                      className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {isSignUp ? "Inicia Sesión" : "Regístrate"}
                    </button>
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}